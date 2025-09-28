import { CreateTaskRequest, Task, UpdateTaskRequest } from '../entities/Task';

export interface ITaskRepository {
  createTask(request: CreateTaskRequest): Promise<Task>;
  getTasksByUserId(userId: string): Promise<Task[]>;
  getTasksByUserIdAndDate(userId: string, date: string): Promise<Task[]>;
  updateTask(request: UpdateTaskRequest): Promise<Task>;
  deleteTask(taskId: string): Promise<void>;
  getTaskById(taskId: string): Promise<Task | null>;
}

export class TaskRepository implements ITaskRepository {
  async createTask(request: CreateTaskRequest): Promise<Task> {
    throw new Error('Method not implemented.');
  }

  async getTasksByUserId(userId: string): Promise<Task[]> {
    throw new Error('Method not implemented.');
  }

  async getTasksByUserIdAndDate(userId: string, date: string): Promise<Task[]> {
    throw new Error('Method not implemented.');
  }

  async updateTask(request: UpdateTaskRequest): Promise<Task> {
    throw new Error('Method not implemented.');
  }

  async deleteTask(taskId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async getTaskById(taskId: string): Promise<Task | null> {
    throw new Error('Method not implemented.');
  }
}
