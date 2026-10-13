const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function addDaysKey(days: number, from = new Date()): string {
  const date = new Date(from);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

export function isValidDateKey(value: string): boolean {
  if (!DATE_KEY.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime()) && toDateKey(date) === value;
}

export function isOverdue(due: string): boolean {
  return !!due && due < todayKey();
}

export function dateKeyToDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

/** Long label for calendar header (e.g. “Tuesday, 13 October 2026”). */
export function formatDueLong(due: string): string {
  if (!due || !isValidDateKey(due)) return 'No due date';
  const date = dateKeyToDate(due);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

export function formatDue(due: string): string {
  if (!due) return 'No date';
  if (due === todayKey()) return 'Today';
  if (due === addDaysKey(1)) return 'Tomorrow';
  if (due === addDaysKey(-1)) return 'Yesterday';
  const date = new Date(`${due}T12:00:00`);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

export function formatLongToday(): string {
  return new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

/** Next Saturday on or after `from` (Saturday counts as “this weekend”). */
export function thisWeekendKey(from = new Date()): string {
  const day = from.getDay();
  const daysUntil = day === 6 ? 0 : ((6 - day + 7) % 7) || 7;
  return addDaysKey(daysUntil, from);
}

export interface DueShortcut {
  id: string;
  label: string;
  value: string;
}

export function dueShortcutOptions(from = new Date()): DueShortcut[] {
  return [
    { id: 'today', label: 'Today', value: todayKey() },
    { id: 'tomorrow', label: 'Tomorrow', value: addDaysKey(1, from) },
    { id: 'weekend', label: 'This weekend', value: thisWeekendKey(from) },
    { id: 'next-week', label: 'Next week', value: addDaysKey(7, from) },
    { id: 'none', label: 'No date', value: '' },
  ];
}

export function dueShortcutLabel(value: string, from = new Date()): string | undefined {
  return dueShortcutOptions(from).find(s => s.value === value)?.label;
}

/** Trim and keep only date-shaped characters while typing. */
export function sanitizeDueDraft(raw: string): string {
  return raw.replace(/[^\d-]/g, '').slice(0, 10);
}

/** Normalize on blur/submit: empty stays empty; partial input becomes invalid (caller validates). */
export function normalizeDueInput(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 8) {
    const candidate = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
    return isValidDateKey(candidate) ? candidate : trimmed;
  }
  return sanitizeDueDraft(trimmed);
}

export function dueValidationMessage(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (!isValidDateKey(trimmed)) {
    return 'Pick a valid date from the calendar or a shortcut above.';
  }
  return undefined;
}
