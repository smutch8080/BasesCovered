import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, getDoc, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Message, Conversation, TeamChat } from '../types/messages';
import { useAuth } from '../contexts/AuthContext';
import { MessageList } from '../components/messages/MessageList';
import { MessageInput } from '../components/messages/MessageInput';
import { ConversationList } from '../components/messages/ConversationList';
import { NewConversationDialog } from '../components/messages/NewConversationDialog';
import { TeamMessageDialog } from '../components/messages/TeamMessageDialog';
import { Users, Plus, ArrowLeft, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

function MessagesPage() {
  const { conversationId, teamId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState<(Conversation | TeamChat)[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showTeamMessageDialog, setShowTeamMessageDialog] = useState(false);
  const [showConversations, setShowConversations] = useState(true);
  const [currentConversation, setCurrentConversation] = useState<Conversation | TeamChat | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    // Load both direct conversations and team chats
    const loadConversations = async () => {
      try {
        // Load direct conversations
        const conversationsRef = collection(db, 'conversations');
        const q = query(
          conversationsRef,
          where('participants', 'array-contains', currentUser.id),
          orderBy('updatedAt', 'desc')
        );

        // Load team chats
        const teamChatsRef = collection(db, 'team_chats');
        let teamChatsQuery;
        
        if (currentUser.teams?.length) {
          teamChatsQuery = query(
            teamChatsRef,
            where('teamId', 'in', currentUser.teams),
            orderBy('updatedAt', 'desc')
          );
        }

        // Subscribe to both conversations and team chats
        const unsubscribeConversations = onSnapshot(q, async (snapshot) => {
          const loadedConversations: Conversation[] = [];
          
          for (const conversationDoc of snapshot.docs) {
            const data = conversationDoc.data();
            
            // Get participant details
            const participantDetails = await Promise.all(
              data.participants.map(async (participantId: string) => {
                if (participantId === currentUser.id) {
                  return {
                    id: currentUser.id,
                    displayName: currentUser.displayName
                  };
                }
                
                const userRef = doc(db, 'users', participantId);
                const userDoc = await getDoc(userRef);
                
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  return {
                    id: userDoc.id,
                    displayName: userData.displayName
                  };
                }
                return {
                  id: participantId,
                  displayName: 'Unknown User'
                };
              })
            );

            loadedConversations.push({
              ...data,
              id: conversationDoc.id,
              participantDetails,
              lastMessage: data.lastMessage ? {
                ...data.lastMessage,
                createdAt: data.lastMessage.createdAt.toDate()
              } : undefined,
              updatedAt: data.updatedAt.toDate()
            } as Conversation);
          }

          // If we have team chats query, load them too
          let teamChats: TeamChat[] = [];
          if (teamChatsQuery) {
            const teamChatsSnapshot = await getDocs(teamChatsQuery);
            teamChats = teamChatsSnapshot.docs.map(doc => {
              const data = doc.data();
              return {
                ...data,
                id: doc.id,
                lastMessage: data.lastMessage ? {
                  ...data.lastMessage,
                  createdAt: data.lastMessage.createdAt.toDate()
                } : undefined,
                updatedAt: data.updatedAt.toDate()
              } as TeamChat;
            });
          }

          // Combine and sort all conversations
          const allConversations = [...loadedConversations, ...teamChats].sort((a, b) => 
            (b.lastMessage?.createdAt.getTime() || b.updatedAt.getTime()) - 
            (a.lastMessage?.createdAt.getTime() || a.updatedAt.getTime())
          );

          setConversations(allConversations);
        });

        return () => {
          unsubscribeConversations();
        };
      } catch (error) {
        console.error('Error loading conversations:', error);
        toast.error('Unable to load conversations');
      }
    };

    loadConversations();
  }, [currentUser]);

  useEffect(() => {
    if (!teamId && !conversationId || !currentUser) return;

    setIsLoading(true);
    console.log('Loading messages for:', teamId ? `team ${teamId}` : `conversation ${conversationId}`);

    // Determine the correct chatId and query
    const messagesRef = collection(db, 'messages');
    let q;

    if (teamId) {
      // For team messages, first get the team chat
      const loadTeamChat = async () => {
        try {
          const teamChatsRef = collection(db, 'team_chats');
          const chatQuery = query(
            teamChatsRef,
            where('teamId', '==', teamId)
          );
          
          const chatSnapshot = await getDocs(chatQuery);
          if (!chatSnapshot.empty) {
            const chatDoc = chatSnapshot.docs[0];
            const chatId = chatDoc.id;
            
            // Now query messages for this chat
            q = query(
              messagesRef,
              where('chatId', '==', chatId),
              orderBy('createdAt', 'asc')
            );
            
            subscribeToMessages(q);
          } else {
            setMessages([]);
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Error loading team chat:', error);
          toast.error('Failed to load team messages');
          setIsLoading(false);
        }
      };

      loadTeamChat();
    } else if (conversationId) {
      // For direct messages
      q = query(
        messagesRef,
        where('chatId', '==', conversationId),
        orderBy('createdAt', 'asc')
      );
      
      subscribeToMessages(q);
    }

    // Find current conversation
    const conversation = conversations.find(c => 
      teamId ? 'teamId' in c && c.teamId === teamId : c.id === conversationId
    );
    setCurrentConversation(conversation || null);

    // Hide conversation list on mobile when viewing messages
    setShowConversations(false);

  }, [teamId, conversationId, currentUser, conversations]);

  const subscribeToMessages = (q: any) => {
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        loadedMessages.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt.toDate()
        } as Message);
      });
      console.log('Loaded messages:', loadedMessages);
      setMessages(loadedMessages);
      setIsLoading(false);
    });

    return unsubscribe;
  };

  const handleSendMessage = async (content: string) => {
    if (!currentUser || !content.trim()) return;

    try {
      // Create message data without teamId for direct messages
      const messageData: any = {
        chatId: conversationId || currentConversation?.id,
        content: content.trim(),
        senderId: currentUser.id,
        senderName: currentUser.displayName,
        createdAt: Timestamp.now(),
        readBy: [currentUser.id]
      };

      // Only add teamId for team messages
      if (teamId) {
        messageData.teamId = teamId;
      }

      // Add the message
      await addDoc(collection(db, 'messages'), messageData);

      // Update conversation/chat with last message
      const lastMessage = {
        content: content.trim(),
        senderId: currentUser.id,
        senderName: currentUser.displayName,
        createdAt: Timestamp.now()
      };

      if (teamId) {
        // Update team chat
        const chatRef = doc(db, 'team_chats', currentConversation!.id);
        await updateDoc(chatRef, {
          lastMessage,
          updatedAt: Timestamp.now()
        });
      } else if (conversationId) {
        // Update direct conversation
        const conversationRef = doc(db, 'conversations', conversationId);
        await updateDoc(conversationRef, {
          lastMessage,
          updatedAt: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleNewConversation = (newConversationId: string) => {
    navigate(`/messages/${newConversationId}`);
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Please sign in to view messages</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-brand-primary" />
          <h1 className="text-3xl font-bold text-gray-800">Messages</h1>
        </div>

        <div className="flex items-center gap-4">
          {currentUser.role === 'coach' && currentUser.teams?.length > 0 && (
            <button
              onClick={() => setShowTeamMessageDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg
                hover:bg-gray-700 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden md:inline">Team Message</span>
            </button>
          )}
          <button
            onClick={() => setShowNewDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
              hover:opacity-90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">New Message</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex h-[600px] relative">
          {/* Mobile back button */}
          {(conversationId || teamId) && !showConversations && (
            <button
              onClick={() => setShowConversations(true)}
              className="md:hidden absolute top-4 left-4 z-10 p-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}

          {/* Conversation List */}
          <div className={`${showConversations ? 'block' : 'hidden'} md:block w-full md:w-auto`}>
            <ConversationList
              conversations={conversations}
              activeId={teamId || conversationId}
              onClose={() => setShowConversations(false)}
            />
          </div>
          
          {/* Message View */}
          <div className={`${!showConversations ? 'block' : 'hidden'} md:block flex-1 flex flex-col`}>
            {teamId || conversationId ? (
              isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-600">Loading messages...</p>
                </div>
              ) : (
                <>
                  <MessageList
                    messages={messages}
                    isTeamChat={!!teamId}
                  />
                  <MessageInput onSendMessage={handleSendMessage} />
                </>
              )
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 p-4 text-center">
                Select a conversation or start a new one
              </div>
            )}
          </div>
        </div>
      </div>

      <NewConversationDialog
        isOpen={showNewDialog}
        onClose={() => setShowNewDialog(false)}
        currentUserId={currentUser.id}
        onConversationCreated={handleNewConversation}
      />

      <TeamMessageDialog
        isOpen={showTeamMessageDialog}
        onClose={() => setShowTeamMessageDialog(false)}
        teamId={teamId}
        teamName={currentConversation?.teamName}
      />
    </div>
  );
}

export default MessagesPage;