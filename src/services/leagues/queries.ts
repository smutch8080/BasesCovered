import { collection, query, where, orderBy, Query } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export function getLeagueQuery(userId: string): Query {
  return query(
    collection(db, 'leagues'),
    where('managers', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );
}

export function getLeagueTeamsQuery(leagueId: string): Query {
  return query(
    collection(db, 'teams'),
    where('leagueId', '==', leagueId),
    orderBy('name')
  );
}

export function getLeagueResourcesQuery(leagueId: string): Query {
  return query(
    collection(db, 'league_resources'),
    where('leagueId', '==', leagueId),
    orderBy('createdAt', 'desc')
  );
}