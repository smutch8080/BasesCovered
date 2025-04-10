import { collection, query, where, orderBy, QueryConstraint } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User } from '../../types/auth';

export function getCoachHomeworkQuery(userId: string) {
  return query(
    collection(db, 'homework'),
    where('createdBy', '==', userId),
    orderBy('dueDate', 'desc')
  );
}

export function getTeamHomeworkQuery(teamIds: string[]) {
  return query(
    collection(db, 'homework'),
    where('teamId', 'in', teamIds),
    orderBy('dueDate', 'desc')
  );
}

export function getPlayerHomeworkQuery(teamIds: string[]) {
  return query(
    collection(db, 'homework'),
    where('teamId', 'in', teamIds),
    orderBy('dueDate', 'desc')
  );