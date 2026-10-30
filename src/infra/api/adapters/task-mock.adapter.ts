import AsyncStorage from '@react-native-async-storage/async-storage';
import { ITask } from '../../../core/task/interfaces/task.interface';
import { ITaskRepository } from '../../../core/task/interfaces/task-repository.interface';
import { CreateTaskInput } from '../../../core/task/types/create-task.type';
import { UpdateTaskInput } from '../../../core/task/types/update-task.type';
import { TaskPriority } from '../../../core/task/enums/task-priority.enum';
import { TaskStatus } from '../../../core/task/enums/task-status.enum';
import { INITIAL_TASKS_MOCK } from '../mocks/task.mock';

const STORAGE_KEY = '@ipss_todo_tasks_v1';
const SIMULATED_LATENCY_MS = 350;

/**
 * Adaptador Mock para Modo Demo
 * Simula latencia de red real mediante Promises y persiste en AsyncStorage
 * para que los datos no se pierdan al cerrar la app durante las pruebas.
 */
export class TaskMockAdapter implements ITaskRepository {
  private inMemoryTasks: ITask[] | null = null;

  private async simulateNetworkDelay(): Promise<void> {
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
        this.inMemoryTasks = [...INITIAL_TASKS_MOCK];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.inMemoryTasks));
      }
    } catch {
      this.inMemoryTasks = [...INITIAL_TASKS_MOCK];
    }

    return this.inMemoryTasks || [...INITIAL_TASKS_MOCK];
  }

  private async saveToStorage(tasks: ITask[]): Promise<void> {
    this.inMemoryTasks = tasks;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.warn('Error al persistir en AsyncStorage:', error);
    }
  }

  async getAll(): Promise<ITask[]> {
    await this.simulateNetworkDelay();
    const tasks = await this.loadFromStorage();
    // Retornamos una copia para evitar mutaciones directas
    return [...tasks];
  }

  async getById(id: string): Promise<ITask | null> {
    await this.simulateNetworkDelay();
    const tasks = await this.loadFromStorage();
    const found = tasks.find((t) => t.id === id);
    return found ? { ...found } : null;
  }

  async create(input: CreateTaskInput): Promise<ITask> {
    await this.simulateNetworkDelay();
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
    await this.simulateNetworkDelay();
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
    await this.simulateNetworkDelay();
    const tasks = await this.loadFromStorage();

    const filtered = tasks.filter((t) => t.id !== id);
    if (filtered.length === tasks.length) {
      return false;
    }

    await this.saveToStorage(filtered);
    return true;
  }

  async resetToMock(): Promise<ITask[]> {
    await this.simulateNetworkDelay();
    const freshMocks = [...INITIAL_TASKS_MOCK];
    await this.saveToStorage(freshMocks);
    return freshMocks;
  }
}
