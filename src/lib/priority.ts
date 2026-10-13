import { ThemeColors } from '../theme/themes';
import { Priority } from '../types/task';

export interface PriorityVisual {
  accent: string;
  soft: string;
  label: string;
}

export function priorityVisual(priority: Priority, colors: ThemeColors, done: boolean): PriorityVisual | null {
  if (done || priority === 'low') return null;
  if (priority === 'high') {
    return { accent: colors.danger, soft: colors.dangerSoft, label: 'High' };
  }
  return { accent: colors.warning, soft: colors.warningSoft, label: 'Medium' };
}
