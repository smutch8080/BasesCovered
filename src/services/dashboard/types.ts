export interface DashboardMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: Date;
  unread: boolean;
}

export interface DashboardSession {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  location: string;
  teamId: string;
  teamName: string;
  type: 'practice' | 'game' | 'event' | string;
}

export interface DashboardActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: Date;
  teamId: string;
  teamName: string;
  relatedUserId?: string;
  relatedUserName?: string;
}

export interface TeamMetric {
  id: string;
  teamId: string;
  teamName?: string;
  activeAthletes: number;
  attendanceRate: number;
  performanceScore: number;
  awardsGiven: number;
  lastUpdated: Date;
}

// [Rest of type definitions remain the same]