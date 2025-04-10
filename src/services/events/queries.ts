import { collection, query, where, orderBy, Query, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export function getCommunityEventsQuery(showPastEvents: boolean, now: Date): Query {
  const timestamp = Timestamp.fromDate(now);
  return query(
    collection(db, 'events'),
    where('isCommunityEvent', '==', true),
    where('startDate', showPastEvents ? '<=' : '>=', timestamp),
    orderBy('startDate', showPastEvents ? 'desc' : 'asc')
  );
}

export function getTeamEventsQuery(teamIds: string[], showPastEvents: boolean, now: Date): Query {
  const timestamp = Timestamp.fromDate(now);
  return query(
    collection(db, 'events'),
    where('teamId', 'in', teamIds),
    where('startDate', showPastEvents ? '<=' : '>=', timestamp),
    orderBy('startDate', showPastEvents ? 'desc' : 'asc')
  );
}