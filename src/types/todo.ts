export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  createdAt: Date;
  createdBy: string;
  assignedTo: {
    type: 'user' | 'group' | 'team';
    id: string;
    name: string;
  };
  teamId?: string;
  updatedAt: Date;
}

export interface TodoAssignment {
  type: 'user' | 'group' | 'team';
  id: string;
  name: string;
}