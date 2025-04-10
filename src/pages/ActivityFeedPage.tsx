import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, Clock, BookOpen, ListTodo, Award, 
  MessageSquare, Users, Bell, Filter, 
  ThumbsUp, MessageCircle, Share2, MapPin 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ActivityItem {
  id: string;
  type: 'event' | 'homework' | 'todo' | 'award' | 'message' | 'team_update';
  title: string;
  description: string;
  teamId?: string;
  teamName?: string;
  timestamp: Date;
  metadata?: any;
  likes: number;
  comments: {
    id: string;
    author: string;
    content: string;
    timestamp: Date;
  }[];
}

function ActivityFeedPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'events' | 'homework' | 'todos' | 'awards'>('all');
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadActivities = async () => {
      // Ensure user is authenticated and has teams
      if (!currentUser) {
        setError('Please sign in to view your activity feed');
        setIsLoading(false);
        return;
      }

      if (!currentUser.teams?.length) {
        setError('Join a team to see activities in your feed');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const allActivities: ActivityItem[] = [];

        // Process teams in batches of 10 (Firestore limitation)
        for (let i = 0; i < currentUser.teams.length; i += 10) {
          const teamBatch = currentUser.teams.slice(i, i + 10);

          // Fetch events
          const eventsRef = collection(db, 'events');
          const eventsQuery = query(
            eventsRef,
            where('teamId', 'in', teamBatch),
            orderBy('startDate', 'desc'),
            limit(10)
          );
          
          const eventsSnapshot = await getDocs(eventsQuery);
          eventsSnapshot.forEach(doc => {
            const data = doc.data();
            allActivities.push({
              id: doc.id,
              type: 'event',
              title: data.title,
              description: data.description || '',
              teamId: data.teamId,
              teamName: data.teamName,
              timestamp: data.startDate.toDate(),
              metadata: {
                location: data.location,
                startDate: data.startDate.toDate(),
                endDate: data.endDate.toDate()
              },
              likes: 0,
              comments: []
            });
          });

          // Fetch homework
          const homeworkRef = collection(db, 'homework');
          const homeworkQuery = query(
            homeworkRef,
            where('teamId', 'in', teamBatch),
            orderBy('createdAt', 'desc'),
            limit(10)
          );
          
          const homeworkSnapshot = await getDocs(homeworkQuery);
          homeworkSnapshot.forEach(doc => {
            const data = doc.data();
            allActivities.push({
              id: doc.id,
              type: 'homework',
              title: data.title,
              description: data.description || '',
              teamId: data.teamId,
              teamName: data.teamName,
              timestamp: data.createdAt.toDate(),
              metadata: {
                dueDate: data.dueDate.toDate(),
                drillCount: data.drills?.length || 0
              },
              likes: 0,
              comments: []
            });
          });

          // Fetch team updates
          const updatesRef = collection(db, 'team_updates');
          const updatesQuery = query(
            updatesRef,
            where('teamId', 'in', teamBatch),
            orderBy('createdAt', 'desc'),
            limit(10)
          );
          
          const updatesSnapshot = await getDocs(updatesQuery);
          updatesSnapshot.forEach(doc => {
            const data = doc.data();
            allActivities.push({
              id: doc.id,
              type: 'team_update',
              title: data.title,
              description: data.content,
              teamId: data.teamId,
              teamName: data.teamName,
              timestamp: data.createdAt.toDate(),
              likes: data.likes || 0,
              comments: data.comments?.map((c: any) => ({
                ...c,
                timestamp: c.timestamp.toDate()
              })) || []
            });
          });
        }

        // Sort all activities by timestamp
        allActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setActivities(allActivities);
      } catch (error: any) {
        console.error('Error loading activities:', error);
        setError(error.message || 'Unable to load activity feed');
        toast.error('Unable to load activity feed');
      } finally {
        setIsLoading(false);
      }
    };

    loadActivities();
  }, [currentUser]);

  const handleLike = async (activityId: string) => {
    if (!currentUser) {
      toast.error('Please sign in to like activities');
      return;
    }

    setActivities(prev => 
      prev.map(activity => 
        activity.id === activityId 
          ? { ...activity, likes: activity.likes + 1 }
          : activity
      )
    );
    toast.success('Activity liked!');
  };

  const handleComment = async (activityId: string, comment: string) => {
    if (!currentUser) {
      toast.error('Please sign in to comment');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    const newComment = {
      id: Math.random().toString(),
      author: currentUser.displayName,
      content: comment.trim(),
      timestamp: new Date()
    };

    setActivities(prev => 
      prev.map(activity => 
        activity.id === activityId 
          ? { ...activity, comments: [...activity.comments, newComment] }
          : activity
      )
    );
    toast.success('Comment added!');
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'event':
        return <Calendar className="w-10 h-10 text-blue-500" />;
      case 'homework':
        return <BookOpen className="w-10 h-10 text-purple-500" />;
      case 'todo':
        return <ListTodo className="w-10 h-10 text-green-500" />;
      case 'award':
        return <Award className="w-10 h-10 text-yellow-500" />;
      case 'message':
        return <MessageSquare className="w-10 h-10 text-pink-500" />;
      case 'team_update':
        return <Users className="w-10 h-10 text-brand-primary" />;
      default:
        return <Bell className="w-10 h-10 text-gray-500" />;
    }
  };

  const filteredActivities = activities.filter(activity => 
    filter === 'all' || activity.type === filter
  );

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center py-12 bg-white rounded-lg shadow-md">
          <Bell className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{error}</h2>
          {!currentUser && (
            <div className="mt-4">
              <a href="/login" className="text-brand-primary hover:opacity-90">
                Sign in to view your feed
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Activity Feed</h1>
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary appearance-none"
            >
              <option value="all">All Activities</option>
              <option value="events">Events</option>
              <option value="homework">Homework</option>
              <option value="todos">To Dos</option>
              <option value="awards">Awards</option>
            </select>
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading activities...</p>
          </div>
        ) : filteredActivities.length > 0 ? (
          <div className="space-y-6">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Activity Header */}
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-800 mb-1">{activity.title}</h2>
                          {activity.teamName && (
                            <p className="text-brand-primary text-sm">{activity.teamName}</p>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {activity.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-2">{activity.description}</p>

                      {/* Activity Metadata */}
                      {activity.metadata && (
                        <div className="mt-4 space-y-2">
                          {activity.type === 'event' && (
                            <>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {activity.metadata.startDate.toLocaleTimeString()} - 
                                  {activity.metadata.endDate.toLocaleTimeString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span>{activity.metadata.location}</span>
                              </div>
                            </>
                          )}
                          {activity.type === 'homework' && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>Due: {activity.metadata.dueDate.toLocaleDateString()}</span>
                              <span className="text-brand-primary">
                                {activity.metadata.drillCount} drills
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Activity Actions */}
                <div className="px-6 py-4 border-t border-gray-100">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => handleLike(activity.id)}
                      className="flex items-center gap-2 text-gray-600 hover:text-brand-primary"
                    >
                      <ThumbsUp className="w-5 h-5" />
                      <span>{activity.likes}</span>
                    </button>
                    <button
                      onClick={() => {
                        const comment = prompt('Add a comment:');
                        if (comment) handleComment(activity.id, comment);
                      }}
                      className="flex items-center gap-2 text-gray-600 hover:text-brand-primary"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>{activity.comments.length}</span>
                    </button>
                    <button
                      onClick={() => {
                        navigator.share({
                          title: activity.title,
                          text: activity.description,
                          url: window.location.href
                        }).catch(() => {
                          navigator.clipboard.writeText(window.location.href);
                          toast.success('Link copied to clipboard');
                        });
                      }}
                      className="flex items-center gap-2 text-gray-600 hover:text-brand-primary"
                    >
                      <Share2 className="w-5 h-5" />
                      <span>Share</span>
                    </button>
                  </div>

                  {/* Comments */}
                  {activity.comments.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {activity.comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-800">{comment.author}</span>
                            <span className="text-gray-500">
                              {comment.timestamp.toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-1">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Activities Yet</h2>
            <p className="text-gray-600">
              Join teams and participate in events to see activities here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ActivityFeedPage;