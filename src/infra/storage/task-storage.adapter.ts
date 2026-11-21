import AsyncStorage from '@react-native-async-storage/async-storage';
import { ITask } from '../../core/task/interfaces/task.interface';
import { ITaskRepository } from '../../core/task/interfaces/task-repository.interface';
import { CreateTaskInput } from '../../core/task/types/create-task.type';
import { UpdateTaskInput } from '../../core/task/types/update-task.type';
import { TaskPriority } from '../../core/task/enums/task-priority.enum';
import { TaskStatus } from '../../core/task/enums/task-status.enum';
import { deletePersistedPhoto } from '../device/camera.service';
import { APP_MESSAGES } from '../../constants/messages.constants';

export const TASKS_STORAGE_BASE_KEY = '@todo_tasks_v2';

export class TaskStorageAdapter implements ITaskRepository {
  private inMemoryTasks: ITask[] | null = null;
  private readonly storageKey: string;
  private readonly userId?: string;

  constructor(userId?: string) {
    this.userId = userId;
    this.storageKey = userId ? `${TASKS_STORAGE_BASE_KEY}_${userId}` : TASKS_STORAGE_BASE_KEY;
  }

  private async loadFromStorage(): Promise<ITask[]> {
    if (this.inMemoryTasks) {
      return this.inMemoryTasks;
    }

    try {
      const stored = await AsyncStorage.getItem(this.storageKey);
      this.inMemoryTasks = stored ? (JSON.parse(stored) as ITask[]) : [];
    } catch {
      this.inMemoryTasks = [];
    }

    return this.inMemoryTasks || [];
  }

  private async saveToStorage(tasks: ITask[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(tasks));
      this.inMemoryTasks = tasks;
    } catch {
      throw new Error(APP_MESSAGES.TASKS.STORAGE_SAVE_ERROR);
    }
  }

  async getAll(): Promise<ITask[]> {
    const tasks = await this.loadFromStorage();
    return [...tasks];
  }

  async getById(id: string): Promise<ITask | null> {
    const tasks = await this.loadFromStorage();
    const found = tasks.find((t) => t.id === id);
    return found ? { ...found } : null;
  }

  async create(input: CreateTaskInput): Promise<ITask> {
    const tasks = await this.loadFromStorage();

    const now = new Date().toISOString();
    const newTask: ITask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: input.userId ?? this.userId,
      title: input.title.trim(),
      description: input.description?.trim() || '',
      status: input.status || TaskStatus.PENDING,
      priority: input.priority || TaskPriority.MEDIUM,
      ...(input.photoUri ? { photoUri: input.photoUri } : {}),
      ...(input.photoName ? { photoName: input.photoName } : {}),
      ...(input.photoSizeKb !== undefined ? { photoSizeKb: input.photoSizeKb } : {}),
      ...(input.location ? { location: input.location } : {}),
      createdAt: now,
      updatedAt: now,
    };

    const updatedTasks = [newTask, ...tasks];
    await this.saveToStorage(updatedTasks);
    return newTask;
  }

  async update(id: string, input: UpdateTaskInput): Promise<ITask> {
    const tasks = await this.loadFromStorage();

    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(APP_MESSAGES.TASKS.NOT_FOUND(id));
    }

    const existing = tasks[index];
    const previousPhotoUri = existing.photoUri;

    const updated: ITask = {
      ...existing,
      ...(input.title !== undefined && { title: input.title.trim() }),
      ...(input.description !== undefined && { description: input.description.trim() }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.priority !== undefined && { priority: input.priority }),
      updatedAt: new Date().toISOString(),
    };

    if (input.photoUri === null) {
      delete updated.photoUri;
      delete updated.photoName;
      delete updated.photoSizeKb;
    } else if (input.photoUri !== undefined) {
      updated.photoUri = input.photoUri;
      if (input.photoName !== undefined && input.photoName !== null) {
        updated.photoName = input.photoName;
      }
      if (input.photoSizeKb !== undefined && input.photoSizeKb !== null) {
        updated.photoSizeKb = input.photoSizeKb;
      }
    }

    if (input.location === null) {
      delete updated.location;
    } else if (input.location !== undefined) {
      updated.location = input.location;
    }

    const nextTasks = [...tasks];
    nextTasks[index] = updated;
    await this.saveToStorage(nextTasks);

    if (previousPhotoUri && previousPhotoUri !== updated.photoUri) {
      await deletePersistedPhoto(previousPhotoUri);
    }

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const tasks = await this.loadFromStorage();

    const target = tasks.find((t) => t.id === id);
    if (!target) {
      return false;
    }

    const filtered = tasks.filter((t) => t.id !== id);
    await this.saveToStorage(filtered);

    if (target.photoUri) {
      await deletePersistedPhoto(target.photoUri);
    }

    return true;
  }
}
