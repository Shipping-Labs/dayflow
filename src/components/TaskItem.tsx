import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { projectColor } from '../constants/projects';
import { formatDue, isOverdue } from '../lib/date';
import { priorityVisual } from '../lib/priority';
import { useTheme } from '../theme/ThemeProvider';
import { radius, spacing } from '../theme/tokens';
import { Project, Task } from '../types/task';
import { PriorityBadge } from './PriorityBadge';
import { AppText } from './ui/AppText';
import { Icon } from './ui/Icon';

interface TaskItemProps {
  task: Task;
  project?: Project;
  selectionMode?: boolean;
  selected?: boolean;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onSelect?: (task: Task) => void;
  onLongPress?: (task: Task) => void;
}

export const TaskItem = memo(function TaskItem({
  task,
  project,
  selectionMode,
  selected,
  onToggle,
  onEdit,
  onDelete,
  onSelect,
  onLongPress,
}: TaskItemProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const overdue = !task.done && isOverdue(task.due);
  const priority = priorityVisual(task.priority, colors, task.done);

  const onPress = () => {
    if (selectionMode) onSelect?.(task);
    else onEdit(task);
  };

  const showPriorityAccent = priority && !task.done && !selectionMode;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={() => onLongPress?.(task)}
      delayLongPress={280}
      accessibilityRole={selectionMode ? 'checkbox' : 'button'}
      accessibilityState={selectionMode ? { checked: !!selected } : undefined}
      accessibilityLabel={selectionMode ? `Select ${task.title}` : `Edit ${task.title}`}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: pressed ? colors.surfaceMuted : selected ? colors.accentSoft : colors.surface,
          borderColor: selected ? colors.accent : colors.border,
          borderLeftColor: showPriorityAccent ? priority.accent : selected ? colors.accent : colors.border,
          borderLeftWidth: showPriorityAccent ? 4 : 1,
        },
      ]}
    >
      {selectionMode ? (
        <View
          style={[
            styles.select,
            selected
              ? { backgroundColor: colors.accent, borderColor: colors.accent }
              : { borderColor: colors.borderStrong },
          ]}
        >
          {selected && <Icon name="check" size={14} color={colors.onAccent} />}
        </View>
      ) : (
        <Pressable
          onPress={() => onToggle(task.id)}
          hitSlop={12}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: task.done }}
          accessibilityLabel={task.done ? `Mark ${task.title} as not done` : `Complete ${task.title}`}
          style={[
            styles.check,
            task.done
              ? { backgroundColor: colors.success, borderColor: colors.success }
              : {
                borderColor:
                  task.priority === 'high' ? colors.danger
                    : task.priority === 'medium' ? colors.warning
                      : colors.borderStrong,
                borderWidth: task.priority === 'high' ? 2.5 : 2,
              },
          ]}
        >
          {task.done && <Icon name="check" size={14} color="#FFFFFF" />}
        </Pressable>
      )}

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <AppText
            variant="bodyStrong"
            tone={task.done ? 'tertiary' : 'primary'}
            style={[styles.title, task.done && styles.doneTitle]}
            numberOfLines={3}
          >
            {task.title}
          </AppText>
          {!selectionMode && <PriorityBadge priority={task.priority} done={task.done} />}
        </View>

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <View style={[styles.dot, { backgroundColor: projectColor(project, theme.scheme) }]} />
            <AppText variant="caption" tone="secondary">{project?.name ?? 'Inbox'}</AppText>
          </View>

          <View style={styles.metaItem}>
            <Icon name={overdue ? 'alert-circle' : 'calendar'} size={12} color={overdue ? colors.danger : colors.textTertiary} />
            <AppText variant="caption" tone={overdue ? 'danger' : 'secondary'}>
              {overdue ? `Overdue · ${formatDue(task.due)}` : formatDue(task.due)}
            </AppText>
          </View>
        </View>
      </View>

      {!selectionMode && (
        <Pressable
          onPress={() => onDelete(task)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${task.title}`}
          style={({ pressed }) => [styles.delete, pressed && { backgroundColor: colors.dangerSoft }]}
        >
          {({ pressed }) => <Icon name="trash-2" size={16} color={pressed ? colors.danger : colors.textTertiary} />}
        </Pressable>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg + 2,
    borderWidth: 1,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -1,
  },
  select: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -1,
  },
  body: { flex: 1, gap: spacing.sm },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  title: { flex: 1 },
  doneTitle: { textDecorationLine: 'line-through' },
  meta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: spacing.md, rowGap: spacing.xs },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 1 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  delete: { width: 30, height: 30, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', marginTop: -4, marginRight: -6 },
});
