import { Event } from '../../types/events';

// Generate iCal format for a single event
function generateEventVCalendar(event: Event): string {
  const formatDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return `BEGIN:VEVENT
UID:${event.id}@coachpad.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(event.startDate)}
DTEND:${formatDate(event.endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || ''}
STATUS:${event.canceled ? 'CANCELLED' : 'CONFIRMED'}
END:VEVENT`;
}

// Generate complete iCal calendar with all events
export function generateCalendar(events: Event[]): string {
  const calendar = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Coach Pad//Softball Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Coach Pad Events',
    ...events.map(event => generateEventVCalendar(event)),
    'END:VCALENDAR'
  ].join('\r\n');

  return calendar;
}

// Generate calendar URL for subscribing
export function generateCalendarUrl(teamId?: string): string {
  const baseUrl = window.location.origin;
  const path = teamId ? `/api/calendar/${teamId}` : '/api/calendar/community';
  return `webcal://${baseUrl.replace(/^https?:\/\//, '')}${path}`;
}