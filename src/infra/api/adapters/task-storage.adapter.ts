import AsyncStorage from '@react-native-async-storage/async-storage';
import { ITask } from '../../../core/task/interfaces/task.interface';
import { ITaskRepository } from '../../../core/task/interfaces/task-repository.interface';
import { CreateTaskInput } from '../../../core/task/types/create-task.type';
import { UpdateTaskInput } from '../../../core/task/types/update-task.type';
import { TaskPriority } from '../../../core/task/enums/task-priority.enum';
import { TaskStatus } from '../../../core/task/enums/task-status.enum';
import { TASK_SEEDS } from '../seeds/task.seed';

const STORAGE_KEY = '@todo_tasks_v1';
const SIMULATED_LATENCY_MS = 250;

export class TaskStorageAdapter implements ITaskRepository {
  private inMemoryTasks: ITask[] | null = null;

  private async simulateDelay(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
  }

  private async loadFromStorage(): Promise<ITask[]> {
    if (this.inMemoryTasks) {
      return this.inMemoryTasks;
    }

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.inMemoryTasks = JSON.parse(stored);
      } else {
        this.inMemoryTasks = [...TASK_SEEDS];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.inMemoryTasks));
      }
    } catch {
      this.inMemoryTasks = [...TASK_SEEDS];
    }

    return this.inMemoryTasks || [...TASK_SEEDS];
  }

  private async saveToStorage(tasks: ITask[]): Promise<void> {
    this.inMemoryTasks = tasks;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.warn('[TaskStorageAdapter] Error al persistir en AsyncStorage:', error);
    }
  }

  async getAll(): Promise<ITask[]> {
    await this.simulateDelay();
    const tasks = await this.loadFromStorage();
    return [...tasks];
  }

  async getById(id: string): Promise<ITask | null> {
    await this.simulateDelay();
    const tasks = await this.loadFromStorage();
    const found = tasks.find((t) => t.id === id);
    return found ? { ...found } : null;
  }

  async create(input: CreateTaskInput): Promise<ITask> {
    await this.simulateDelay();
    const tasks = await this.loadFromStorage();

    const now = new Date().toISOString();
    const newTask: ITask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: input.title.trim(),
      description: input.description.trim(),
      status: input.status || TaskStatus.PENDING,
      priority: input.priority || TaskPriority.MEDIUM,
      createdAt: now,
      updatedAt: now,
    };

    const updatedTasks = [newTask, ...tasks];
    await this.saveToStorage(updatedTasks);
    return newTask;
  }

  async update(id: string, input: UpdateTaskInput): Promise<ITask> {
    await this.simulateDelay();
    const tasks = await this.loadFromStorage();

    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Tarea con ID ${id} no encontrada.`);
    }

    const existing = tasks[index];
    const updated: ITask = {
      ...existing,
      ...(input.title !== undefined && { title: input.title.trim() }),
      ...(input.description !== undefined && { description: input.description.trim() }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.priority !== undefined && { priority: input.priority }),
      updatedAt: new Date().toISOString(),
    };

    tasks[index] = updated;
    await this.saveToStorage([...tasks]);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    await this.simulateDelay();
    const tasks = await this.loadFromStorage();

    const filtered = tasks.filter((t) => t.id !== id);
    if (filtered.length === tasks.length) {
      return false;
    }

    await this.saveToStorage(filtered);
    return true;
  }

  async resetToSeed(): Promise<ITask[]> {
    await this.simulateDelay();
    const freshSeeds = [...TASK_SEEDS];
    await this.saveToStorage(freshSeeds);
    return freshSeeds;
  }
}
