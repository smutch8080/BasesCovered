import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';

interface Props {
  children: React.ReactNode;
  requiredRole?: string;
  leagueId?: string;
  teamId?: string;
}

export const ProtectedRoute: React.FC<Props> = ({
  children,
  requiredRole,
  leagueId,
  teamId
}) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/auth?mode=signin" />;
  }

  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }

  if (leagueId && !currentUser.isInLeague(leagueId)) {
    return <Navigate to="/unauthorized" />;
  }

  if (teamId && !currentUser.isInTeam(teamId)) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
};