export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface PracticePlanRequest {
  focus: string;
  duration: number;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  playerCount?: number;
  equipment?: string[];
}