import { useState, useEffect, useCallback, useMemo } from 'react';
import { ITask } from '../core/task/interfaces/task.interface';
import { TaskStatus } from '../core/task/enums/task-status.enum';
import { TaskFilterType } from '../core/task/interfaces/task-filter.interface';
import { CreateTaskInput } from '../core/task/types/create-task.type';
import { UpdateTaskInput } from '../core/task/types/update-task.type';
import { TaskAdapterFactory } from '../infra/api/factories/task-adapter.factory';
import { APP_MESSAGES } from '../constants/messages.constants';

export const useTasks = (userId?: string) => {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskFilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const repository = useMemo(
    () => (userId ? TaskAdapterFactory.getRepository(userId) : null),
    [userId]
  );

  const loadTasks = useCallback(async () => {
    if (!repository) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await repository.getAll();
      setTasks(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : APP_MESSAGES.TASKS.LOAD_ERROR;
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    setTasks([]);
    setFilter('ALL');
    setSearchQuery('');
    loadTasks();
  }, [loadTasks]);

  const createTask = useCallback(
    async (input: CreateTaskInput): Promise<boolean> => {
      if (!repository) return false;
      setIsActionLoading(true);
      setError(null);
      try {
        const created = await repository.create({
          ...input,
          userId: input.userId ?? userId,
        });
        setTasks((prev) => [created, ...prev]);
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : APP_MESSAGES.TASKS.CREATE_ERROR;
        setError(message);
        return false;
      } finally {
        setIsActionLoading(false);
      }
    },
    [repository, userId]
  );

  const updateTask = useCallback(
    async (id: string, input: UpdateTaskInput): Promise<boolean> => {
      if (!repository) return false;
      setIsActionLoading(true);
      setError(null);
      try {
        const updated = await repository.update(id, input);
        setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : APP_MESSAGES.TASKS.UPDATE_ERROR;
        setError(message);
        return false;
      } finally {
        setIsActionLoading(false);
      }
    },
    [repository]
  );

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

  const deleteTask = useCallback(
    async (id: string): Promise<boolean> => {
      if (!repository) return false;
      setIsActionLoading(true);
      setError(null);
      try {
        const success = await repository.delete(id);
        if (success) {
          setTasks((prev) => prev.filter((t) => t.id !== id));
        }
        return success;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : APP_MESSAGES.TASKS.DELETE_ERROR;
        setError(message);
        return false;
      } finally {
        setIsActionLoading(false);
      }
    },
    [repository]
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesStatus =
        filter === 'ALL' ? true : task.status === filter;

      const cleanQuery = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !cleanQuery ||
        task.title.toLowerCase().includes(cleanQuery) ||
        Boolean(task.description?.toLowerCase().includes(cleanQuery)) ||
        Boolean(task.location?.address?.toLowerCase().includes(cleanQuery));

      return matchesStatus && matchesSearch;
    });
  }, [tasks, filter, searchQuery]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
    const pending = total - completed;
    const progress = total > 0 ? completed / total : 0;
    const progressPercentage = Math.round(progress * 100);
    const photosCount = tasks.filter((t) => Boolean(t.photoUri)).length;
    const photosSizeKb = tasks.reduce((acc, t) => acc + (t.photoSizeKb ?? 0), 0);
    const locationsCount = tasks.filter((t) => Boolean(t.location)).length;

    return {
      total,
      completed,
      pending,
      progress,
      progressPercentage,
      photosCount,
      photosSizeKb,
      locationsCount,
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
  };
};
