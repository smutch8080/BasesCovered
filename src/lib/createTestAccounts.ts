import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, League, Team } from '../types/auth';

export const createTestAccounts = async () => {
  try {
    // Create League Manager Account
    const leagueManagerCredentials = await createUserWithEmailAndPassword(
      auth,
      'league@softballplanner.com',
      'league123!@#'
    );

    const leagueData: League = {
      id: 'league1',
      name: 'Southwest Softball League',
      description: 'Premier softball league for youth development',
      managers: [leagueManagerCredentials.user.uid],
      teams: []
    };

    await setDoc(doc(db, 'leagues', leagueData.id), leagueData);

    const leagueManagerData: User = {
      id: leagueManagerCredentials.user.uid,
      email: 'league@softballplanner.com',
      displayName: 'League Manager',
      role: 'league_manager',
      leagues: [leagueData.id],
      teams: []
    };

    await setDoc(doc(db, 'users', leagueManagerData.id), leagueManagerData);

    // Create Coach Account
    const coachCredentials = await createUserWithEmailAndPassword(
      auth,
      'coach@softballplanner.com',
      'coach123!@#'
    );

    const teamData: Team = {
      id: 'team1',
      name: 'Thunder Strikers',
      leagueId: leagueData.id,
      managers: [],
      coaches: [coachCredentials.user.uid],
      players: [],
      parents: []
    };

    await setDoc(doc(db, 'teams', teamData.id), teamData);

    const coachData: User = {
      id: coachCredentials.user.uid,
      email: 'coach@softballplanner.com',
      displayName: 'Head Coach',
      role: 'coach',
      leagues: [leagueData.id],
      teams: [teamData.id]
    };

    await setDoc(doc(db, 'users', coachData.id), coachData);

    // Create Player Account
    const playerCredentials = await createUserWithEmailAndPassword(
      auth,
      'player@softballplanner.com',
      'player123!@#'
    );

    const playerData: User = {
      id: playerCredentials.user.uid,
      email: 'player@softballplanner.com',
      displayName: 'Sarah Smith',
      role: 'player',
      leagues: [leagueData.id],
      teams: [teamData.id]
    };

    await setDoc(doc(db, 'users', playerData.id), playerData);

    // Update team with player
    await updateDoc(doc(db, 'teams', teamData.id), {
      players: arrayUnion(playerData.id)
    });

    // Create Parent Account
    const parentCredentials = await createUserWithEmailAndPassword(
      auth,
      'parent@softballplanner.com',
      'parent123!@#'
    );

    const parentData: User = {
      id: parentCredentials.user.uid,
      email: 'parent@softballplanner.com',
      displayName: 'John Smith',
      role: 'parent',
      leagues: [leagueData.id],
      teams: [teamData.id]
    };

    await setDoc(doc(db, 'users', parentData.id), parentData);

    // Update team with parent
    await updateDoc(doc(db, 'teams', teamData.id), {
      parents: arrayUnion(parentData.id)
    });

    // Update league with team
    await updateDoc(doc(db, 'leagues', leagueData.id), {
      teams: arrayUnion(teamData.id)
    });

    console.log('Test accounts created successfully');
    return {
      leagueManager: { email: 'league@softballplanner.com', password: 'league123!@#' },
      coach: { email: 'coach@softballplanner.com', password: 'coach123!@#' },
      player: { email: 'player@softballplanner.com', password: 'player123!@#' },
      parent: { email: 'parent@softballplanner.com', password: 'parent123!@#' }
    };
  } catch (error) {
    console.error('Error creating test accounts:', error);
    throw error;
  }
};