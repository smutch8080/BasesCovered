import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';

interface Props {
  children: React.ReactNode;
  requiredRole?: UserRole;
  leagueId?: string;
  teamId?: string;
}

export const ProtectedRoute: React.FC<Props> = ({
  children,
  requiredRole,
  leagueId,
  teamId
}) => {
  const { currentUser, hasPermission, isInLeague, isInTeam } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && !hasPermission(requiredRole)) {
    return <Navigate to="/unauthorized" />;
  }

  if (leagueId && !isInLeague(leagueId)) {
    return <Navigate to="/unauthorized" />;
  }

  if (teamId && !isInTeam(teamId)) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
};