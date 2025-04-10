import { UserRole } from '../auth';

export interface RolePermissions {
  canCreateEvents: boolean;
  canEditEvents: boolean;
  canDeleteEvents: boolean;
  canManageTeams: boolean;
  canAssignHomework: boolean;
  canManageDrills: boolean;
  canManageLessons: boolean;
  canApproveRequests: boolean;
}

export const rolePermissions: Record<UserRole, RolePermissions> = {
  admin: {
    canCreateEvents: true,
    canEditEvents: true,
    canDeleteEvents: true,
    canManageTeams: true,
    canAssignHomework: true,
    canManageDrills: true,
    canManageLessons: true,
    canApproveRequests: true
  },
  league_manager: {
    canCreateEvents: true,
    canEditEvents: true,
    canDeleteEvents: true,
    canManageTeams: true,
    canAssignHomework: false,
    canManageDrills: false,
    canManageLessons: false,
    canApproveRequests: true
  },
  manager: {
    canCreateEvents: true,
    canEditEvents: true,
    canDeleteEvents: false,
    canManageTeams: true,
    canAssignHomework: true,
    canManageDrills: false,
    canManageLessons: false,
    canApproveRequests: true
  },
  coach: {
    canCreateEvents: true,
    canEditEvents: true,
    canDeleteEvents: false,
    canManageTeams: true,
    canAssignHomework: true,
    canManageDrills: false,
    canManageLessons: false,
    canApproveRequests: false
  },
  player: {
    canCreateEvents: false,
    canEditEvents: false,
    canDeleteEvents: false,
    canManageTeams: false,
    canAssignHomework: false,
    canManageDrills: false,
    canManageLessons: false,
    canApproveRequests: false
  },
  parent: {
    canCreateEvents: false,
    canEditEvents: false,
    canDeleteEvents: false,
    canManageTeams: false,
    canAssignHomework: false,
    canManageDrills: false,
    canManageLessons: false,
    canApproveRequests: false
  }
};