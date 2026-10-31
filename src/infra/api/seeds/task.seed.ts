import { ITask } from '../../../core/task/interfaces/task.interface';
import { TaskPriority } from '../../../core/task/enums/task-priority.enum';
import { TaskStatus } from '../../../core/task/enums/task-status.enum';

export const TASK_SEEDS: ITask[] = [
  {
    id: 'task-1',
    title: 'Comprar café de grano y leche de avena',
    description: 'Pasar por el supermercado antes de las 19:00 hrs.',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.MEDIUM,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'task-2',
    title: 'Revisar PR del servicio de notificaciones',
    description: 'Validar cobertura de tests y manejo de errores en el módulo.',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.HIGH,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'task-3',
    title: 'Agendar hora al dentista',
    description: 'Llamar a la clínica para pedir control semestral en la mañana.',
    status: TaskStatus.PENDING,
    priority: TaskPriority.HIGH,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'task-4',
    title: 'Ordenar escritorio y cables',
    description: 'Organizar el setup y limpiar el monitor principal.',
    status: TaskStatus.PENDING,
    priority: TaskPriority.LOW,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];
