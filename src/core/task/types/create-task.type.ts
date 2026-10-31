import { TaskPriority } from '../enums/task-priority.enum';
import { TaskStatus } from '../enums/task-status.enum';

export type CreateTaskInput = {
  title: string;
  description: string;
  priority?: TaskPriority;
  status?: TaskStatus;
};
