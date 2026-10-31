import { ITaskRepository } from '../../../core/task/interfaces/task-repository.interface';
import { envConfig } from '../../../config/env.config';
import { TaskStorageAdapter } from '../adapters/task-storage.adapter';
import { TaskHttpAdapter } from '../adapters/task-http.adapter';

export class TaskAdapterFactory {
  private static instance: ITaskRepository | null = null;

  public static getRepository(): ITaskRepository {
    if (!TaskAdapterFactory.instance) {
      TaskAdapterFactory.instance = envConfig.isDemoMode
        ? new TaskStorageAdapter()
        : new TaskHttpAdapter(envConfig.apiUrl);
    }

    return TaskAdapterFactory.instance;
  }

  public static resetInstance(): void {
    TaskAdapterFactory.instance = null;
  }
}
