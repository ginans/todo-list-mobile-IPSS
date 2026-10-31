import { ITask } from '../../../core/task/interfaces/task.interface';
import { TaskPriority } from '../../../core/task/enums/task-priority.enum';
import { TaskStatus } from '../../../core/task/enums/task-status.enum';

/**
 * Semillas de Datos Iniciales (Seed Data)
 * Se utilizan para poblar el almacenamiento local en el primer arranque (Cold Start),
 * o al solicitar un reseteo a los datos de fábrica de la evaluación.
 */
export const TASK_SEEDS: ITask[] = [
  {
    id: 'task-1',
    title: 'Configurar entorno de desarrollo',
    description: 'Instalar Node.js, CLI de Expo y dependencias de React Native.',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.HIGH,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'task-2',
    title: 'Diseñar arquitectura y componentes',
    description: 'Implementar patrón Adapter con feature flag y envoltorios de React Native Paper.',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.HIGH,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'task-3',
    title: 'Implementar CRUD de tareas en UI',
    description: 'Permitir agregar, editar, completar y eliminar tareas con confirmación visual.',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'task-4',
    title: 'Documentar informe y patrones de diseño',
    description: 'Completar README con los 5 indicadores de la rúbrica y análisis de sobreingeniería.',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

