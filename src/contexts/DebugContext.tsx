import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { rolePermissions } from '../types/permissions/roles';

interface DebugState {
  isEnabled: boolean;
  authInfo: {
    isAuthenticated: boolean;
    userId?: string;
    userRole?: string;
    userTeams?: string[];
  };
  permissions: {
    role: any;
    teams: Record<string, boolean>;
    events: Record<string, boolean>;
  };
}

const DebugContext = createContext<DebugState | null>(null);

export const DebugProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [debugState, setDebugState] = useState<DebugState>({
    isEnabled: import.meta.env.VITE_DEBUG_MODE === 'true',
    authInfo: {
      isAuthenticated: false
    },
    permissions: {
      role: {},
      teams: {},
      events: {}
    }
  });

  useEffect(() => {
    if (!debugState.isEnabled) return;

    setDebugState(prev => ({
      ...prev,
      authInfo: {
        isAuthenticated: !!currentUser,
        userId: currentUser?.id,
        userRole: currentUser?.role,
        userTeams: currentUser?.teams
      },
      permissions: {
        role: currentUser ? rolePermissions[currentUser.role] : {},
        teams: {},
        events: {}
      }
    }));
  }, [currentUser, debugState.isEnabled]);

  return (
    <DebugContext.Provider value={debugState}>
      {children}
    </DebugContext.Provider>
  );
};

export const useDebug = () => {
  const context = useContext(DebugContext);
  if (!context) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
};