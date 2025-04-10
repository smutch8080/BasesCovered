import { Position } from './team';

export enum ResourceType {
  Link = 'link',
  File = 'file',
  Youtube = 'youtube',
  Other = 'other'
}

export interface BaseResource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  url?: string;
  content?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamResource extends BaseResource {
  teamId: string;
  access: {
    type: 'all' | 'parents' | 'coaches' | 'players';
    positions?: Position[];
  };
}

export interface LeagueResource extends BaseResource {
  leagueId: string;
  access: {
    type: 'all' | 'coaches' | 'teams';
    teamIds?: string[];
  };
}

export interface CommunityResource extends BaseResource {
  isCommunityResource: true;
  category: 'drills' | 'coaching' | 'training' | 'rules' | 'equipment' | 'other';
  tags: string[];
}