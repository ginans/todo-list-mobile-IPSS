import { TaskStatus } from '../enums/task-status.enum';

export type TaskFilterType = 'ALL' | TaskStatus;

export interface ITaskFilter {
  status: TaskFilterType;
  searchTerm?: string;
}
