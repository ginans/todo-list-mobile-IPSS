import { TaskPriority } from '../enums/task-priority.enum';
import { TaskStatus } from '../enums/task-status.enum';
import { ITaskLocation } from '../interfaces/task-location.interface';

export type CreateTaskInput = {
  userId?: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  photoUri?: string;
  photoName?: string;
  photoSizeKb?: number;
  location?: ITaskLocation;
};
