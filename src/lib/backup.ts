import { Project, Task } from '../types/task';
import { AppData, normalizeData, ThemePreference } from './storage';

export interface ParsedBackup extends AppData {
  theme?: ThemePreference;
}

export function createBackup(tasks: Task[], projects: Project[], theme: ThemePreference): string {
  return JSON.stringify(
    { app: 'dayflow', version: 3, exportedAt: new Date().toISOString(), theme, projects, tasks },
    null,
    2,
  );
}

/** Accepts current backups as well as older ones where tasks stored a project name. */
export function parseBackup(text: string): ParsedBackup {
  const parsed = JSON.parse(text);
  if (!parsed || !Array.isArray(parsed.tasks)) throw new Error('Backup has no tasks array');

  let theme: ThemePreference | undefined;
  if (parsed.theme === 'system' || parsed.theme === 'light' || parsed.theme === 'dark') theme = parsed.theme;
  else if (typeof parsed.dark === 'boolean') theme = parsed.dark ? 'dark' : 'light';

  return { ...normalizeData(parsed.tasks, parsed.projects), theme };
}
