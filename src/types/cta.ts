// src/types/cta.ts
export enum CTATemplate {
  Basic = 'basic',
  Hero = 'hero',
  Feature = 'feature',
  Alert = 'alert',
  Banner = 'banner',
  Card = 'card'
}

export interface CTAContent {
  id: string;
  locationId: string;
  title: string;
  content: string;
  buttonText?: string;
  buttonLink?: string;
  imageUrl?: string;
  roles: string[];
  priority: number;
  active: boolean;
  template?: CTATemplate; // Make template optional to support existing content
  backgroundColor?: string;
  textColor?: string;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CTALocation {
  id: string;
  name: string;
  description: string;
  placement: 'dashboard' | 'teams' | 'events' | 'custom';
  customLocation?: string;
}
