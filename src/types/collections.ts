export interface Collection {
  id: string;
  title: string;
  description: string;
  featured: boolean;
  userId: string;
  practicePlans: {
    id: string;
    name: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}