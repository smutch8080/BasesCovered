import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Team } from '../../types/team';
import { HomeworkError } from './errors';

export async function validateTeamAccess(userId: string, teamId: string): Promise<boolean> {
  try {
    const teamsRef = collection(db, 'teams');
    const teamQuery = query(
      teamsRef,
      where('__name__', '==', teamId),
      where('coaches', 'array-contains', userId)
    );

    const snapshot = await getDocs(teamQuery);
    return !snapshot.empty;
  } catch (error) {
    throw new HomeworkError(
      'Failed to validate team access',
      'TEAM_ACCESS_ERROR',
      error
    );
  }
}

export async function getTeamPlayers(teamId: string): Promise<{ id: string; name: string }[]> {
  try {
    const teamDoc = await getDocs(query(
      collection(db, 'teams'),
      where('__name__', '==', teamId)
    ));

    if (teamDoc.empty) {
      throw new HomeworkError('Team not found', 'TEAM_NOT_FOUND');
    }

    const team = teamDoc.docs[0].data() as Team;
    return team.players.map(player => ({
      id: player.id,
      name: player.name
    }));
  } catch (error) {
    if (error instanceof HomeworkError) throw error;
    throw new HomeworkError(
      'Failed to get team players',
      'TEAM_PLAYERS_ERROR',
      error
    );
  }
}