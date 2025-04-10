import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy, limit, startAt, endAt, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export interface UserData {
  id: string;
  displayName: string;
  email: string;
  role?: string;
  teams?: string[];
  teamNames?: string[];
  profilePicture?: string;
  lastActive?: Date;
}

export function useUsers() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all users (with pagination in a real app)
  const fetchUsers = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      setUsers([]);
      setFilteredUsers([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, you'd implement pagination and more sophisticated filtering
      const usersRef = collection(db, 'users');
      const usersQuery = query(
        usersRef,
        orderBy('displayName'),
        limit(100) // Limit to 100 users for performance
      );
      
      const snapshot = await getDocs(usersQuery);
      const fetchedUsers: UserData[] = [];
      
      snapshot.forEach((doc) => {
        const userData = doc.data();
        
        // Skip the current user
        if (doc.id === currentUser.id) return;
        
        fetchedUsers.push({
          id: doc.id,
          displayName: userData.displayName || 'Unknown User',
          email: userData.email || '',
          role: userData.role,
          teams: userData.teams || [],
          teamNames: userData.teamNames || [],
          profilePicture: userData.profilePicture,
          lastActive: userData.lastActive ? new Date(userData.lastActive.toDate()) : undefined
        });
      });
      
      setUsers(fetchedUsers);
      setFilteredUsers(fetchedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch users'));
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Search users by name, email, role, or team
  const searchUsers = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const lowerCaseQuery = query.toLowerCase();
    const filtered = users.filter(user => {
      return (
        user.displayName.toLowerCase().includes(lowerCaseQuery) ||
        user.email.toLowerCase().includes(lowerCaseQuery) ||
        user.role?.toLowerCase().includes(lowerCaseQuery) ||
        user.teamNames?.some(team => team.toLowerCase().includes(lowerCaseQuery))
      );
    });
    
    setFilteredUsers(filtered);
  }, [users]);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Advanced search with Firebase (for larger datasets)
  const searchUsersInFirebase = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim() || !currentUser) {
      setFilteredUsers(users);
      return;
    }
    
    setLoading(true);
    
    try {
      // This is a simple prefix search - in a production app, you might want to use
      // a more sophisticated search solution like Algolia or Elasticsearch
      const usersRef = collection(db, 'users');
      const capitalizedSearchTerm = searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1).toLowerCase();
      
      const nameQuery = query(
        usersRef,
        orderBy('displayName'),
        startAt(searchTerm.toLowerCase()),
        endAt(searchTerm.toLowerCase() + '\uf8ff'),
        limit(20)
      );
      
      const capitalizedNameQuery = query(
        usersRef,
        orderBy('displayName'),
        startAt(capitalizedSearchTerm),
        endAt(capitalizedSearchTerm + '\uf8ff'),
        limit(20)
      );
      
      const emailQuery = query(
        usersRef,
        orderBy('email'),
        startAt(searchTerm.toLowerCase()),
        endAt(searchTerm.toLowerCase() + '\uf8ff'),
        limit(20)
      );
      
      // Execute all queries in parallel
      const [nameSnapshot, capitalizedNameSnapshot, emailSnapshot] = await Promise.all([
        getDocs(nameQuery),
        getDocs(capitalizedNameQuery),
        getDocs(emailQuery)
      ]);
      
      // Combine results and remove duplicates
      const uniqueUsers = new Map<string, UserData>();
      
      const processSnapshot = (snapshot: QueryDocumentSnapshot<any>[]) => {
        snapshot.forEach(doc => {
          if (doc.id === currentUser.id) return; // Skip current user
          
          if (!uniqueUsers.has(doc.id)) {
            const userData = doc.data();
            uniqueUsers.set(doc.id, {
              id: doc.id,
              displayName: userData.displayName || 'Unknown User',
              email: userData.email || '',
              role: userData.role,
              teams: userData.teams || [],
              teamNames: userData.teamNames || [],
              profilePicture: userData.profilePicture,
              lastActive: userData.lastActive ? new Date(userData.lastActive.toDate()) : undefined
            });
          }
        });
      };
      
      processSnapshot(nameSnapshot.docs);
      processSnapshot(capitalizedNameSnapshot.docs);
      processSnapshot(emailSnapshot.docs);
      
      setFilteredUsers(Array.from(uniqueUsers.values()));
    } catch (err) {
      console.error('Error searching users:', err);
      setError(err instanceof Error ? err : new Error('Failed to search users'));
    } finally {
      setLoading(false);
    }
  }, [currentUser, users]);

  return {
    users,
    filteredUsers,
    loading,
    error,
    searchQuery,
    searchUsers,
    searchUsersInFirebase,
    refreshUsers: fetchUsers
  };
} 