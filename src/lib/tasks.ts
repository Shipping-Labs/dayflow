import { filterProjectId, PRIORITY_RANK } from '../constants/projects';
import { Filter, Project, Task } from '../types/task';
import { todayKey } from './date';

const LIST_PREFIX = /^(\s*[-*•]\s*|\s*\d+[.)]\s*|\s*\[[ xX]?\]\s*)/;

export function parseTaskLines(text: string): string[] {
  return text
    .split('\n')
    .map(line => line.replace(LIST_PREFIX, '').trim())
    .filter(Boolean);
}

function matchesFilter(task: Task, filter: Filter, today: string): boolean {
  switch (filter) {
    case 'Today':
      return task.due === today || (!!task.due && task.due < today && !task.done);
    case 'Upcoming':
      return !!task.due && task.due > today && !task.done;
    case 'Completed':
      return task.done;
    case 'Inbox':
      return task.projectId === null;
    default:
      return task.projectId === filterProjectId(filter);
  }
}

export function compareTasks(a: Task, b: Task): number {
  return (
    Number(a.done) - Number(b.done) ||
    PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
    (a.due || '9999').localeCompare(b.due || '9999')
  );
}

export function selectVisibleTasks(
  tasks: Task[],
  projectsById: Map<string, Project>,
  { filter, query, showCompleted }: { filter: Filter; query: string; showCompleted: boolean },
): Task[] {
  const today = todayKey();
  const q = query.trim().toLowerCase();
  const projectName = (task: Task) =>
    (task.projectId ? projectsById.get(task.projectId)?.name : 'Inbox')?.toLowerCase() ?? '';

  return tasks
    .filter(task => matchesFilter(task, filter, today))
    .filter(task => filter === 'Completed' || showCompleted || !task.done)
    .filter(task => !q || task.title.toLowerCase().includes(q) || projectName(task).includes(q))
    .sort(compareTasks);
}

export function todayStats(tasks: Task[]) {
  const today = todayKey();
  const dueToday = tasks.filter(t => t.due === today);
  const done = dueToday.filter(t => t.done).length;
  const overdue = tasks.filter(t => !t.done && !!t.due && t.due < today).length;
  const total = dueToday.length;
  return {
    done,
    total,
    remaining: total - done,
    overdue,
    progress: total ? done / total : 0,
  };
}

export function openCountFor(tasks: Task[], projectId: string | null): number {
  return tasks.filter(t => t.projectId === projectId && !t.done).length;
}
