export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedDuration: number;
  emoji: string;
  completed: boolean;
  userId: string;
  dailyId: string;
  createdAt: Date;
  completedAt?: Date;
  developmentArea: string;
  time: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedDuration: number;
  emoji: string;
  userId: string;
  dailyId: string;
  developmentArea: string;
  time: string;
}

export interface UpdateTaskRequest {
  id: string;
  completed?: boolean;
  completedAt?: Date;
}
