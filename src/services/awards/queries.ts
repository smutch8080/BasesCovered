import { collection, query, where, orderBy, Query } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export function getAdminAwardsQuery(): Query {
  return query(
    collection(db, 'team_awards'),
    orderBy('date', 'desc')
  );
}

export function getCoachAwardsQuery(teamIds: string[]): Query {
  return query(
    collection(db, 'team_awards'),
    where('teamId', 'in', teamIds),
    orderBy('date', 'desc')
  );
}

export function getPlayerAwardsQuery(playerId: string): Query {
  return query(
    collection(db, 'team_awards'),
    where('playerId', '==', playerId),
    orderBy('date', 'desc')
  );
}