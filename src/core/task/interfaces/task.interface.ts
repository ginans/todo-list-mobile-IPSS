import { TaskPriority } from '../enums/task-priority.enum';
import { TaskStatus } from '../enums/task-status.enum';

/**
 * Entidad principal de Tarea (Task).
 * Cumple con los requisitos mínimos de título y descripción,
 * agregando metadatos para trazabilidad, prioridad y estado.
 */
export interface ITask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
