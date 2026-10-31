import { useState, useEffect, useCallback, useMemo } from 'react';
import { ITask } from '../core/task/interfaces/task.interface';
import { TaskStatus } from '../core/task/enums/task-status.enum';
import { TaskFilterType } from '../core/task/interfaces/task-filter.interface';
import { CreateTaskInput } from '../core/task/types/create-task.type';
import { UpdateTaskInput } from '../core/task/types/update-task.type';
import { TaskAdapterFactory } from '../infra/api/factories/task-adapter.factory';

/**
 * Custom Hook: useTasks
 * Implementa el patrón Presenter/Container para desacoplar la lógica de estado
 * y orquestación de la UI, exponiendo operaciones asíncronas y métricas calculadas.
 */
export const useTasks = () => {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskFilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const repository = useMemo(() => TaskAdapterFactory.getRepository(), []);

  // Carga inicial o recarga de tareas
  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await repository.getAll();
      setTasks(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado al cargar tareas.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Crear tarea
  const createTask = useCallback(
    async (input: CreateTaskInput): Promise<boolean> => {
      setIsActionLoading(true);
      setError(null);
      try {
        const created = await repository.create(input);
        setTasks((prev) => [created, ...prev]);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudo crear la tarea.';
        setError(message);
        return false;
      } finally {
        setIsActionLoading(false);
      }
    },
    [repository]
  );

  // Actualizar tarea (editar título, descripción, etc.)
  const updateTask = useCallback(
    async (id: string, input: UpdateTaskInput): Promise<boolean> => {
      setIsActionLoading(true);
      setError(null);
      try {
        const updated = await repository.update(id, input);
        setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudo actualizar la tarea.';
        setError(message);
        return false;
      } finally {
        setIsActionLoading(false);
      }
    },
    [repository]
  );

  // Alternar estado completado/pendiente
  const toggleStatus = useCallback(
    async (id: string): Promise<boolean> => {
      const target = tasks.find((t) => t.id === id);
      if (!target) return false;

      const nextStatus =
        target.status === TaskStatus.COMPLETED
          ? TaskStatus.PENDING
          : TaskStatus.COMPLETED;

      return updateTask(id, { status: nextStatus });
    },
    [tasks, updateTask]
  );

  // Eliminar tarea
  const deleteTask = useCallback(
    async (id: string): Promise<boolean> => {
      setIsActionLoading(true);
      setError(null);
      try {
        const success = await repository.delete(id);
        if (success) {
          setTasks((prev) => prev.filter((t) => t.id !== id));
        }
        return success;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudo eliminar la tarea.';
        setError(message);
        return false;
      } finally {
        setIsActionLoading(false);
      }
    },
    [repository]
  );

  // Restablecer datos iniciales al Seed (modo local)
  const resetToSeedData = useCallback(async (): Promise<boolean> => {
    if (!repository.resetToSeed) return false;
    setIsLoading(true);
    setError(null);
    try {
      const resetTasks = await repository.resetToSeed();
      setTasks(resetTasks);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al restablecer datos del seed.';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  // Lista filtrada y con búsqueda
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Filtro de estado
      const matchesStatus =
        filter === 'ALL' ? true : task.status === filter;

      // Filtro de búsqueda textual (título o descripción)
      const cleanQuery = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !cleanQuery ||
        task.title.toLowerCase().includes(cleanQuery) ||
        task.description.toLowerCase().includes(cleanQuery);

      return matchesStatus && matchesSearch;
    });
  }, [tasks, filter, searchQuery]);

  // Estadísticas calculadas (progreso de usuario)
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
    const pending = total - completed;
    const progress = total > 0 ? completed / total : 0;
    const progressPercentage = Math.round(progress * 100);

    return {
      total,
      completed,
      pending,
      progress,
      progressPercentage,
    };
  }, [tasks]);

  return {
    tasks: filteredTasks,
    allTasksCount: tasks.length,
    isLoading,
    isActionLoading,
    error,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    stats,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleStatus,
    resetToSeedData,
    resetToMockData: resetToSeedData,
  };
};
