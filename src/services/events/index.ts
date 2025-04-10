import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Event } from '../../types/events';
import { User } from '../../types/auth';
import { transformEvent } from './transformers';
import { handleEventError } from './errors';

export async function fetchEvents(currentUser: User | null, showPastEvents: boolean = false): Promise<Event[]> {
  try {
    const now = new Date();
    const eventsRef = collection(db, 'events');
    const loadedEvents = new Map<string, Event>();

    // Debug logging
    console.log('Fetching events for user:', {
      userId: currentUser?.id,
      teams: currentUser?.teams,
      role: currentUser?.role,
      showPastEvents
    });

    // First, load community events
    const communityQuery = query(
      eventsRef,
      where('isCommunityEvent', '==', true),
      where('startDate', showPastEvents ? '<=' : '>=', now),
      orderBy('startDate', showPastEvents ? 'desc' : 'asc')
    );

    const communitySnapshot = await getDocs(communityQuery);
    console.log('Found community events:', communitySnapshot.size);
    
    communitySnapshot.forEach(doc => {
      loadedEvents.set(doc.id, transformEvent(doc.id, doc.data()));
    });

    // Then, if user is authenticated and has teams, load team events
    if (currentUser?.teams?.length) {
      console.log('Loading team events for teams:', currentUser.teams);
      
      // Process teams in batches of 10 (Firestore limitation)
      for (let i = 0; i < currentUser.teams.length; i += 10) {
        const teamBatch = currentUser.teams.slice(i, i + 10);
        console.log('Processing team batch:', teamBatch);
        
        // Query for team events
        const teamQuery = query(
          eventsRef,
          where('teamId', 'in', teamBatch),
          where('startDate', showPastEvents ? '<=' : '>=', now),
          orderBy('startDate', showPastEvents ? 'desc' : 'asc')
        );
        
        const teamSnapshot = await getDocs(teamQuery);
        console.log('Found team events for batch:', {
          batchSize: teamBatch.length,
          eventsFound: teamSnapshot.size
        });
        
        teamSnapshot.forEach(doc => {
          const data = doc.data();
          console.log('Processing team event:', {
            id: doc.id,
            teamId: data.teamId,
            title: data.title,
            startDate: data.startDate?.toDate()
          });
          
          // Only add if not already in map (prevents duplicates)
          if (!loadedEvents.has(doc.id)) {
            loadedEvents.set(doc.id, transformEvent(doc.id, data));
          }
        });
      }
    } else {
      console.log('User has no teams or is not authenticated');
    }

    // Convert map to array and sort
    const events = Array.from(loadedEvents.values()).sort((a, b) => 
      showPastEvents 
        ? b.startDate.getTime() - a.startDate.getTime()
        : a.startDate.getTime() - b.startDate.getTime()
    );

    console.log('Total events loaded:', {
      total: events.length,
      upcoming: events.filter(e => e.startDate > now).length,
      past: events.filter(e => e.startDate <= now).length,
      community: events.filter(e => e.isCommunityEvent).length,
      team: events.filter(e => !e.isCommunityEvent).length
    });

    return events;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw handleEventError(error);
  }
}