export enum LessonCategory {
  Fundamentals = 'Fundamentals',
  AdvancedTechniques = 'Advanced Techniques',
  TeamStrategy = 'Team Strategy',
  GameManagement = 'Game Management',
  PlayerDevelopment = 'Player Development',
  MentalPreparation = 'Mental Preparation',
  SafetyAndInjuryPrevention = 'Safety & Injury Prevention',
  Leadership = 'Leadership'
}

export interface Lesson {
  id: string;
  title: string;
  category: LessonCategory;
  summary: string;
  introduction: string;
  basics: string;
  mechanics: string;
  insights: string;
  conclusion: string;
  faqs: string;
  practicePlans: {
    id: string;
    name: string;
  }[];
  collections: {
    id: string;
    name: string;
  }[];
  resources: {
    type: 'video' | 'document';
    title: string;
    url: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}