import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs, query, orderBy, limit, where, Timestamp, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { NotificationEvent, NotificationCategory } from '../../services/notifications/types';
import { FirebaseError } from 'firebase/app';
import { notificationTemplates } from '../../services/notifications/templates';
import { Select } from '../../components/ui/Select';
import toast from 'react-hot-toast';
import {
  sendPushNotification,
  sendTeamPushNotification
} from '../../services/notifications/pushNotifications';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

// Simple UI components
const TabsList: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`flex space-x-2 border-b ${className}`}>{children}</div>
);

const TabsTrigger: React.FC<{ 
  value: string; 
  active: boolean; 
  onClick: () => void; 
  children: React.ReactNode 
}> = ({ value, active, onClick, children }) => (
  <button
    className={`px-4 py-2 ${active ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
    onClick={onClick}
  >
    {children}
  </button>
);

const TabsContent: React.FC<{ value: string; activeTab: string; children: React.ReactNode }> = ({ 
  value, 
  activeTab, 
  children 
}) => (
  <div className={activeTab === value ? 'block mt-4' : 'hidden'}>{children}</div>
);

const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`bg-white dark:bg-gray-800 border rounded-lg shadow-sm ${className}`}>{children}</div>
);

const CardHeader: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`p-6 border-b ${className}`}>{children}</div>
);

const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-xl font-bold">{children}</h3>
);

const CardDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{children}</p>
);

const CardContent: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const CardFooter: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`p-6 border-t ${className}`}>{children}</div>
);

const Table: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse">{children}</table>
  </div>
);

const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <thead className="bg-gray-50 dark:bg-gray-700">{children}</thead>
);

const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tbody>{children}</tbody>
);

const TableRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tr className="border-b dark:border-gray-700">{children}</tr>
);

const TableHead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
    {children}
  </th>
);

const TableCell: React.FC<{ className?: string; colSpan?: number; children: React.ReactNode }> = ({ 
  className = '', 
  colSpan, 
  children 
}) => (
  <td className={`px-4 py-3 ${className}`} colSpan={colSpan}>
    {children}
  </td>
);

const TableCaption: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <caption className="py-2 text-sm text-gray-500 dark:text-gray-400">{children}</caption>
);

const Badge: React.FC<{ 
  variant?: 'default' | 'success' | 'destructive' | 'blue' | 'green' | 'purple' | 'orange' | 'yellow'; 
  children: React.ReactNode 
}> = ({ variant = 'default', children }) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
    destructive: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
    green: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]}`}>
      {children}
    </span>
  );
};

const Alert: React.FC<{ 
  variant?: 'default' | 'destructive' | 'success'; 
  children: React.ReactNode 
}> = ({ variant = 'default', children }) => {
  const variantClasses = {
    default: 'bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    destructive: 'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-100',
    success: 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100',
  };

  return (
    <div className={`p-4 rounded-md ${variantClasses[variant]}`}>
      {children}
    </div>
  );
};

const AlertTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h5 className="font-medium mb-1">{children}</h5>
);

const AlertDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-sm">{children}</div>
);

interface NotificationHistoryItem {
  id: string;
  title: string;
  body: string;
  type: string;
  category: string;
  sentBy: string;
  sentTo: string | string[];
  sentAt: Timestamp;
  success: boolean;
  deliveredCount?: number;
  totalCount?: number;
}

interface TeamOption {
  id: string;
  name: string;
}

const NotificationAdminPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notificationHistory, setNotificationHistory] = useState<NotificationHistoryItem[]>([]);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [notificationType, setNotificationType] = useState<NotificationEvent>(NotificationEvent.SYSTEM_ANNOUNCEMENT);
  const [targetType, setTargetType] = useState<'user' | 'team'>('user');
  const [targetId, setTargetId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [additionalData, setAdditionalData] = useState('');
  const [bypassUserPreferences, setBypassUserPreferences] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('send');

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        // Check if currentUser.role is directly available (preferred approach)
        if (currentUser.role === 'admin') {
          setIsAdmin(true);
          fetchNotificationHistory();
          fetchTeams();
          return;
        }
        
        // Fallback: query the user document if role is not in the auth object
        const userDoc = await getDocs(query(collection(db, 'users'), where('id', '==', currentUser.id)));
        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data();
          if (userData.role === 'admin') {
            setIsAdmin(true);
            fetchNotificationHistory();
            fetchTeams();
          } else {
            navigate('/unauthorized');
          }
        } else {
          navigate('/unauthorized');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        navigate('/unauthorized');
      }
    };

    checkAdminStatus();
  }, [currentUser, navigate]);

  const fetchNotificationHistory = async () => {
    try {
      const notificationsQuery = query(
        collection(db, 'notification_history'),
        orderBy('sentAt', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(notificationsQuery);
      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NotificationHistoryItem[];
      
      setNotificationHistory(history);
    } catch (error) {
      console.error('Error fetching notification history:', error);
      
      // Provide more specific error messages based on error type
      if (error instanceof FirebaseError) {
        if (error.code === 'permission-denied') {
          setErrorMessage('Permission denied: You need admin privileges to access notification history.');
        } else {
          setErrorMessage(`Firebase error: ${error.message}`);
        }
      } else {
        setErrorMessage('Failed to load notification history');
      }
    }
  };

  const fetchTeams = async () => {
    try {
      const teamsQuery = query(
        collection(db, 'teams'),
        orderBy('name'),
        limit(100)
      );
      
      const snapshot = await getDocs(teamsQuery);
      const teamOptions = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || 'Unnamed Team'
      }));
      
      setTeams(teamOptions);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (!title || !body) {
        setErrorMessage('Title and body are required');
        setLoading(false);
        return;
      }

      let result;
      let parsedAdditionalData = {};
      
      // Try to parse the additional data JSON if provided
      if (additionalData) {
        try {
          parsedAdditionalData = JSON.parse(additionalData);
        } catch (error) {
          setErrorMessage('Invalid JSON in additional data');
          setLoading(false);
          return;
        }
      }
      
      // Convert ALL additional data values to strings
      const stringifiedData: Record<string, string> = {};
      Object.entries(parsedAdditionalData).forEach(([key, value]) => {
        // Ensure all values are strings, including nested objects by stringifying them
        if (value === null) {
          stringifiedData[key] = '';
        } else if (typeof value === 'object') {
          stringifiedData[key] = JSON.stringify(value);
        } else {
          stringifiedData[key] = String(value);
        }
      });

      if (targetType === 'user') {
        if (!targetId) {
          setErrorMessage('User ID is required');
          setLoading(false);
          return;
        }

        // Send notification to individual user
        result = await sendPushNotification(
          targetId,
          notificationType,
          { title, body },
          {
            ...stringifiedData,
            bypassPreferences: bypassUserPreferences ? 'true' : 'false'
          }
        );
      } else {
        if (!selectedTeam) {
          setErrorMessage('Team selection is required');
          setLoading(false);
          return;
        }

        // Get team name from selected team
        const team = teams.find(t => t.id === selectedTeam);
        const teamName = team?.name || 'Team';

        // Send notification to team
        result = await sendTeamPushNotification(
          selectedTeam,
          notificationType,
          { 
            teamName,
            title,
            body
          },
          stringifiedData
        );
      }

      if (result && result.success) {
        setSuccessMessage('Notification sent successfully!');
        toast.success('Notification sent successfully!');
        
        // Refresh notification history
        fetchNotificationHistory();
      } else {
        setErrorMessage(result?.message || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setErrorMessage('An error occurred while sending the notification');
    } finally {
      setLoading(false);
    }
  };

  // Generate a predefined notification template based on the selected type
  const generateTemplate = () => {
    switch (notificationType) {
      case NotificationEvent.GAME_START:
        setTitle('Game Starting Soon!');
        setBody('{{teamName}} vs {{opponent}} is about to begin');
        setAdditionalData(JSON.stringify({ 
          gameId: 'game123',
          opponent: 'Lions',
          location: 'Main Field'
        }, null, 2));
        break;
        
      case NotificationEvent.GAME_END:
        setTitle('Game Result');
        setBody('Final Score: {{teamName}} {{teamScore}} - {{opponent}} {{opponentScore}}');
        setAdditionalData(JSON.stringify({ 
          gameId: 'game123',
          teamScore: '5',
          opponent: 'Lions',
          opponentScore: '3'
        }, null, 2));
        break;
        
      case NotificationEvent.PRACTICE_REMINDER:
        setTitle('Practice Reminder');
        setBody('{{teamName}} practice today at {{time}}');
        setAdditionalData(JSON.stringify({ 
          practiceId: 'practice123',
          time: '4:00 PM',
          location: 'Training Field',
          timeUntil: '1 hour'
        }, null, 2));
        break;
        
      case NotificationEvent.NEW_MESSAGE:
        setTitle('New Message');
        setBody('You have a new message from {{senderName}}');
        setAdditionalData(JSON.stringify({ 
          senderName: 'Coach Smith',
          messageId: 'msg123',
          conversationId: 'conv456'
        }, null, 2));
        break;
        
      case NotificationEvent.TEAM_UPDATE:
        setTitle('Team Update');
        setBody('Important update for {{teamName}}');
        setAdditionalData(JSON.stringify({ 
          updateType: 'schedule',
          priority: 'high'
        }, null, 2));
        break;
        
      default:
        setTitle('');
        setBody('');
        setAdditionalData('');
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case NotificationCategory.GAME:
        return <Badge variant="blue">Game</Badge>;
      case NotificationCategory.PRACTICE:
        return <Badge variant="green">Practice</Badge>;
      case NotificationCategory.MESSAGE:
        return <Badge variant="purple">Message</Badge>;
      case NotificationCategory.TEAM:
        return <Badge variant="orange">Team</Badge>;
      case NotificationCategory.HOMEWORK:
        return <Badge variant="yellow">Homework</Badge>;
      default:
        return <Badge>System</Badge>;
    }
  };

  if (!isAdmin) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Notification Administration</h1>
      
      <div>
        <div className="flex space-x-2 border-b mb-4">
          <button
            className={`px-4 py-2 ${activeTab === 'send' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('send')}
          >
            Send Notifications
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'history' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('history')}
          >
            Notification History
          </button>
        </div>
        
        <div className={activeTab === 'send' ? 'block' : 'hidden'}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Send Notification</CardTitle>
                <CardDescription>
                  Send push notifications to users or teams
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendNotification} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Target Type</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          className="mr-2"
                          checked={targetType === 'team'}
                          onChange={() => setTargetType('team')}
                        />
                        Team
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          className="mr-2"
                          checked={targetType === 'user'}
                          onChange={() => setTargetType('user')}
                        />
                        Individual User
                      </label>
                    </div>
                  </div>
                  
                  {targetType === 'team' ? (
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Team</label>
                      <Select 
                        value={selectedTeam}
                        onChange={(e) => setSelectedTeam(e.target.value)}
                        required
                      >
                        <option value="">Select a team</option>
                        {teams.map(team => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium mb-2">User ID</label>
                      <Input 
                        value={targetId}
                        onChange={(e) => setTargetId(e.target.value)}
                        placeholder="Enter user ID"
                        required
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Notification Type</label>
                    <Select 
                      value={notificationType}
                      onChange={(e) => setNotificationType(e.target.value as NotificationEvent)}
                      required
                    >
                      <option disabled>Practice Notifications</option>
                      <option value={NotificationEvent.PRACTICE_REMINDER}>Practice Reminder</option>
                      <option value={NotificationEvent.PRACTICE_CANCELED}>Practice Canceled</option>
                      
                      <option disabled>Game Notifications</option>
                      <option value={NotificationEvent.GAME_REMINDER}>Game Reminder</option>
                      <option value={NotificationEvent.GAME_START}>Game Start</option>
                      <option value={NotificationEvent.GAME_END}>Game End</option>
                      
                      <option disabled>Message Notifications</option>
                      <option value={NotificationEvent.NEW_MESSAGE}>New Message</option>
                      <option value={NotificationEvent.NEW_TEAM_MESSAGE}>Team Message</option>
                      
                      <option disabled>Team Notifications</option>
                      <option value={NotificationEvent.TEAM_UPDATE}>Team Update</option>
                      
                      <option disabled>Homework Notifications</option>
                      <option value={NotificationEvent.HOMEWORK_ASSIGNED}>Homework Assigned</option>
                      <option value={NotificationEvent.HOMEWORK_DUE}>Homework Due</option>
                    </Select>
                    
                    <div className="mt-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={generateTemplate}
                      >
                        Generate Template
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <Input 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Notification title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Body</label>
                    <Input 
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Notification body"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Additional Data (JSON)
                      <span className="text-xs text-gray-500 ml-2 font-normal">Optional</span>
                    </label>
                    <textarea
                      className="w-full p-2 border rounded-md min-h-[100px] font-mono text-sm"
                      value={additionalData}
                      onChange={(e) => setAdditionalData(e.target.value)}
                      placeholder='{"key": "value"}'
                    />
                  </div>
                  
                  {/* Bypass User Preferences Toggle */}
                  {targetType === 'user' && (
                    <div className="mb-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="bypass-preferences"
                          checked={bypassUserPreferences}
                          onChange={(e) => setBypassUserPreferences(e.target.checked)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <label htmlFor="bypass-preferences" className="text-sm text-gray-700">
                          Bypass user notification preferences
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Send notification even if the user has disabled push notifications. Use for critical messages only.
                      </p>
                    </div>
                  )}
                  
                  {errorMessage && (
                    <Alert variant="destructive">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                  )}
                  
                  {successMessage && (
                    <Alert variant="success">
                      <AlertTitle>Success</AlertTitle>
                      <AlertDescription>{successMessage}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Sending...' : 'Send Notification'}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Notification Preview</CardTitle>
                <CardDescription>
                  Preview how your notification will appear
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg border shadow-sm max-w-md mx-auto">
                  <div className="flex items-start mb-4">
                    <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                      <span className="text-lg">BC</span>
                    </div>
                    <div className="ml-3">
                      <div className="font-semibold">{title || 'Notification Title'}</div>
                      <div className="text-xs text-gray-500">now</div>
                    </div>
                  </div>
                  <div className="text-sm">
                    {body || 'Notification body text will appear here'}
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-medium mb-3">Tips for effective notifications:</h3>
                  <ul className="text-sm space-y-2 list-disc pl-5">
                    <li>Keep titles short and descriptive (under 50 characters)</li>
                    <li>Be specific in the body text (70-90 characters optimal)</li>
                    <li>Include personalization using variables</li>
                    <li>Make the action required clear</li>
                    <li>Test on multiple devices before sending widely</li>
                  </ul>
                </div>
                
                <div className="mt-6 bg-blue-50 dark:bg-blue-900 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Variable Placeholders</h3>
                  <p className="text-sm mb-2">
                    You can use the following variables in your notification text:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>{'{{teamName}}'}</div>
                    <div>{'{{opponent}}'}</div>
                    <div>{'{{time}}'}</div>
                    <div>{'{{timeUntil}}'}</div>
                    <div>{'{{location}}'}</div>
                    <div>{'{{senderName}}'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className={activeTab === 'history' ? 'block' : 'hidden'}>
          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
              <CardDescription>
                Recent notifications sent from the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>A list of recent notifications</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Delivered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notificationHistory.length > 0 ? (
                    notificationHistory.map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell>
                          {notification.sentAt.toDate().toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">{notification.title}</TableCell>
                        <TableCell>
                          {getCategoryBadge(notification.category)}
                        </TableCell>
                        <TableCell>
                          {typeof notification.sentTo === 'string' 
                            ? `User: ${notification.sentTo.substring(0, 8)}...` 
                            : `Team: ${Array.isArray(notification.sentTo) 
                                ? `${notification.sentTo.length} users` 
                                : 'Unknown'}`
                          }
                        </TableCell>
                        <TableCell>
                          {notification.success 
                            ? <Badge variant="success">Success</Badge> 
                            : <Badge variant="destructive">Failed</Badge>
                          }
                        </TableCell>
                        <TableCell>
                          {notification.deliveredCount !== undefined && notification.totalCount !== undefined
                            ? `${notification.deliveredCount}/${notification.totalCount}`
                            : 'N/A'
                          }
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No notification history found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                onClick={fetchNotificationHistory}
                disabled={loading}
              >
                Refresh History
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotificationAdminPage; 