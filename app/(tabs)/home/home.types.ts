export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  time: string;
  emoji: string;
  completed: boolean;
  createdAt: Date;
  developmentArea: string;
}

export interface ChildData {
  name?: string;
  age?: string;
  diagnosis?: string;
  developmentAreas?: string[];
}

export interface TaskGenerationResult {
  success: boolean;
  tasks?: Task[];
  error?: string;
}
