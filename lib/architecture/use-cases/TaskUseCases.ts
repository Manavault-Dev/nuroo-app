import { CreateTaskRequest, Task, UpdateTaskRequest } from '../entities/Task';
import { ITaskRepository } from '../repositories/TaskRepository';

export class TaskUseCases {
  constructor(private taskRepository: ITaskRepository) {}

  async createTask(request: CreateTaskRequest): Promise<Task> {
    if (!request.title || !request.description) {
      throw new Error('Title and description are required');
    }

    if (!['easy', 'medium', 'hard'].includes(request.difficulty)) {
      throw new Error('Invalid difficulty level');
    }

    return await this.taskRepository.createTask(request);
  }

  async getTasksByUserId(userId: string): Promise<Task[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    return await this.taskRepository.getTasksByUserId(userId);
  }

  async getTasksByUserIdAndDate(userId: string, date: string): Promise<Task[]> {
    if (!userId || !date) {
      throw new Error('User ID and date are required');
    }

    return await this.taskRepository.getTasksByUserIdAndDate(userId, date);
  }

  async updateTask(request: UpdateTaskRequest): Promise<Task> {
    if (!request.id) {
      throw new Error('Task ID is required');
    }

    return await this.taskRepository.updateTask(request);
  }

  async deleteTask(taskId: string): Promise<void> {
    if (!taskId) {
      throw new Error('Task ID is required');
    }

    await this.taskRepository.deleteTask(taskId);
  }

  async getTaskById(taskId: string): Promise<Task | null> {
    if (!taskId) {
      throw new Error('Task ID is required');
    }

    return await this.taskRepository.getTaskById(taskId);
  }

  async completeTask(taskId: string): Promise<Task> {
    return await this.updateTask({
      id: taskId,
      completed: true,
      completedAt: new Date(),
    });
  }

  async uncompleteTask(taskId: string): Promise<Task> {
    return await this.updateTask({
      id: taskId,
      completed: false,
      completedAt: undefined,
    });
  }
}
