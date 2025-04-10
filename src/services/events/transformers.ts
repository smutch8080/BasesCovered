import { Event } from '../../types/events';

export function transformEvent(id: string, data: any): Event {
  return {
    ...data,
    id,
    startDate: data.startDate.toDate(),
    endDate: data.endDate.toDate(),
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
    rsvps: data.rsvps || [],
    isCommunityEvent: data.isCommunityEvent || false,
    canceled: data.canceled || false
  } as Event;
}