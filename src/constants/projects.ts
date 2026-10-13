import { ComponentProps } from 'react';
import { Feather } from '@expo/vector-icons';

import { isValidHexColor, normalizeHexColor } from '../lib/color';
import { ColorScheme } from '../theme/themes';
import { Filter, Priority, Project, ProjectColor, SmartFilter } from '../types/task';

type IconName = ComponentProps<typeof Feather>['name'];

export const PROJECT_COLORS: Record<ProjectColor, Record<ColorScheme, string>> = {
  violet: { light: '#6E5BF0', dark: '#9C8CFF' },
  orange: { light: '#F07C1E', dark: '#FF9F4D' },
  green: { light: '#1E9E63', dark: '#3DD68C' },
  blue: { light: '#2F7BF2', dark: '#6AA4FF' },
  pink: { light: '#E0458B', dark: '#FF7AB6' },
  teal: { light: '#0E9AA7', dark: '#3CCFD9' },
  yellow: { light: '#D99A00', dark: '#F5C542' },
  red: { light: '#E2433F', dark: '#FF6B66' },
  slate: { light: '#5E6B7D', dark: '#9AA6B8' },
};

export const COLOR_ORDER = Object.keys(PROJECT_COLORS) as ProjectColor[];

export const INBOX_COLOR: Record<ColorScheme, string> = { light: '#8A8992', dark: '#8E8D95' };

export const MAX_PROJECT_NAME = 40;

/** Extra hex swatches in the project custom color picker. */
export const CUSTOM_COLOR_SWATCHES = [
  '#FF5B2E',
  '#6E5BF0',
  '#1E9E63',
  '#2F7BF2',
  '#E0458B',
  '#0E9AA7',
  '#D99A00',
  '#141416',
];

export function projectColor(project: Project | undefined, scheme: ColorScheme): string {
  if (!project) return INBOX_COLOR[scheme];
  const custom = project.customColor && isValidHexColor(project.customColor)
    ? normalizeHexColor(project.customColor)
    : null;
  if (custom) return custom;
  return PROJECT_COLORS[project.color][scheme];
}

export const SMART_FILTERS_BEFORE: SmartFilter[] = ['Today', 'Upcoming', 'Inbox'];
export const SMART_FILTERS_AFTER: SmartFilter[] = ['Completed'];

export const SMART_FILTER_ICONS: Record<SmartFilter, IconName> = {
  Today: 'sun',
  Upcoming: 'calendar',
  Inbox: 'inbox',
  Completed: 'check-circle',
};

export const projectFilter = (id: string): Filter => `project:${id}`;

export function filterProjectId(filter: Filter): string | null {
  return filter.startsWith('project:') ? filter.slice('project:'.length) : null;
}

export const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

export const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export const PRIORITY_LABEL: Record<Priority, string> = { low: 'Low', medium: 'Medium', high: 'High' };
