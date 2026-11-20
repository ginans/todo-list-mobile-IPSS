import { TaskPriority } from '../enums/task-priority.enum';
import { TaskStatus } from '../enums/task-status.enum';
import { ITaskLocation } from '../interfaces/task-location.interface';

export type UpdateTaskInput = {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  photoUri?: string | null;
  photoSizeKb?: number | null;
  location?: ITaskLocation | null;
};
