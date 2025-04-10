export enum HelpSection {
  GettingStarted = 'getting-started',
  Teams = 'teams',
  PracticePlans = 'practice-plans',
  Drills = 'drills',
  Progress = 'progress',
  Homework = 'homework',
  Events = 'events',
  Scenarios = 'scenarios',
  Clinics = 'clinics',
  Coaches = 'coaches',
  Settings = 'settings'
}

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  section: HelpSection;
  order: number;
  tags: string[];
  relatedArticles: string[];
  createdAt: Date;
  updatedAt: Date;
}