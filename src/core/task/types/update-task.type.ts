import { TaskPriority } from '../enums/task-priority.enum';
import { TaskStatus } from '../enums/task-status.enum';

/**
 * Parámetros permitidos para actualizar una tarea existente.
 * Todos los campos son opcionales (Partial update).
 */
export type UpdateTaskInput = {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
};
