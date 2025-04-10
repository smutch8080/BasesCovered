export enum AgeDivision {
  'Under6' = 'Under 6U',
  '6U' = '6U',
  '8U' = '8U',
  '10U' = '10U',
  '12U' = '12U',
  '14U' = '14U',
  '16U' = '16U',
  '18Plus' = '18U+'
}

export enum TeamType {
  Recreation = 'Recreation',
  Travel = 'Travel'
}

export enum Position {
  Pitcher = 'Pitcher',
  Catcher = 'Catcher',
  First = '1st Base',
  Second = '2nd Base',
  Third = '3rd Base',
  ShortStop = 'Short Stop',
  LeftField = 'Left Field',
  CenterField = 'Center Field',
  RightField = 'Right Field',
  DesignatedHitter = 'Designated Hitter'
}

export interface Location {
  city: string;
  state: string;
  country: string;
  placeId: string;
}

export interface Player {
  id: string;
  name: string;
  jerseyNumber: string;
  age: number;
  positions: Position[];
  parents?: { id: string; name: string }[];
  email?: string;
}

export interface JoinRequest {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  message: string;
  status: 'pending' | 'approved' | 'declined';
  createdAt: Date | { toDate: () => Date } | any;
  updatedAt: Date | { toDate: () => Date } | any;
}

export interface Team {
  id: string;
  name: string;
  location: Location;
  ageDivision: AgeDivision;
  type: TeamType;
  players: Player[];
  coaches: string[];
  coachId: string;
  parents: { id: string; name: string }[];
  joinRequests: JoinRequest[];
  inviteHash?: string;
  leagueId?: string | null;
  createdAt: Date | { toDate: () => Date } | any;
  updatedAt: Date | { toDate: () => Date } | any;
  logoUrl?: string;
}