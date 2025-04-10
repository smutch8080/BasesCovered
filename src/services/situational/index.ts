import { collection, query, where, getDocs, addDoc, updateDoc, doc, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Scenario, ScenarioAttempt, LeaderboardEntry } from '../../types/situational';
import { handleSituationalError } from './errors';

export async function fetchScenarios(teamId?: string): Promise<Scenario[]> {
  try {
    // Ensure Firestore is initialized
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const scenariosRef = collection(db, 'scenarios');
    let q;

    if (teamId) {
      // Get team-specific scenarios
      q = query(
        scenariosRef,
        where('teamId', '==', teamId),
        orderBy('updatedAt', 'desc')
      );
    } else {
      // Get featured/global scenarios
      q = query(
        scenariosRef,
        where('featured', '==', true),
        orderBy('updatedAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    const scenarios: Scenario[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      scenarios.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Scenario);
    });

    return scenarios;
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    throw handleSituationalError(error);
  }
}

export async function createScenario(scenario: Omit<Scenario, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'scenarios'), {
      ...scenario,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating scenario:', error);
    throw handleSituationalError(error);
  }
}

export async function submitScenarioAttempt(attempt: Omit<ScenarioAttempt, 'id' | 'completedAt'>): Promise<void> {
  try {
    // Validate attempt data
    if (typeof attempt.score !== 'number' || attempt.score < 0 || attempt.score > 100) {
      throw new Error('Invalid score value. Score must be between 0 and 100.');
    }

    if (!attempt.scenarioId || !attempt.userId) {
      throw new Error('Missing required fields for scenario attempt.');
    }

    // Create attempt document
    const attemptData = {
      ...attempt,
      score: Math.round(attempt.score), // Ensure score is an integer
      completedAt: Timestamp.now()
    };

    await addDoc(collection(db, 'scenario_attempts'), attemptData);

    // Update user's stats
    await updateUserStats(attempt.userId, attempt.score, attempt.teamId);
  } catch (error) {
    console.error('Error submitting attempt:', error);
    throw handleSituationalError(error);
  }
}

export async function updateUserStats(userId: string, score: number, teamId?: string): Promise<void> {
  try {
    const statsRef = collection(db, 'user_stats');
    const userStatsQuery = query(statsRef, where('userId', '==', userId));
    const statsSnapshot = await getDocs(userStatsQuery);

    const now = Timestamp.now();
    
    if (statsSnapshot.empty) {
      // Create new stats document
      await addDoc(statsRef, {
        userId,
        teamId,
        totalScore: score,
        gamesPlayed: 1,
        averageScore: score,
        lastPlayed: now
      });
    } else {
      // Update existing stats
      const statsDoc = statsSnapshot.docs[0];
      const currentStats = statsDoc.data();
      const newTotal = (currentStats.totalScore || 0) + score;
      const newGames = (currentStats.gamesPlayed || 0) + 1;

      await updateDoc(statsDoc.ref, {
        totalScore: newTotal,
        gamesPlayed: newGames,
        averageScore: Math.round(newTotal / newGames),
        lastPlayed: now
      });
    }
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw handleSituationalError(error);
  }
}

export async function fetchCompletedScenarios(userId: string): Promise<Set<string>> {
  try {
    const attemptsRef = collection(db, 'scenario_attempts');
    const q = query(
      attemptsRef,
      where('userId', '==', userId),
      orderBy('completedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const completedScenarios = new Set<string>();
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      completedScenarios.add(data.scenarioId);
    });

    return completedScenarios;
  } catch (error) {
    console.error('Error fetching completed scenarios:', error);
    return new Set();
  }
}

export async function fetchLeaderboard(teamId?: string, limitCount = 10): Promise<LeaderboardEntry[]> {
  try {
    const statsRef = collection(db, 'user_stats');
    let q;

    if (teamId) {
      // Team leaderboard
      q = query(
        statsRef,
        where('teamId', '==', teamId),
        orderBy('totalScore', 'desc'),
        limit(limitCount)
      );
    } else {
      // Global leaderboard
      q = query(
        statsRef,
        orderBy('totalScore', 'desc'),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(q);
    const entries: LeaderboardEntry[] = [];
    let rank = 1;

    // Process all documents in parallel
    await Promise.all(querySnapshot.docs.map(async (doc) => {
      const data = doc.data();
      
      try {
        // Get user name
        const userDoc = await getDocs(query(
          collection(db, 'users'),
          where('__name__', '==', data.userId)
        ));

        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data();
          entries.push({
            id: doc.id,
            userId: data.userId,
            userName: userData.displayName || 'Unknown Player',
            teamId: data.teamId,
            score: data.totalScore || 0,
            gamesPlayed: data.gamesPlayed || 0,
            averageScore: data.averageScore || 0,
            rank: rank++,
            lastPlayed: data.lastPlayed?.toDate() || new Date()
          });
        }
      } catch (error) {
        console.error(`Error fetching user data for ${data.userId}:`, error);
        // Continue processing other entries even if one fails
      }
    }));

    // Sort by score and update ranks
    return entries
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw handleSituationalError(error);
  }
}