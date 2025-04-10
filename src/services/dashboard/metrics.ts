import { collection, query, where, getDocs, doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User } from '../../types/auth';
import { TeamMetric } from './types';
import { handleDashboardError } from './errors';

export async function fetchTeamMetrics(currentUser: User): Promise<TeamMetric[]> {
  if (!currentUser?.teams?.length) return [];

  try {
    // Calculate metrics for each team
    const metrics: TeamMetric[] = [];
    
    // Track processed teams to prevent duplicates
    const processedTeams = new Set<string>();

    for (const teamId of currentUser.teams || []) {
      try {
        // Skip if already processed or invalid
        if (!teamId || processedTeams.has(teamId)) continue;
        processedTeams.add(teamId);
        
        // Get team data
        const teamDoc = await getDocs(query(
          collection(db, 'teams'),
          where('__name__', '==', teamId)
        ));

        if (!teamDoc.empty) {
          const teamData = teamDoc.docs[0].data();
          const activeAthletes = teamData.players?.length || 0;

          // Default values in case calculations fail
          let attendanceRate = 0;
          let awardsGiven = 0;
          
          try {
            // Get attendance data from events
            const eventsRef = collection(db, 'events');
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            
            const eventsQuery = query(
              eventsRef,
              where('teamId', '==', teamId),
              where('startDate', '>=', Timestamp.fromDate(lastMonth))
            );
            const eventsSnapshot = await getDocs(eventsQuery);
            
            let totalAttendance = 0;
            let totalEvents = 0;
            eventsSnapshot.forEach(doc => {
              try {
                const event = doc.data();
                if (event.type === 'Practice' || event.type === 'Game') {
                  totalEvents++;
                  const attendees = event.rsvps?.filter(rsvp => rsvp.status === 'going').length || 0;
                  totalAttendance += (attendees / (activeAthletes || 1)) * 100;
                }
              } catch (eventError) {
                console.error(`Error processing event for team ${teamId}:`, eventError);
              }
            });
            
            attendanceRate = totalEvents > 0 ? totalAttendance / totalEvents : 0;
          } catch (attendanceError) {
            console.error(`Error calculating attendance for team ${teamId}:`, attendanceError);
          }
          
          try {
            // Get awards data
            const awardsQuery = query(
              collection(db, 'team_awards'),
              where('teamId', '==', teamId)
            );
            const awardsSnapshot = await getDocs(awardsQuery);
            awardsGiven = awardsSnapshot.size;
          } catch (awardsError) {
            console.error(`Error fetching awards for team ${teamId}:`, awardsError);
          }

          // Calculate performance score based on various factors
          const performanceScore = calculatePerformanceScore({
            attendanceRate,
            awardsPerAthlete: activeAthletes > 0 ? awardsGiven / activeAthletes : 0,
            activeAthletes
          });

          const metric = {
            id: teamId,
            teamId,
            teamName: teamData.name || 'Unknown Team',
            activeAthletes,
            attendanceRate,
            performanceScore,
            awardsGiven,
            lastUpdated: new Date()
          };
          
          metrics.push(metric);

          // Store calculated metrics - do this in a non-blocking way
          try {
            setDoc(doc(db, 'team_metrics', teamId), {
              ...metric,
              lastUpdated: Timestamp.fromDate(new Date())
            }).catch(err => console.error(`Error saving metrics for team ${teamId}:`, err));
          } catch (saveError) {
            console.error(`Error saving metrics for team ${teamId}:`, saveError);
          }
        }
      } catch (teamError) {
        console.error(`Error processing team ${teamId}:`, teamError);
        // Continue to next team
      }
    }

    return metrics;
  } catch (error) {
    return handleDashboardError(error, []);
  }
}

function calculatePerformanceScore(data: {
  attendanceRate: number;
  awardsPerAthlete: number;
  activeAthletes: number;
}): number {
  try {
    // Weight factors
    const ATTENDANCE_WEIGHT = 0.5;
    const AWARDS_WEIGHT = 0.3;
    const ROSTER_WEIGHT = 0.2;

    // Calculate individual scores
    const attendanceScore = data.attendanceRate;
    const awardsScore = Math.min(data.awardsPerAthlete * 20, 100); // Scale awards per athlete
    const rosterScore = Math.min(data.activeAthletes * 5, 100); // Scale active athletes

    // Calculate weighted average
    return Math.round(
      (attendanceScore * ATTENDANCE_WEIGHT) +
      (awardsScore * AWARDS_WEIGHT) +
      (rosterScore * ROSTER_WEIGHT)
    );
  } catch (error) {
    console.error('Error calculating performance score:', error);
    return 0; // Return default value on error
  }
}