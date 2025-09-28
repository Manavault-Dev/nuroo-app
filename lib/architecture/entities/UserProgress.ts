export interface UserProgress {
  communication: number;
  motor_skills: number;
  social: number;
  cognitive: number;
  sensory: number;
  behavior: number;
}

export interface ProgressUpdate {
  area: keyof UserProgress;
  value: number;
  userId: string;
  timestamp: Date;
}

export interface LevelData {
  current: number;
  progress: number;
  totalTasks: number;
  nextLevelTasks: number;
}
