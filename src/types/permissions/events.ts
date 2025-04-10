import { EventType } from '../events';

export interface EventPermissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageRSVPs: boolean;
  canAttachPlans: boolean;
}

export interface EventTypePermissions {
  allowedTypes: EventType[];
  canCreateCommunity: boolean;
  requiresApproval: boolean;
}

export interface EventAccessControl {
  isTeamEvent: boolean;
  isCommunityEvent: boolean;
  createdBy: string;
  teamId?: string;
}