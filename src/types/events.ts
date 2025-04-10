export enum EventType {
  Game = 'Game',
  Practice = 'Practice',
  Scrimmage = 'Scrimmage',
  TeamEvent = 'Team Event',
  Tryout = 'Tryout',
  Clinic = 'Clinic',
  PrivateLesson = 'Private Lesson'
}

export enum RSVPStatus {
  Going = 'going',
  NotGoing = 'not_going',
  Maybe = 'maybe',
  NoResponse = 'no_response'
}

export interface RSVP {
  userId: string;
  userName: string;
  userRole: string;
  status: RSVPStatus;
  timestamp: Date;
  notes?: string;
}

export interface Event {
  id: string;
  type: EventType;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  teamId?: string;
  teamName?: string;
  isCommunityEvent: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  maxParticipants?: number;
  cost?: number;
  rsvps: RSVP[];
  requiresPayment?: boolean;
  paymentDetails?: string;
  notes?: string;
  canceled?: boolean;
  cancelReason?: string;
  practicePlanId?: string;
  practicePlanName?: string;
  volunteerSlots?: VolunteerSlot[];
  opponent?: string;
  isHomeTeam?: boolean; // Add home/visitor indicator
}