import { TaskPriority } from '../enums/task-priority.enum';
import { TaskStatus } from '../enums/task-status.enum';
import { ITaskLocation } from './task-location.interface';

export interface ITask {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  photoUri?: string;
  photoName?: string;
  photoSizeKb?: number;
  location?: ITaskLocation;
  createdAt: string;
  updatedAt: string;
}
