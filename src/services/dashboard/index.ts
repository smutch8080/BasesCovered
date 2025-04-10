import { collection, query, where, getDocs, orderBy, limit, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User } from '../../types/auth';
import { handleDashboardError } from './errors';
import { transformSession, transformMessage, transformActivity } from './transformers';

export async function fetchDashboardData(currentUser: User) {
  if (!currentUser) {
    console.log('No user found, returning null');
    return null;
  }

  try {
    console.log('Starting dashboard data fetch for user:', {
      userId: currentUser.id,
      role: currentUser.role,
      teams: currentUser.teams?.length || 0
    });

    // Default empty structures for safety
    const sessions = [];
    const messages = [];
    const activities = [];
    const teams = [];
    const pendingRequests = [];

    try {
      // Get teams and pending requests
      const teamsRef = collection(db, 'teams');

      // Load all teams to check for pending requests
      console.log('Fetching teams for pending requests...');
      const teamsQuery = query(teamsRef);
      const teamsSnapshot = await getDocs(teamsQuery);

      teamsSnapshot.forEach(doc => {
        try {
          const teamData = doc.data();
          
          // Check for pending requests
          const pendingRequest = teamData.joinRequests?.find(
            (request: any) => 
              request?.userId === currentUser.id && 
              request?.status === 'pending'
          );

          if (pendingRequest) {
            console.log('Found pending request:', {
              teamId: doc.id,
              teamName: teamData.name,
            });

            pendingRequests.push({
              teamId: doc.id,
              teamName: teamData.name || 'Unknown Team',
              status: 'pending',
              createdAt: pendingRequest.createdAt?.toDate() || new Date()
            });
          }

          // If user is a member of this team, add to teams array
          if (Array.isArray(currentUser.teams) && currentUser.teams.includes(doc.id)) {
            teams.push({
              id: doc.id,
              ...teamData,
              name: teamData.name || 'Unknown Team',
              createdAt: teamData.createdAt?.toDate() || new Date(),
              updatedAt: teamData.updatedAt?.toDate() || new Date()
            });
          }
        } catch (teamError) {
          console.error(`Error processing team ${doc.id}:`, teamError);
        }
      });
    } catch (teamsError) {
      console.error('Error fetching teams:', teamsError);
    }

    // Get events for next 7 days
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      // Only proceed if there are teams
      if (Array.isArray(currentUser.teams) && currentUser.teams.length > 0) {
        // Process teams in batches of 10 (Firestore limitation)
        const teamIds = [...new Set([...teams.map(t => t.id), ...currentUser.teams])].filter(Boolean);
        
        for (let i = 0; i < teamIds.length; i += 10) {
          try {
            const teamBatch = teamIds.slice(i, i + 10);
            if (teamBatch.length === 0) continue;
            
            // Get events for next 7 days
            try {
              const eventsRef = collection(db, 'events');
              const eventsQuery = query(
                eventsRef,
                where('teamId', 'in', teamBatch),
                where('startDate', '>=', Timestamp.fromDate(today)),
                where('startDate', '<', Timestamp.fromDate(nextWeek)),
                orderBy('startDate', 'asc')
              );

              const eventsSnapshot = await getDocs(eventsQuery);
              eventsSnapshot.forEach(doc => {
                try {
                  const eventData = doc.data();
                  sessions.push(transformSession(doc.id, eventData));
                } catch (eventError) {
                  console.error(`Error transforming event ${doc.id}:`, eventError);
                }
              });
            } catch (eventsError) {
              console.error(`Error fetching events for batch ${i}:`, eventsError);
            }

            // Get latest messages
            try {
              const messagesRef = collection(db, 'messages');
              const messagesQuery = query(
                messagesRef,
                where('teamId', 'in', teamBatch),
                orderBy('createdAt', 'desc'),
                limit(3)
              );
              
              const messagesSnapshot = await getDocs(messagesQuery);
              messagesSnapshot.forEach(doc => {
                try {
                  const messageData = doc.data();
                  messages.push(transformMessage(doc.id, messageData));
                } catch (messageError) {
                  console.error(`Error transforming message ${doc.id}:`, messageError);
                }
              });
            } catch (messagesError) {
              console.error(`Error fetching messages for batch ${i}:`, messagesError);
            }

            // Get recent activities
            try {
              const activitiesRef = collection(db, 'activities');
              const activitiesQuery = query(
                activitiesRef,
                where('teamId', 'in', teamBatch),
                orderBy('timestamp', 'desc'),
                limit(10)
              );

              const activitiesSnapshot = await getDocs(activitiesQuery);
              activitiesSnapshot.forEach(doc => {
                try {
                  const activityData = doc.data();
                  activities.push(transformActivity(doc.id, activityData));
                } catch (activityError) {
                  console.error(`Error transforming activity ${doc.id}:`, activityError);
                }
              });
            } catch (activitiesError) {
              console.error(`Error fetching activities for batch ${i}:`, activitiesError);
            }
          } catch (batchError) {
            console.error(`Error processing batch ${i}:`, batchError);
          }
        }
      }
    } catch (dataError) {
      console.error('Error fetching dashboard data:', dataError);
    }

    console.log('Dashboard data fetch complete:', {
      sessionsCount: sessions.length,
      messagesCount: messages.length,
      activitiesCount: activities.length,
      teamsCount: teams.length,
      pendingRequestsCount: pendingRequests.length
    });

    // Safely sort arrays with fallbacks
    const sortedSessions = sessions.length ? 
      sessions.sort((a, b) => (a.startTime?.getTime() || 0) - (b.startTime?.getTime() || 0)) : 
      [];
      
    const sortedMessages = messages.length ? 
      messages.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)).slice(0, 3) : 
      [];
      
    const sortedActivities = activities.length ? 
      activities.sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0)) : 
      [];

    return {
      sessions: sortedSessions,
      messages: sortedMessages,
      activities: sortedActivities,
      teams,
      pendingRequests
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return handleDashboardError(error, {
      sessions: [],
      messages: [],
      activities: [],
      teams: [],
      pendingRequests: []
    });
  }
}