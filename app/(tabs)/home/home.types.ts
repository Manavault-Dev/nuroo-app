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
  dailyId: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // in minutes
}

export interface ChildData {
  name?: string;
  age?: string;
  diagnosis?: string;
  developmentAreas?: string[];
  progress?: UserProgress;
  lastTaskDate?: string; // ISO date string
  onboardingCompleted?: boolean;
  onboardingCompletedAt?: Date;
}

export interface UserProgress {
  communication: number; // 0-100
  motor_skills: number; // 0-100
  social: number; // 0-100
  cognitive: number; // 0-100
  sensory: number; // 0-100
  behavior: number; // 0-100
}

export interface TaskGenerationResult {
  success: boolean;
  tasks?: Task[];
  error?: string;
}

export interface DailyTaskSet {
  id: string;
  userId: string;
  date: string; // ISO date string
  tasks: Task[];
  generatedAt: Date;
  progressSnapshot: UserProgress;
}
