import { ITaskRepository } from '../../../core/task/interfaces/task-repository.interface';
import { envConfig } from '../../../config/env.config';
import { TaskMockAdapter } from '../adapters/task-mock.adapter';
import { TaskHttpAdapter } from '../adapters/task-http.adapter';

/**
 * Patrón Factory: Desacopla la creación de instancias de infraestructura.
 * Evalúa el feature flag de entorno y entrega el adaptador correspondiente.
 */
export class TaskAdapterFactory {
  private static instance: ITaskRepository | null = null;

  public static getRepository(): ITaskRepository {
    if (!TaskAdapterFactory.instance) {
      if (envConfig.isDemoMode) {
        console.log('[TaskAdapterFactory] Inicializando TaskMockAdapter (Modo Demo)');
        TaskAdapterFactory.instance = new TaskMockAdapter();
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
