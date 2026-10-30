import { ITask } from './task.interface';
import { CreateTaskInput } from '../types/create-task.type';
import { UpdateTaskInput } from '../types/update-task.type';

/**
 * Puerto (Contrato) de Repositorio de Tareas.
 * Define las operaciones que cualquier adaptador de infraestructura (Mock o HTTP)
 * debe implementar para desacoplar la UI de la capa de datos.
 */
export interface ITaskRepository {
  /**
   * Obtiene la lista completa de tareas.
   */
  getAll(): Promise<ITask[]>;

  /**
   * Obtiene una tarea por su identificador único.
   */
  getById(id: string): Promise<ITask | null>;

  /**
   * Crea una nueva tarea y la persiste.
   */
  create(input: CreateTaskInput): Promise<ITask>;

  /**
   * Actualiza los datos de una tarea existente.
   */
  update(id: string, input: UpdateTaskInput): Promise<ITask>;

  /**
   * Elimina una tarea por su id.
   */
  delete(id: string): Promise<boolean>;

  /**
   * Restablece las tareas a los datos semilla iniciales (solo aplica a almacenamiento local/demo).
   */
  resetToMock?(): Promise<ITask[]>;
}
