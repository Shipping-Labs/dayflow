import React, { createContext, ReactNode, useContext, useEffect, useMemo, useReducer, useRef } from 'react';

import { createId } from '../lib/id';
import { AppData, loadData, saveData } from '../lib/storage';
import { NewProject, NewTask, Project, Task } from '../types/task';

type TaskChanges = Partial<Pick<Task, 'title' | 'projectId' | 'due' | 'priority'>>;
type ProjectChanges = Partial<Pick<Project, 'name' | 'color'>> & { customColor?: string | null };

type Action =
  | { type: 'hydrate'; data: AppData }
  | { type: 'addTasks'; tasks: Task[] }
  | { type: 'updateTask'; id: string; changes: TaskChanges }
  | { type: 'toggleTask'; id: string }
  | { type: 'removeTask'; id: string }
  | { type: 'removeTasks'; ids: string[] }
  | { type: 'clearCompleted' }
  | { type: 'addProject'; project: Project }
  | { type: 'updateProject'; id: string; changes: ProjectChanges }
  | { type: 'removeProject'; id: string }
  | { type: 'replaceAll'; data: AppData };

interface State extends AppData {
  ready: boolean;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate':
      return { ...action.data, ready: true };
    case 'replaceAll':
      return { ...state, ...action.data };
    case 'addTasks':
      return { ...state, tasks: [...action.tasks, ...state.tasks] };
    case 'updateTask':
      return { ...state, tasks: state.tasks.map(t => (t.id === action.id ? { ...t, ...action.changes } : t)) };
    case 'toggleTask':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.id ? { ...t, done: !t.done, completedAt: t.done ? null : Date.now() } : t,
        ),
      };
    case 'removeTask':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.id) };
    case 'removeTasks': {
      const drop = new Set(action.ids);
      return { ...state, tasks: state.tasks.filter(t => !drop.has(t.id)) };
    }
    case 'clearCompleted':
      return { ...state, tasks: state.tasks.filter(t => !t.done) };
    case 'addProject':
      return { ...state, projects: [...state.projects, action.project] };
    case 'updateProject':
      return {
        ...state,
        projects: state.projects.map(p => {
          if (p.id !== action.id) return p;
          const { customColor, ...rest } = action.changes;
          const next: Project = { ...p, ...rest };
          if (customColor === null || customColor === '') delete next.customColor;
          else if (customColor !== undefined) next.customColor = customColor;
          return next;
        }),
      };
    case 'removeProject':
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.id),
        tasks: state.tasks.map(t => (t.projectId === action.id ? { ...t, projectId: null } : t)),
      };
  }
}

function buildTask(input: NewTask): Task {
  return { ...input, id: createId(), title: input.title.trim(), done: false, createdAt: Date.now(), completedAt: null };
}

interface StoreValue extends State {
  projectsById: Map<string, Project>;
  addTask: (input: NewTask) => void;
  addTasks: (inputs: NewTask[]) => void;
  updateTask: (id: string, changes: TaskChanges) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  removeTasks: (ids: string[]) => void;
  clearCompleted: () => void;
  /** Returns the new project so callers can select it right away. */
  addProject: (input: NewProject & { customColor?: string }) => Project;
  updateProject: (id: string, changes: ProjectChanges) => void;
  removeProject: (id: string) => void;
  replaceAll: (data: AppData) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { tasks: [], projects: [], ready: false });
  const hydrated = useRef(false);

  useEffect(() => {
    loadData().then(data => dispatch({ type: 'hydrate', data }));
  }, []);

  useEffect(() => {
    if (!state.ready) return;
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    saveData({ tasks: state.tasks, projects: state.projects });
  }, [state.tasks, state.projects, state.ready]);

  const actions = useMemo(
    () => ({
      addTask: (input: NewTask) => dispatch({ type: 'addTasks', tasks: [buildTask(input)] }),
      addTasks: (inputs: NewTask[]) => dispatch({ type: 'addTasks', tasks: inputs.map(buildTask) }),
      updateTask: (id: string, changes: TaskChanges) => dispatch({ type: 'updateTask', id, changes }),
      toggleTask: (id: string) => dispatch({ type: 'toggleTask', id }),
      removeTask: (id: string) => dispatch({ type: 'removeTask', id }),
      removeTasks: (ids: string[]) => dispatch({ type: 'removeTasks', ids }),
      clearCompleted: () => dispatch({ type: 'clearCompleted' }),
      addProject: (input: NewProject & { customColor?: string }) => {
        const project: Project = {
          id: createId(),
          name: input.name.trim(),
          color: input.color,
          ...(input.customColor ? { customColor: input.customColor } : {}),
          createdAt: Date.now(),
        };
        dispatch({ type: 'addProject', project });
        return project;
      },
      updateProject: (id: string, changes: ProjectChanges) =>
        dispatch({
          type: 'updateProject',
          id,
          changes: changes.name ? { ...changes, name: changes.name.trim() } : changes,
        }),
      removeProject: (id: string) => dispatch({ type: 'removeProject', id }),
      replaceAll: (data: AppData) => dispatch({ type: 'replaceAll', data }),
    }),
    [],
  );

  const projectsById = useMemo(() => new Map(state.projects.map(p => [p.id, p])), [state.projects]);

  const value = useMemo(() => ({ ...state, projectsById, ...actions }), [state, projectsById, actions]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used inside StoreProvider');
  return context;
}
