import { ITaskRepository } from '../../../core/task/interfaces/task-repository.interface';
import { envConfig } from '../../../config/env.config';
import { TaskStorageAdapter } from '../adapters/task-storage.adapter';
import { TaskHttpAdapter } from '../adapters/task-http.adapter';

/**
 * Patrón Factory: Desacopla la creación de instancias de infraestructura.
 * Evalúa el feature flag de entorno y entrega el adaptador correspondiente:
 * - Modo Local: TaskStorageAdapter (AsyncStorage con Seeding automático)
 * - Modo API: TaskHttpAdapter (Cliente HTTP para backend NestJS)
 */
export class TaskAdapterFactory {
  private static instance: ITaskRepository | null = null;

  public static getRepository(): ITaskRepository {
    if (!TaskAdapterFactory.instance) {
      if (envConfig.isDemoMode) {
        console.log('[TaskAdapterFactory] Inicializando TaskStorageAdapter (Modo Local con Seed)');
        TaskAdapterFactory.instance = new TaskStorageAdapter();
      } else {
        console.log(`[TaskAdapterFactory] Inicializando TaskHttpAdapter con URL: ${envConfig.apiUrl}`);
        TaskAdapterFactory.instance = new TaskHttpAdapter(envConfig.apiUrl);
      }
    }

    return TaskAdapterFactory.instance;
  }

  /**
   * Permite reconfigurar o resetear la instancia (útil para tests o cambio dinámico de flags)
   */
  public static resetInstance(): void {
    TaskAdapterFactory.instance = null;
  }
}
