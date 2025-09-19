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
  estimatedDuration: number;
}

export interface ChildData {
  name?: string;
  age?: string;
  diagnosis?: string;
  developmentAreas?: string[];
  progress?: UserProgress;
  lastTaskDate?: string;
  onboardingCompleted?: boolean;
  onboardingCompletedAt?: Date;
}

export interface UserProgress {
  communication: number;
  motor_skills: number;
  social: number;
  cognitive: number;
  sensory: number;
  behavior: number;
}

export interface TaskGenerationResult {
  success: boolean;
  tasks?: Task[];
  error?: string;
}

export interface DailyTaskSet {
  id: string;
  userId: string;
  date: string;
  tasks: Task[];
  generatedAt: Date;
  progressSnapshot: UserProgress;
}
