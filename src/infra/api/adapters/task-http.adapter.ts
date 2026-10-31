import { ITask } from '../../../core/task/interfaces/task.interface';
import { ITaskRepository } from '../../../core/task/interfaces/task-repository.interface';
import { CreateTaskInput } from '../../../core/task/types/create-task.type';
import { UpdateTaskInput } from '../../../core/task/types/update-task.type';

export class TaskHttpAdapter implements ITaskRepository {
  constructor(private readonly baseUrl: string) {}

  private get headers(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  async getAll(): Promise<ITask[]> {
    const response = await fetch(`${this.baseUrl}/tasks`, {
      method: 'GET',
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudieron obtener las tareas.`);
    }

    return response.json();
  }

  async getById(id: string): Promise<ITask | null> {
    const response = await fetch(`${this.baseUrl}/tasks/${id}`, {
      method: 'GET',
      headers: this.headers,
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudo obtener la tarea ${id}.`);
    }

    return response.json();
  }

  async create(input: CreateTaskInput): Promise<ITask> {
    const response = await fetch(`${this.baseUrl}/tasks`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: Error al crear la tarea.`);
    }

    return response.json();
  }

  async update(id: string, input: UpdateTaskInput): Promise<ITask> {
    const response = await fetch(`${this.baseUrl}/tasks/${id}`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: Error al actualizar la tarea ${id}.`);
    }

    return response.json();
  }

  async delete(id: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/tasks/${id}`, {
      method: 'DELETE',
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: Error al eliminar la tarea ${id}.`);
    }

    return true;
  }
}
