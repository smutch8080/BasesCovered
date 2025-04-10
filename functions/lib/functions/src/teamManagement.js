"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unlinkParentFromPlayer = exports.removeCoachFromTeam = exports.updatePlayerDetails = exports.removePlayerFromTeam = exports.validateTeamInvite = exports.assignParentToPlayer = exports.addPlayerToTeam = exports.handleJoinRequest = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const firebase_admin_1 = require("firebase-admin");
// Helper function to validate if the requestor has permission to manage the team
const validateTeamManagerPermission = async (teamId, userId) => {
    try {
        // Get the team document
        const teamDoc = await admin.firestore().collection('teams').doc(teamId).get();
        if (!teamDoc.exists) {
            throw new Error(`Team ${teamId} not found`);
        }
        const teamData = teamDoc.data();
        if (!teamData) {
            throw new Error('Team data is empty');
        }
        // Check if user is a coach or admin
        const isCoach = teamData.coachId === userId ||
            (teamData.coaches && teamData.coaches.includes(userId));
        if (isCoach) {
            return true;
        }
        // Check if user is an admin
        const userDoc = await admin.firestore().collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return false;
        }
        const userData = userDoc.data();
        return (userData === null || userData === void 0 ? void 0 : userData.role) === 'admin';
    }
    catch (error) {
        console.error('Error validating team manager permission:', error);
        return false;
    }
};
// Function to handle join request approval or rejection
exports.handleJoinRequest = functions.https.onCall(async (data, context) => {
    // Require authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to perform this action');
    }
    // Validate required parameters
    if (!data.teamId || !data.requestId || !data.status) {
        throw new functions.https.HttpsError('invalid-argument', 'Team ID, request ID, and status are required');
    }
    const { teamId, requestId, status } = data;
    const userId = context.auth.uid;
    try {
        // Validate the user has permission to manage this team
        const hasPermission = await validateTeamManagerPermission(teamId, userId);
        if (!hasPermission) {
            throw new functions.https.HttpsError('permission-denied', 'You do not have permission to manage this team');
        }
        // Get the team document
        const teamRef = admin.firestore().collection('teams').doc(teamId);
        const teamDoc = await teamRef.get();
        if (!teamDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Team not found');
        }
        const teamData = teamDoc.data();
        if (!teamData || !teamData.joinRequests) {
            throw new functions.https.HttpsError('not-found', 'No join requests found for this team');
        }
        // Find the request
        const request = teamData.joinRequests.find((req) => req.id === requestId);
        if (!request) {
            throw new functions.https.HttpsError('not-found', 'Join request not found');
        }
        // Update the request status
        const updatedRequests = teamData.joinRequests.map((req) => req.id === requestId ? Object.assign(Object.assign({}, req), { status, updatedAt: firebase_admin_1.firestore.Timestamp.now() }) : req);
        // Begin a transaction to ensure data consistency
        const result = await admin.firestore().runTransaction(async (transaction) => {
            // If the request was approved, get the user document FIRST
            let userData = null;
            let userDoc = null;
            if (status === 'approved') {
                const { userId: requestUserId } = request;
                const userRef = admin.firestore().collection('users').doc(requestUserId);
                // Get user document in transaction - BEFORE any writes
                userDoc = await transaction.get(userRef);
                if (!userDoc.exists) {
                    throw new functions.https.HttpsError('not-found', 'User not found');
                }
                userData = userDoc.data();
                if (!userData) {
                    throw new functions.https.HttpsError('not-found', 'User data not found');
                }
            }
            // After all reads are complete, perform writes
            // Update the requests in the team document
            transaction.update(teamRef, {
                joinRequests: updatedRequests,
                updatedAt: firebase_admin_1.firestore.Timestamp.now()
            });
            // If the request was approved, handle the user updates
            if (status === 'approved') {
                const { userId: requestUserId, userRole, userName } = request;
                const userRef = admin.firestore().collection('users').doc(requestUserId);
                // Add this team to the user's teams array if not already there
                const userTeams = userData.teams || [];
                if (!userTeams.includes(teamId)) {
                    transaction.update(userRef, {
                        teams: [...userTeams, teamId]
                    });
                }
                // Handle role-specific updates
                if (userRole === 'player') {
                    // Add player to team's players array
                    const newPlayer = {
                        id: requestUserId,
                        name: request.userName,
                        jerseyNumber: '',
                        age: 0,
                        positions: []
                    };
                    const currentPlayers = teamData.players || [];
                    transaction.update(teamRef, {
                        players: [...currentPlayers, newPlayer]
                    });
                }
                else if (userRole === 'coach') {
                    // Add coach to coaches array
                    const currentCoaches = teamData.coaches || [];
                    if (!currentCoaches.includes(requestUserId)) {
                        transaction.update(teamRef, {
                            coaches: [...currentCoaches, requestUserId]
                        });
                    }
                    // Update user role if needed
                    if (userData.role !== 'coach' && userData.role !== 'admin') {
                        transaction.update(userRef, {
                            role: 'coach'
                        });
                    }
                }
                else if (userRole === 'parent') {
                    // Add parent to parent list if needed - using the new structure
                    const currentParents = teamData.parents || [];
                    // Check if parent is already in the list
                    let parentExists = false;
                    for (const parent of currentParents) {
                        if (typeof parent === 'object' && parent.id === requestUserId) {
                            parentExists = true;
                            break;
                        }
                        else if (typeof parent === 'string' && parent === requestUserId) {
                            // Handle old format for backward compatibility
                            parentExists = true;
                            break;
                        }
                    }
                    if (!parentExists) {
                        // Add parent with the new format
                        const updatedParents = [
                            ...currentParents,
                            { id: requestUserId, name: userName }
                        ];
                        transaction.update(teamRef, {
                            parents: updatedParents
                        });
                    }
                }
            }
            return {
                success: true,
                status,
                teamId,
                requestId
            };
        });
        // Return the processed data for the client
        return {
            success: true,
            message: `Join request ${status === 'approved' ? 'approved' : 'declined'} successfully`,
            updatedTeam: Object.assign(Object.assign({}, teamData), { id: teamId, 
                // Convert any Firestore timestamps to serializable format in joinRequests
                joinRequests: teamData.joinRequests.map((request) => (Object.assign(Object.assign({}, request), { 
                    // Convert timestamps to ISO strings for client-side processing
                    createdAt: request.createdAt instanceof admin.firestore.Timestamp
                        ? request.createdAt.toDate().toISOString()
                        : request.createdAt, updatedAt: request.updatedAt instanceof admin.firestore.Timestamp
                        ? request.updatedAt.toDate().toISOString()
                        : request.updatedAt }))), 
                // Also convert team timestamps
                createdAt: teamData.createdAt instanceof admin.firestore.Timestamp
                    ? teamData.createdAt.toDate().toISOString()
                    : teamData.createdAt, updatedAt: teamData.updatedAt instanceof admin.firestore.Timestamp
                    ? teamData.updatedAt.toDate().toISOString()
                    : teamData.updatedAt })
        };
    }
    catch (error) {
        console.error('Error handling join request:', error);
        throw new functions.https.HttpsError('internal', error instanceof Error ? error.message : 'An unknown error occurred');
    }
});
// Function to add a player to a team
exports.addPlayerToTeam = functions.https.onCall(async (data, context) => {
    // Require authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to perform this action');
    }
    // Validate required parameters
    if (!data.teamId || !data.playerData) {
        throw new functions.https.HttpsError('invalid-argument', 'Team ID and player data are required');
    }
    const { teamId, playerData } = data;
    const userId = context.auth.uid;
    try {
        // Validate the user has permission to manage this team
        const hasPermission = await validateTeamManagerPermission(teamId, userId);
        if (!hasPermission) {
            throw new functions.https.HttpsError('permission-denied', 'You do not have permission to manage this team');
        }
        // Begin transaction for data consistency
        return await admin.firestore().runTransaction(async (transaction) => {
            // Get the team document
            const teamRef = admin.firestore().collection('teams').doc(teamId);
            const teamDoc = await transaction.get(teamRef);
            if (!teamDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'Team not found');
            }
            const teamData = teamDoc.data();
            if (!teamData) {
                throw new functions.https.HttpsError('not-found', 'Team data not found');
            }
            let playerId;
            let isNewUser = false;
            // Check if a user with this email already exists
            if (playerData.email) {
                const usersQuery = await admin.firestore()
                    .collection('users')
                    .where('email', '==', playerData.email.toLowerCase())
                    .limit(1)
                    .get();
                if (!usersQuery.empty) {
                    // Use existing user
                    playerId = usersQuery.docs[0].id;
                    // Update user teams array
                    const userRef = admin.firestore().collection('users').doc(playerId);
                    const userDoc = await transaction.get(userRef);
                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        const userTeams = (userData === null || userData === void 0 ? void 0 : userData.teams) || [];
                        if (!userTeams.includes(teamId)) {
                            transaction.update(userRef, {
                                teams: [...userTeams, teamId]
                            });
                        }
                    }
                }
                else {
                    // Create new user
                    playerId = admin.firestore().collection('users').doc().id;
                    const userData = {
                        id: playerId,
                        email: playerData.email.toLowerCase(),
                        displayName: playerData.name,
                        role: 'player',
                        leagues: [],
                        teams: [teamId],
                        createdAt: firebase_admin_1.firestore.Timestamp.now(),
                        updatedAt: firebase_admin_1.firestore.Timestamp.now()
                    };
                    const userRef = admin.firestore().collection('users').doc(playerId);
                    transaction.set(userRef, userData);
                    isNewUser = true;
                }
            }
            else {
                // Create new user without email
                playerId = admin.firestore().collection('users').doc().id;
                const userData = {
                    id: playerId,
                    email: '',
                    displayName: playerData.name,
                    role: 'player',
                    leagues: [],
                    teams: [teamId],
                    createdAt: firebase_admin_1.firestore.Timestamp.now(),
                    updatedAt: firebase_admin_1.firestore.Timestamp.now()
                };
                const userRef = admin.firestore().collection('users').doc(playerId);
                transaction.set(userRef, userData);
                isNewUser = true;
            }
            // Add the player to the team
            const player = {
                id: playerId,
                name: playerData.name,
                jerseyNumber: playerData.jerseyNumber || '',
                age: playerData.age || 0,
                positions: playerData.positions || []
            };
            // Check if player is already on the team
            const currentPlayers = teamData.players || [];
            const playerExists = currentPlayers.some((p) => p.id === playerId);
            if (!playerExists) {
                transaction.update(teamRef, {
                    players: [...currentPlayers, player],
                    updatedAt: firebase_admin_1.firestore.Timestamp.now()
                });
            }
            return {
                success: true,
                playerId,
                isNewUser,
                playerExists
            };
        });
    }
    catch (error) {
        console.error('Error adding player to team:', error);
        throw new functions.https.HttpsError('internal', error instanceof Error ? error.message : 'Unknown error');
    }
});
// Function to assign a parent to a player
exports.assignParentToPlayer = functions.https.onCall(async (data, context) => {
    // Require authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to perform this action');
    }
    // Validate required parameters
    if (!data.teamId || !data.parentId || !data.playerId) {
        throw new functions.https.HttpsError('invalid-argument', 'Team ID, parent ID, and player ID are required');
    }
    const { teamId, parentId, playerId, parentName } = data;
    const userId = context.auth.uid;
    try {
        // Validate the user has permission to manage this team
        const hasPermission = await validateTeamManagerPermission(teamId, userId);
        if (!hasPermission) {
            throw new functions.https.HttpsError('permission-denied', 'You do not have permission to manage this team');
        }
        // Get parent name if not provided
        let resolvedParentName = parentName || '';
        if (!resolvedParentName) {
            const parentDoc = await admin.firestore().collection('users').doc(parentId).get();
            if (parentDoc.exists) {
                const parentData = parentDoc.data();
                resolvedParentName = (parentData === null || parentData === void 0 ? void 0 : parentData.displayName) || 'Unknown';
            }
        }
        // Begin transaction
        return await admin.firestore().runTransaction(async (transaction) => {
            // Get the team document
            const teamRef = admin.firestore().collection('teams').doc(teamId);
            const teamDoc = await transaction.get(teamRef);
            if (!teamDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'Team not found');
            }
            const teamData = teamDoc.data();
            if (!teamData) {
                throw new functions.https.HttpsError('not-found', 'Team data not found');
            }
            // Make sure parent is in parent list
            const currentParents = teamData.parents || [];
            let parentExists = false;
            for (const parent of currentParents) {
                if (typeof parent === 'object' && parent.id === parentId) {
                    parentExists = true;
                    break;
                }
                else if (typeof parent === 'string' && parent === parentId) {
                    // Handle old format for backward compatibility
                    parentExists = true;
                    break;
                }
            }
            if (!parentExists) {
                // Use the new format with id and name
                const updatedParents = [
                    ...currentParents,
                    { id: parentId, name: resolvedParentName }
                ];
                transaction.update(teamRef, {
                    parents: updatedParents,
                    updatedAt: firebase_admin_1.firestore.Timestamp.now()
                });
            }
            // Update player to associate with parent
            const currentPlayers = teamData.players || [];
            const updatedPlayers = currentPlayers.map((player) => {
                if (player.id === playerId) {
                    // Add the parent to the player's parents array
                    const playerParents = player.parents || [];
                    const parentEntry = { id: parentId, name: resolvedParentName };
                    // Check if this parent is already in the player's parents array
                    let parentAlreadyAssigned = false;
                    for (const existingParent of playerParents) {
                        if (existingParent.id === parentId) {
                            parentAlreadyAssigned = true;
                            break;
                        }
                    }
                    if (!parentAlreadyAssigned) {
                        return Object.assign(Object.assign({}, player), { parents: [...playerParents, parentEntry] });
                    }
                }
                return player;
            });
            transaction.update(teamRef, {
                players: updatedPlayers,
                updatedAt: firebase_admin_1.firestore.Timestamp.now()
            });
            return {
                success: true,
                teamId,
                parentId,
                playerId,
                parentName: resolvedParentName
            };
        });
    }
    catch (error) {
        console.error('Error assigning parent to player:', error);
        throw new functions.https.HttpsError('internal', error instanceof Error ? error.message : 'Unknown error');
    }
});
// Public function to validate a team invite without requiring authentication
exports.validateTeamInvite = functions.https.onCall(async (data, context) => {
    // Validate required parameters
    if (!data.teamId || !data.inviteHash) {
        throw new functions.https.HttpsError('invalid-argument', 'Team ID and invite hash are required');
    }
    const { teamId, inviteHash } = data;
    try {
        // Get the team document
        const teamRef = admin.firestore().collection('teams').doc(teamId);
        const teamDoc = await teamRef.get();
        if (!teamDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Team not found');
        }
        const teamData = teamDoc.data();
        if (!teamData) {
            throw new functions.https.HttpsError('not-found', 'Team data not found');
        }
        // Verify invite hash
        if (!teamData.inviteHash || teamData.inviteHash !== inviteHash) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid or expired invite link');
        }
        // Return basic team info if the invite is valid
        return {
            success: true,
            team: {
                id: teamDoc.id,
                name: teamData.name,
                logoUrl: teamData.logoUrl || null,
                location: teamData.location || {},
                ageDivision: teamData.ageDivision,
                type: teamData.type
            }
        };
    }
    catch (error) {
        console.error('Error validating team invite:', error);
        throw new functions.https.HttpsError('internal', error instanceof Error ? error.message : 'Unknown error');
    }
});
// Function to remove a player from a team
exports.removePlayerFromTeam = functions.https.onCall(async (data, context) => {
    var _a;
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to perform this action');
    }
    const { teamId, playerId } = data;
    if (!teamId || !playerId) {
        throw new functions.https.HttpsError('invalid-argument', 'Team ID and player ID are required');
    }
    try {
        const db = admin.firestore();
        const teamRef = db.collection('teams').doc(teamId);
        // Get team data first to check permissions and current players
        const teamDoc = await teamRef.get();
        if (!teamDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Team not found');
        }
        const teamData = teamDoc.data();
        // Check permissions - simple approach
        const isCoach = teamData.coachId === context.auth.uid ||
            (teamData.coaches && teamData.coaches.includes(context.auth.uid));
        // If not a coach, check if admin
        if (!isCoach) {
            const userDoc = await db.collection('users').doc(context.auth.uid).get();
            const isAdmin = userDoc.exists && ((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.role) === 'admin';
            if (!isAdmin) {
                throw new functions.https.HttpsError('permission-denied', 'You do not have permission to manage this team');
            }
        }
        // Filter out the player
        const updatedPlayers = (teamData.players || []).filter(p => p.id !== playerId);
        // Simple update operation - no transaction
        await teamRef.update({
            players: updatedPlayers,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        // Update user document separately - not critical for UI feedback
        db.collection('users').doc(playerId).update({
            teams: admin.firestore.FieldValue.arrayRemove(teamId),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }).catch(e => {
            // Just log errors updating user doc, don't fail the operation
            console.log('Warning: Could not update user document:', e);
        });
        // Return success with updated team data
        return {
            success: true,
            message: 'Player removed successfully',
            updatedTeam: Object.assign(Object.assign({}, teamData), { players: updatedPlayers, updatedAt: new Date().toISOString() })
        };
    }
    catch (error) {
        console.error('Error removing player:', error);
        throw new functions.https.HttpsError('internal', error instanceof Error ? error.message : 'Error removing player');
    }
});
/**
 * Updates a player's details within a team
 * Requires authentication and team manager permission
 */
exports.updatePlayerDetails = functions.https.onCall(async (data, context) => {
    // Check if the user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    // Validate the required parameters
    const { teamId, playerId, playerData } = data;
    if (!teamId || typeof teamId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a valid team ID.');
    }
    if (!playerId || typeof playerId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a valid player ID.');
    }
    if (!playerData || typeof playerData !== 'object') {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with player data.');
    }
    try {
        // Validate if the user has permission to manage the team
        const userId = context.auth.uid;
        await validateTeamManagerPermission(userId, teamId);
        // Begin a transaction to update the player
        const updatedPlayer = await admin.firestore().runTransaction(async (transaction) => {
            const teamRef = admin.firestore().collection('teams').doc(teamId);
            const teamDoc = await transaction.get(teamRef);
            if (!teamDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'The specified team does not exist.');
            }
            const teamData = teamDoc.data();
            const players = teamData.players || [];
            // Find the player to update
            const playerIndex = players.findIndex(p => p.id === playerId);
            if (playerIndex === -1) {
                throw new functions.https.HttpsError('not-found', 'The specified player does not exist in this team.');
            }
            // Update the player data while preserving fields that should not be modified
            const updatedPlayers = [...players];
            updatedPlayers[playerIndex] = Object.assign(Object.assign(Object.assign({}, players[playerIndex]), playerData), { id: playerId });
            // Update the team with the new player data
            transaction.update(teamRef, {
                players: updatedPlayers,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            return updatedPlayers[playerIndex];
        });
        return {
            success: true,
            player: updatedPlayer,
            message: 'Player updated successfully'
        };
    }
    catch (error) {
        console.error('Error updating player:', error);
        throw new functions.https.HttpsError('internal', error instanceof Error ? error.message : 'An unknown error occurred');
    }
});
/**
 * Removes a coach from a team
 * Requires authentication and team manager permission
 */
exports.removeCoachFromTeam = functions.https.onCall(async (data, context) => {
    var _a;
    // Require authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to perform this action');
    }
    // Validate required parameters
    if (!data.teamId || !data.coachId) {
        throw new functions.https.HttpsError('invalid-argument', 'Team ID and coach ID are required');
    }
    const { teamId, coachId } = data;
    const userId = context.auth.uid;
    try {
        // Get the team document
        const teamRef = admin.firestore().collection('teams').doc(teamId);
        const teamDoc = await teamRef.get();
        if (!teamDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Team not found');
        }
        const teamData = teamDoc.data();
        if (!teamData) {
            throw new functions.https.HttpsError('not-found', 'Team data not found');
        }
        // Validate the user has permission to manage this team
        // Only the head coach or an admin can remove coaches
        if (teamData.coachId !== userId) {
            // Check if user is an admin
            const userDoc = await admin.firestore().collection('users').doc(userId).get();
            if (!userDoc.exists || ((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
                throw new functions.https.HttpsError('permission-denied', 'Only the head coach or an admin can remove coaches');
            }
        }
        // Don't allow removing the head coach
        if (coachId === teamData.coachId) {
            throw new functions.https.HttpsError('failed-precondition', 'Cannot remove head coach');
        }
        // Check if the coach is actually on the team
        const coaches = teamData.coaches || [];
        if (!coaches.includes(coachId)) {
            throw new functions.https.HttpsError('not-found', 'Coach not found on this team');
        }
        // Begin transaction for data consistency
        return await admin.firestore().runTransaction(async (transaction) => {
            // Update team document
            transaction.update(teamRef, {
                coaches: admin.firestore.FieldValue.arrayRemove(coachId),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            // Update user's teams array
            const userRef = admin.firestore().collection('users').doc(coachId);
            const userDoc = await transaction.get(userRef);
            if (userDoc.exists) {
                transaction.update(userRef, {
                    teams: admin.firestore.FieldValue.arrayRemove(teamId),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
            return {
                success: true,
                message: 'Coach removed successfully',
                coachId,
                teamId
            };
        });
    }
    catch (error) {
        console.error('Error removing coach from team:', error);
        throw new functions.https.HttpsError('internal', error instanceof Error ? error.message : 'Unknown error');
    }
});
/**
 * Unlinks a parent from a player
 * Requires authentication and team manager permission
 */
exports.unlinkParentFromPlayer = functions.https.onCall(async (data, context) => {
    // Require authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to perform this action');
    }
    // Validate required parameters
    if (!data.teamId || !data.playerId || !data.parentId) {
        throw new functions.https.HttpsError('invalid-argument', 'Team ID, player ID, and parent ID are required');
    }
    const { teamId, playerId, parentId } = data;
    const userId = context.auth.uid;
    try {
        // Validate the user has permission to manage this team
        const hasPermission = await validateTeamManagerPermission(teamId, userId);
        if (!hasPermission) {
            throw new functions.https.HttpsError('permission-denied', 'You do not have permission to manage this team');
        }
        // Begin transaction for data consistency
        return await admin.firestore().runTransaction(async (transaction) => {
            // Get the team document
            const teamRef = admin.firestore().collection('teams').doc(teamId);
            const teamDoc = await transaction.get(teamRef);
            if (!teamDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'Team not found');
            }
            const teamData = teamDoc.data();
            if (!teamData) {
                throw new functions.https.HttpsError('not-found', 'Team data not found');
            }
            // Find the player
            const currentPlayers = teamData.players || [];
            const playerIndex = currentPlayers.findIndex((p) => p.id === playerId);
            if (playerIndex === -1) {
                throw new functions.https.HttpsError('not-found', 'Player not found in this team');
            }
            const player = currentPlayers[playerIndex];
            // Remove parent from the player's parents array
            const currentParents = player.parents || [];
            const updatedParents = currentParents.filter((p) => p.id !== parentId);
            // Update the player
            const updatedPlayer = Object.assign(Object.assign({}, player), { parents: updatedParents });
            // Update the team with the modified player
            const updatedPlayers = [...currentPlayers];
            updatedPlayers[playerIndex] = updatedPlayer;
            transaction.update(teamRef, {
                players: updatedPlayers,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            return {
                success: true,
                message: 'Parent unlinked from player successfully',
                player: updatedPlayer
            };
        });
    }
    catch (error) {
        console.error('Error unlinking parent from player:', error);
        throw new functions.https.HttpsError('internal', error instanceof Error ? error.message : 'Unknown error');
    }
});
//# sourceMappingURL=teamManagement.js.map