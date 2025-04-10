import { collection, query, where, getDocs, doc, getDoc, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { League, LeagueStats } from '../../types/league';
import { Team } from '../../types/team';
import { handleLeagueError } from './errors';

export async function fetchLeagueData(userId: string): Promise<League | null> {
  try {
    console.log('Fetching league data for user:', userId);
    
    // Query leagues where user is a manager
    const leaguesRef = collection(db, 'leagues');
    const q = query(
      leaguesRef,
      where('managers', 'array-contains', userId)
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      console.log('No league found for user');
      return null;
    }

    // Get first league (assuming one league per manager for now)
    const leagueDoc = querySnapshot.docs[0];
    const data = leagueDoc.data();
    
    return {
      ...data,
      id: leagueDoc.id,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    } as League;
  } catch (error) {
    console.error('Error fetching league data:', error);
    throw handleLeagueError(error);
  }
}

export async function fetchLeagueTeams(leagueId: string): Promise<Team[]> {
  try {
    // First verify league exists
    const leagueDoc = await getDoc(doc(db, 'leagues', leagueId));
    if (!leagueDoc.exists()) {
      throw new Error('League not found');
    }

    console.log('Fetching teams for league:', leagueId);
    const teamsRef = collection(db, 'teams');
    const q = query(
      teamsRef,
      where('leagueId', '==', leagueId),
      orderBy('name')
    );
    
    const querySnapshot = await getDocs(q);
    const teams: Team[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      teams.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        players: data.players || [],
        coaches: data.coaches || [],
        parents: data.parents || [],
        joinRequests: data.joinRequests || []
      } as Team);
    });

    console.log(`Found ${teams.length} teams for league ${leagueId}`);
    return teams;
  } catch (error) {
    console.error('Error fetching league teams:', error);
    throw handleLeagueError(error);
  }
}

export async function fetchLeagueStats(leagueId: string): Promise<LeagueStats> {
  try {
    // First verify league exists and user has access
    const leagueDoc = await getDoc(doc(db, 'leagues', leagueId));
    if (!leagueDoc.exists()) {
      throw new Error('League not found');
    }

    console.log('Fetching stats for league:', leagueId);

    // Get teams and calculate total players
    const teams = await fetchLeagueTeams(leagueId);
    const totalPlayers = teams.reduce((sum, team) => sum + (team.players?.length || 0), 0);

    // Get active seasons
    const leagueData = leagueDoc.data();
    const activeSeasons = leagueData?.seasons?.filter((s: any) => s.isActive)?.length || 0;

    // Get upcoming events
    const now = Timestamp.now();
    const eventsRef = collection(db, 'events');
    const eventsQuery = query(
      eventsRef,
      where('leagueId', '==', leagueId),
      where('startDate', '>=', now)
    );
    const eventsSnapshot = await getDocs(eventsQuery);

    const stats = {
      totalTeams: teams.length,
      totalPlayers,
      activeSeasons,
      upcomingEvents: eventsSnapshot.size
    };

    console.log('League stats:', stats);
    return stats;
  } catch (error) {
    console.error('Error fetching league stats:', error);
    throw handleLeagueError(error);
  }
}