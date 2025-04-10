export interface ContentPermissions {
  drills: {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canVote: boolean;
    canComment: boolean;
  };
  lessons: {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canComplete: boolean;
  };
  collections: {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canFeature: boolean;
  };
}