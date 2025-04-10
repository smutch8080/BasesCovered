export interface TeamPermissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManagePlayers: boolean;
  canManageCoaches: boolean;
  canApproveJoinRequests: boolean;
  canAssignRoles: boolean;
}

export interface TeamMemberPermissions {
  canViewDetails: boolean;
  canEditDetails: boolean;
  canViewProgress: boolean;
  canCreateReports: boolean;
  canViewHomework: boolean;
  canSubmitHomework: boolean;
}