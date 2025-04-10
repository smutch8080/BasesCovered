import { DashboardSession, DashboardMessage, DashboardActivity, TeamMetric } from './types';

// Helper to safely convert Firestore timestamp to Date
function safeToDate(timestamp: any): Date {
  if (!timestamp) return new Date();
  try {
    return timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  } catch (error) {
    console.error('Error converting timestamp:', error);
    return new Date();
  }
}

export function transformSession(id: string, data: any): DashboardSession {
  try {
    return {
      id,
      title: data.title || 'Untitled Session',
      startTime: safeToDate(data.startDate),
      endTime: safeToDate(data.endDate),
      location: data.location || 'No location set',
      teamId: data.teamId,
      teamName: data.teamName || '',
      type: data.type?.toLowerCase() || 'practice'
    };
  } catch (error) {
    console.error('Error transforming session:', error);
    throw error;
  }
}

export function transformMessage(id: string, data: any): DashboardMessage {
  try {
    return {
      id,
      conversationId: data.conversationId,
      senderId: data.senderId,
      senderName: data.senderName || 'Unknown User',
      content: data.content || '',
      createdAt: safeToDate(data.createdAt),
      unread: !data.readBy?.includes(data.senderId)
    };
  } catch (error) {
    console.error('Error transforming message:', error);
    throw error;
  }
}

export function transformActivity(id: string, data: any): DashboardActivity {
  try {
    return {
      id,
      type: data.type || 'other',
      title: data.title || 'Untitled Activity',
      description: data.description || '',
      timestamp: safeToDate(data.timestamp),
      teamId: data.teamId,
      teamName: data.teamName || '',
      relatedUserId: data.relatedUserId,
      relatedUserName: data.relatedUserName
    };
  } catch (error) {
    console.error('Error transforming activity:', error);
    throw error;
  }
}

export function transformMetric(id: string, data: any): TeamMetric {
  try {
    return {
      id,
      teamId: data.teamId,
      activeAthletes: data.activeAthletes || 0,
      attendanceRate: data.attendanceRate || 0,
      performanceScore: data.performanceScore || 0,
      awardsGiven: data.awardsGiven || 0,
      lastUpdated: safeToDate(data.lastUpdated)
    };
  } catch (error) {
    console.error('Error transforming metric:', error);
    throw error;
  }
}