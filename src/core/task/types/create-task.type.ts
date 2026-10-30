import { TaskPriority } from '../enums/task-priority.enum';
import { TaskStatus } from '../enums/task-status.enum';

/**
 * Parámetros requeridos para crear una nueva tarea.
 */
export type CreateTaskInput = {
  title: string;
  description: string;
  priority?: TaskPriority;
  status?: TaskStatus;
};
