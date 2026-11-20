import { ITaskRepository } from '../../../core/task/interfaces/task-repository.interface';
import { envConfig } from '../../../config/env.config';
import { TaskStorageAdapter } from '../adapters/task-storage.adapter';
import { TaskHttpAdapter } from '../adapters/task-http.adapter';

export class TaskAdapterFactory {
  private static instances = new Map<string, ITaskRepository>();

  public static getRepository(userId?: string): ITaskRepository {
    const cacheKey = `${envConfig.isDemoMode ? 'local' : 'http'}:${userId ?? 'default'}`;

    const existing = TaskAdapterFactory.instances.get(cacheKey);
    if (existing) {
      return existing;
    }

    const instance: ITaskRepository = envConfig.isDemoMode
      ? new TaskStorageAdapter(userId)
      : new TaskHttpAdapter(envConfig.apiUrl);

    TaskAdapterFactory.instances.set(cacheKey, instance);
    return instance;
  }

  public static resetInstance(): void {
    TaskAdapterFactory.instances.clear();
  }
}
