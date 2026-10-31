import { ITask } from './task.interface';
import { CreateTaskInput } from '../types/create-task.type';
import { UpdateTaskInput } from '../types/update-task.type';

export interface ITaskRepository {
  getAll(): Promise<ITask[]>;
  getById(id: string): Promise<ITask | null>;
  create(input: CreateTaskInput): Promise<ITask>;
  update(id: string, input: UpdateTaskInput): Promise<ITask>;
  delete(id: string): Promise<boolean>;
  resetToSeed?(): Promise<ITask[]>;
}
