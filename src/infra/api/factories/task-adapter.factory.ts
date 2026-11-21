import { ITaskRepository } from '../../../core/task/interfaces/task-repository.interface';
import { envConfig } from '../../../config/env.config';
import { TaskStorageAdapter } from '../../storage/task-storage.adapter';
import { TaskHttpAdapter } from '../adapters/task-http.adapter';

export class TaskAdapterFactory {
  private static instances = new Map<string, ITaskRepository>();

  public static getRepository(userId?: string): ITaskRepository {
    const cacheKey = `${envConfig.dataSource}:${userId ?? 'default'}`;

    const existing = TaskAdapterFactory.instances.get(cacheKey);
    if (existing) {
      return existing;
    }

    const instance: ITaskRepository =
      envConfig.dataSource === 'local'
        ? new TaskStorageAdapter(userId)
        : new TaskHttpAdapter(envConfig.apiUrl);

    TaskAdapterFactory.instances.set(cacheKey, instance);
    return instance;
  }

  public static evictRepository(userId?: string): void {
    const cacheKey = `${envConfig.dataSource}:${userId ?? 'default'}`;
    TaskAdapterFactory.instances.delete(cacheKey);
  }

  public static resetInstance(): void {
    TaskAdapterFactory.instances.clear();
  }
}
