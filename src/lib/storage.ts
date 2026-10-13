import AsyncStorage from '@react-native-async-storage/async-storage';

import { COLOR_ORDER, MAX_PROJECT_NAME } from '../constants/projects';
import { Priority, Project, ProjectColor, Task } from '../types/task';
import { normalizeHexColor } from './color';
import { createId } from './id';

const STATE_KEY = 'dayflow-v2-state';
const THEME_KEY = 'dayflow-theme';

/** Sample tasks that older versions of the app seeded on first launch. */
const LEGACY_SEED_IDS = new Set(['seed1', 'seed2', 'seed3']);

/** Colors for projects that were built into older versions, so migrated data keeps its look. */
const LEGACY_PROJECT_COLORS: Record<string, ProjectColor> = {
  personal: 'violet',
  'shipping labs': 'orange',
  health: 'green',
  learning: 'blue',
};

export type ThemePreference = 'system' | 'light' | 'dark';

export interface AppData {
  tasks: Task[];
  projects: Project[];
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

function sanitizeProjects(input: unknown): Project[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  return input.flatMap((raw): Project[] => {
    if (!raw || typeof raw !== 'object') return [];
    const item = raw as Record<string, unknown>;
    const name = typeof item.name === 'string' ? item.name.trim().slice(0, MAX_PROJECT_NAME) : '';
    if (!name || name.toLowerCase() === 'inbox' || seen.has(name.toLowerCase())) return [];
    seen.add(name.toLowerCase());
    const customRaw = typeof item.customColor === 'string' ? item.customColor : undefined;
    const customColor = customRaw ? normalizeHexColor(customRaw) ?? undefined : undefined;
    return [{
      id: typeof item.id === 'string' && item.id ? item.id : createId(),
      name,
      color: COLOR_ORDER.includes(item.color as ProjectColor) ? (item.color as ProjectColor) : 'slate',
      ...(customColor ? { customColor } : {}),
      createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
    }];
  });
}

/**
 * Normalizes stored or imported data. Accepts the current shape (`projectId` + `projects`)
 * and older shapes where each task carried a project name.
 */
export function normalizeData(rawTasks: unknown, rawProjects?: unknown): AppData {
  const projects = sanitizeProjects(rawProjects);
  const byId = new Map(projects.map(p => [p.id, p]));
  const byName = new Map(projects.map(p => [p.name.toLowerCase(), p]));

  const projectIdForName = (rawName: unknown): string | null => {
    const name = typeof rawName === 'string' ? rawName.trim().slice(0, MAX_PROJECT_NAME) : '';
    if (!name || name.toLowerCase() === 'inbox') return null;
    const existing = byName.get(name.toLowerCase());
    if (existing) return existing.id;
    const project: Project = {
      id: createId(),
      name,
      color: LEGACY_PROJECT_COLORS[name.toLowerCase()] ?? COLOR_ORDER[projects.length % COLOR_ORDER.length],
      createdAt: Date.now(),
    };
    projects.push(project);
    byId.set(project.id, project);
    byName.set(name.toLowerCase(), project);
    return project.id;
  };

  const tasks = (Array.isArray(rawTasks) ? rawTasks : []).flatMap((raw): Task[] => {
    if (!raw || typeof raw !== 'object') return [];
    const item = raw as Record<string, unknown>;
    const title = typeof item.title === 'string' ? item.title.trim() : '';
    if (!title) return [];

    let projectId: string | null;
    if (typeof item.projectId === 'string' && byId.has(item.projectId)) projectId = item.projectId;
    else if ('projectId' in item) projectId = null;
    else projectId = projectIdForName(item.project);

    return [{
      id: typeof item.id === 'string' && item.id ? item.id : createId(),
      title,
      projectId,
      due: typeof item.due === 'string' ? item.due : '',
      done: item.done === true,
      priority: PRIORITIES.includes(item.priority as Priority) ? (item.priority as Priority) : 'medium',
      createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
      completedAt: typeof item.completedAt === 'number' ? item.completedAt : null,
    }];
  });

  return { tasks, projects };
}

export async function loadData(): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(STATE_KEY);
    if (!raw) return { tasks: [], projects: [] };
    const parsed = JSON.parse(raw);
    const rawTasks = Array.isArray(parsed?.tasks)
      ? parsed.tasks.filter((t: { id?: unknown }) => !LEGACY_SEED_IDS.has(String(t?.id)))
      : [];
    return normalizeData(rawTasks, parsed?.projects);
  } catch {
    return { tasks: [], projects: [] };
  }
}

export async function saveData(data: AppData): Promise<void> {
  try {
    await AsyncStorage.setItem(STATE_KEY, JSON.stringify({ version: 3, ...data }));
  } catch {
    // Persistence is best-effort; the in-memory state stays authoritative.
  }
}

export async function loadThemePreference(): Promise<ThemePreference> {
  try {
    const stored = await AsyncStorage.getItem(THEME_KEY);
    if (stored === 'system' || stored === 'light' || stored === 'dark') return stored;

    const legacy = await AsyncStorage.getItem(STATE_KEY);
    const dark = legacy ? JSON.parse(legacy)?.dark : undefined;
    if (typeof dark === 'boolean') return dark ? 'dark' : 'light';
  } catch {
    // Fall through to the system default.
  }
  return 'system';
}

export async function saveThemePreference(preference: ThemePreference): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_KEY, preference);
  } catch {
    // Best-effort.
  }
}
