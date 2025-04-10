import { Drill } from './index';

export interface HomeworkAttachment {
  id: string;
  type: 'video' | 'pdf' | 'image';
  url: string;
  name: string;
  createdAt: Date;
}

export interface HomeworkSubmission {
  id: string;
  playerId: string;
  playerName: string;
  status: 'completed' | 'incomplete';
  comment?: string;
  attachments: HomeworkAttachment[];
  submittedAt: Date;
  updatedAt: Date;
}

export interface Homework {
  id: string;
  title: string;
  description: string;
  drills: Drill[];
  dueDate: Date;
  teamId: string;
  playerId?: string;
  playerName?: string;
  createdBy: string;
  attachments: HomeworkAttachment[];
  submissions: HomeworkSubmission[];
  createdAt: Date;
  updatedAt: Date;
}