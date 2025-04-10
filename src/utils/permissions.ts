import { User } from '../types/auth';
import { rolePermissions } from '../types/permissions/roles';
import { EventPermissions, EventAccessControl } from '../types/permissions/events';
import { TeamPermissions } from '../types/permissions/teams';

export function getEventPermissions(user: User | null, event: EventAccessControl): EventPermissions {
  if (!user) {
    return {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canManageRSVPs: false,
      canAttachPlans: false
    };
  }

  const role = rolePermissions[user.role];
  const isCreator = event.createdBy === user.id;
  const isTeamCoach = event.teamId ? user.teams.includes(event.teamId) && role.canManageTeams : false;

  return {
    canView: event.isCommunityEvent || isCreator || isTeamCoach || role.canCreateEvents,
    canCreate: role.canCreateEvents,
    canEdit: role.canEditEvents && (isCreator || isTeamCoach),
    canDelete: role.canDeleteEvents || isCreator,
    canManageRSVPs: isCreator || isTeamCoach,
    canAttachPlans: isCreator || isTeamCoach
  };
}

export function getTeamPermissions(user: User | null, teamId: string): TeamPermissions {
  if (!user) {
    return {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canManagePlayers: false,
      canManageCoaches: false,
      canApproveJoinRequests: false,
      canAssignRoles: false
    };
  }

  const role = rolePermissions[user.role];
  const isTeamMember = user.teams.includes(teamId);

  return {
    canView: isTeamMember || role.canManageTeams,
    canCreate: role.canManageTeams,
    canEdit: role.canManageTeams && isTeamMember,
    canDelete: role.canManageTeams && isTeamMember,
    canManagePlayers: role.canManageTeams && isTeamMember,
    canManageCoaches: (role.canManageTeams && isTeamMember) || role.canApproveRequests,
    canApproveJoinRequests: role.canApproveRequests && isTeamMember,
    canAssignRoles: role.canApproveRequests && isTeamMember
  };
}