import { collection, query, where, getDocs, orderBy, limit, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { VolunteerStats, VolunteerHistory, VolunteerRole } from '../../types/volunteer';
import { handleVolunteerError } from './errors';

export async function fetchVolunteerStats(userId: string): Promise<VolunteerStats | null> {
  try {
    const statsRef = collection(db, 'volunteer_stats');
    const q = query(statsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Create default stats if none exist
      const defaultStats: Omit<VolunteerStats, 'id'> = {
        userId,
        totalHours: 0,
        eventsVolunteered: 0,
        roleBreakdown: {},
        updatedAt: new Date()
      };

      const docRef = await addDoc(statsRef, {
        ...defaultStats,
        updatedAt: Timestamp.fromDate(defaultStats.updatedAt)
      });

      return {
        ...defaultStats,
        id: docRef.id
      };
    }

    const data = snapshot.docs[0].data();
    return {
      ...data,
      id: snapshot.docs[0].id,
      lastVolunteered: data.lastVolunteered?.toDate(),
      updatedAt: data.updatedAt.toDate()
    } as VolunteerStats;
  } catch (error) {
    console.error('Error fetching volunteer stats:', error);
    throw handleVolunteerError(error);
  }
}

export async function fetchTeamVolunteerStats(teamId: string): Promise<Record<string, VolunteerStats>> {
  try {
    const statsRef = collection(db, 'volunteer_stats');
    const q = query(statsRef, where('teamId', '==', teamId));
    const snapshot = await getDocs(q);
    
    const stats: Record<string, VolunteerStats> = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      stats[data.userId] = {
        ...data,
        lastVolunteered: data.lastVolunteered?.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as VolunteerStats;
    });
    
    return stats;
  } catch (error) {
    console.error('Error fetching team volunteer stats:', error);
    throw handleVolunteerError(error);
  }
}

export async function fetchVolunteerHistory(userId: string): Promise<VolunteerHistory[]> {
  try {
    const historyRef = collection(db, 'volunteer_history');
    const q = query(
      historyRef,
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(10)
    );
    
    const snapshot = await getDocs(q);
    const history: VolunteerHistory[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      history.push({
        ...data,
        id: doc.id,
        date: data.date.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as VolunteerHistory);
    });

    return history;
  } catch (error) {
    console.error('Error fetching volunteer history:', error);
    throw handleVolunteerError(error);
  }
}

export async function fetchVolunteerRoles(teamId: string): Promise<VolunteerRole[]> {
  try {
    const rolesRef = collection(db, 'volunteer_roles');
    const q = query(
      rolesRef,
      where('teamId', '==', teamId),
      where('isActive', '==', true)
    );
    
    const snapshot = await getDocs(q);
    const roles: VolunteerRole[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      roles.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as VolunteerRole);
    });

    return roles;
  } catch (error) {
    console.error('Error fetching volunteer roles:', error);
    throw handleVolunteerError(error);
  }
}

export async function createVolunteerRole(teamId: string, role: Omit<VolunteerRole, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    // Validate required fields
    if (!teamId) throw new Error('Team ID is required');
    if (!role.name?.trim()) throw new Error('Role name is required');
    if (!role.description?.trim()) throw new Error('Role description is required');

    // Clean up the role data
    const roleData = {
      teamId,
      name: role.name.trim(),
      description: role.description.trim(),
      requiredSkills: role.requiredSkills?.filter(skill => skill.trim()) || [],
      minAge: role.minAge || null,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    // Create the role document
    const rolesRef = collection(db, 'volunteer_roles');
    const docRef = await addDoc(rolesRef, roleData);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating volunteer role:', error);
    throw handleVolunteerError(error);
  }
}

export async function updateVolunteerRole(roleId: string, updates: Partial<VolunteerRole>): Promise<void> {
  try {
    // Validate required fields
    if (!roleId) throw new Error('Role ID is required');
    if (updates.name !== undefined && !updates.name.trim()) {
      throw new Error('Role name cannot be empty');
    }
    if (updates.description !== undefined && !updates.description.trim()) {
      throw new Error('Role description cannot be empty');
    }

    // Clean up the update data
    const updateData = {
      ...updates,
      name: updates.name?.trim(),
      description: updates.description?.trim(),
      requiredSkills: updates.requiredSkills?.filter(skill => skill.trim()),
      updatedAt: Timestamp.now()
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    const roleRef = doc(db, 'volunteer_roles', roleId);
    await updateDoc(roleRef, updateData);
  } catch (error) {
    console.error('Error updating volunteer role:', error);
    throw handleVolunteerError(error);
  }
}

export async function deleteVolunteerRole(roleId: string): Promise<void> {
  try {
    const roleRef = doc(db, 'volunteer_roles', roleId);
    await updateDoc(roleRef, {
      isActive: false,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error deleting volunteer role:', error);
    throw handleVolunteerError(error);
  }
}