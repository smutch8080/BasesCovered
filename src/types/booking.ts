export interface BookingRequest {
  id: string;
  coachId: string;
  userId: string;
  userName: string;
  serviceType: string;
  message: string;
  status: 'pending' | 'approved' | 'declined';
  createdAt: Date;
  updatedAt: Date;
}