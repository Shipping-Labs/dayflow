export type Priority = 'low' | 'medium' | 'high';

export type ProjectColor = 'violet' | 'orange' | 'green' | 'blue' | 'pink' | 'teal' | 'yellow' | 'red' | 'slate';

export interface Project {
  id: string;
  name: string;
  color: ProjectColor;
  /** When set, overrides the preset swatch (e.g. `#FF5B2E`). */
  customColor?: string;
  createdAt: number;
}

export interface Task {
  id: string;
  title: string;
  /** `null` means the task lives in the Inbox. */
  projectId: string | null;
  /** Local date in `YYYY-MM-DD` form, or an empty string for no date. */
  due: string;
  done: boolean;
  priority: Priority;
  createdAt: number;
  completedAt?: number | null;
}

export type NewTask = Pick<Task, 'title' | 'projectId' | 'due' | 'priority'>;

export type NewProject = Pick<Project, 'name' | 'color'>;

export type SmartFilter = 'Today' | 'Upcoming' | 'Inbox' | 'Completed';

export type Filter = SmartFilter | `project:${string}`;
