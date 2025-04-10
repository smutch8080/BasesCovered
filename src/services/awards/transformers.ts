import { PracticeAward } from '../../types';

export function transformAward(id: string, data: any): PracticeAward {
  return {
    id,
    playerId: data.playerId,
    playerName: data.playerName,
    category: data.category,
    type: data.type,
    date: data.date.toDate(),
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate()
  };
}