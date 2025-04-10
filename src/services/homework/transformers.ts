import { Homework } from '../../types/homework';

export function transformHomework(id: string, data: any): Homework {
  return {
    ...data,
    id,
    dueDate: data.dueDate.toDate(),
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
    submissions: data.submissions || []
  } as Homework;
}