import { collection, query, where, getDocs, addDoc, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Event } from '../../types/events';
import { Game } from '../../types/game';

export async function createGameFromEvent(event: Event): Promise<string> {
  if (!event.teamId || !event.teamName || !event.opponent) {
    throw new Error('Invalid event data for game creation');
  }

  try {
    const gameData: Omit<Game, 'id'> = {
      eventId: event.id,
      teamId: event.teamId,
      teamName: event.teamName,
      opponent: event.opponent,
      isHomeTeam: event.isHomeTeam || false,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      status: 'scheduled',
      attendees: {
        confirmed: event.rsvps.filter(rsvp => rsvp.status === 'going').map(rsvp => rsvp.userId),
        maybe: event.rsvps.filter(rsvp => rsvp.status === 'maybe').map(rsvp => rsvp.userId),
        declined: event.rsvps.filter(rsvp => rsvp.status === 'not_going').map(rsvp => rsvp.userId)
      },
      volunteerSlots: event.volunteerSlots || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'games'), {
      ...gameData,
      startDate: Timestamp.fromDate(gameData.startDate),
      endDate: Timestamp.fromDate(gameData.endDate),
      createdAt: Timestamp.fromDate(gameData.createdAt),
      updatedAt: Timestamp.fromDate(gameData.updatedAt)
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating game:', error);
    throw error;
  }
}

export async function fetchGames(teamIds: string[]): Promise<Game[]> {
  if (!teamIds?.length) {
    return [];
  }

  try {
    const allGames: Game[] = [];
    
    // Process teams in batches of 10 (Firestore limitation)
    for (let i = 0; i < teamIds.length; i += 10) {
      const teamBatch = teamIds.slice(i, i + 10);
      const gamesRef = collection(db, 'games');
      const q = query(
        gamesRef,
        where('teamId', 'in', teamBatch),
        orderBy('startDate', 'desc')
      );

      const snapshot = await getDocs(q);
      snapshot.forEach(doc => {
        const data = doc.data();
        allGames.push({
          ...data,
          id: doc.id,
          startDate: data.startDate.toDate(),
          endDate: data.endDate.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Game);
      });
    }

    return allGames;
  } catch (error) {
    console.error('Error fetching games:', error);
    throw error;
  }
}