import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, LayoutAnimation, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BulkActionBar } from '../components/BulkActionBar';
import { AppHeader } from '../components/AppHeader';
import { EmptyState } from '../components/EmptyState';
import { Fab } from '../components/Fab';
import { FilterBar } from '../components/FilterBar';
import { ProgressCard } from '../components/ProgressCard';
import { QuickActions } from '../components/QuickActions';
import { SearchBar } from '../components/SearchBar';
import { TaskItem } from '../components/TaskItem';
import { AppText } from '../components/ui/AppText';
import { Icon, IconName } from '../components/ui/Icon';
import { IconButton } from '../components/ui/IconButton';
import { filterProjectId, projectFilter } from '../constants/projects';
import { BackupSheet } from '../features/sheets/BackupSheet';
import { ProjectSheet } from '../features/sheets/ProjectSheet';
import { QuickCaptureSheet } from '../features/sheets/QuickCaptureSheet';
import { TaskSheet } from '../features/sheets/TaskSheet';
import { formatLongToday } from '../lib/date';
import { haptics } from '../lib/haptics';
import { openCountFor, selectVisibleTasks, todayStats } from '../lib/tasks';
import { useStore } from '../state/StoreProvider';
import { useTheme } from '../theme/ThemeProvider';
import { spacing } from '../theme/tokens';
import { Filter, Project, SmartFilter, Task } from '../types/task';

type Sheet =
  | { kind: 'task'; task?: Task }
  | { kind: 'capture' }
  | { kind: 'backup'; exportOnOpen?: boolean }
  | { kind: 'project'; project?: Project }
  | null;

const SMART_COPY: Record<SmartFilter, { heading: string; subtitle: string; section: string }> = {
  Today: { heading: 'Today', subtitle: '', section: 'Your priorities' },
  Upcoming: { heading: 'Coming up', subtitle: 'A little preparation goes a long way', section: 'On the horizon' },
  Completed: { heading: 'Completed', subtitle: 'Look at what you’ve already done', section: 'Done and dusted' },
  Inbox: { heading: 'Inbox', subtitle: 'Keep your attention on what matters', section: 'Inbox tasks' },
};

const EMPTY: Record<string, { icon: IconName; title: string; message: string }> = {
  Today: { icon: 'sun', title: 'A little breathing room.', message: 'Nothing planned for today. Capture a task and keep moving at your own pace.' },
  Upcoming: { icon: 'calendar', title: 'Clear horizon.', message: 'Nothing scheduled ahead. Add a due date to plan for later.' },
  Completed: { icon: 'check-circle', title: 'Nothing finished yet.', message: 'Tick off a task and it will land here.' },
  default: { icon: 'feather', title: 'Fresh start.', message: 'No tasks here yet. Add one when you are ready.' },
};

const animate = () => LayoutAnimation.configureNext(LayoutAnimation.create(220, 'easeInEaseOut', 'opacity'));

export function HomeScreen() {
  const { colors } = useTheme().theme;
  const { tasks, projects, projectsById, toggleTask, removeTask, removeTasks, clearCompleted } = useStore();

  const [filter, setFilter] = useState<Filter>('Today');
  const [query, setQuery] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [lastProjectId, setLastProjectId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const activeProject = useMemo(() => {
    const id = filterProjectId(filter);
    return id ? projectsById.get(id) : undefined;
  }, [filter, projectsById]);

  // A deleted project can't stay selected.
  useEffect(() => {
    if (filterProjectId(filter) && !activeProject) setFilter('Inbox');
  }, [filter, activeProject]);

  useEffect(() => {
    if (lastProjectId && !projectsById.has(lastProjectId)) setLastProjectId(null);
  }, [lastProjectId, projectsById]);

  const visible = useMemo(
    () => selectVisibleTasks(tasks, projectsById, { filter, query, showCompleted }),
    [tasks, projectsById, filter, query, showCompleted],
  );
  const stats = useMemo(() => todayStats(tasks), [tasks]);
  const countFor = useCallback((id: string) => openCountFor(tasks, id), [tasks]);
  const hasCompleted = useMemo(() => tasks.some(t => t.done), [tasks]);

  const defaultProjectId = activeProject ? activeProject.id : filter === 'Inbox' ? null : lastProjectId;

  const copy = activeProject
    ? { heading: activeProject.name, subtitle: 'Keep your attention on what matters', section: `${activeProject.name} tasks` }
    : SMART_COPY[filter as SmartFilter];
  const subtitle = filter === 'Today' ? formatLongToday() : copy.subtitle;

  const close = () => setSheet(null);

  const exitSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  useEffect(() => {
    exitSelection();
  }, [filter, query, exitSelection]);

  const enterSelection = useCallback((task?: Task) => {
    haptics.light();
    setSelectionMode(true);
    setSelectedIds(task ? new Set([task.id]) : new Set());
  }, []);

  const toggleSelected = useCallback((task: Task) => {
    haptics.selection();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(task.id)) next.delete(task.id);
      else next.add(task.id);
      return next;
    });
  }, []);

  const selectAllVisible = useCallback(() => {
    haptics.selection();
    setSelectedIds(new Set(visible.map(t => t.id)));
  }, [visible]);

  const changeFilter = (next: Filter) => {
    haptics.selection();
    setFilter(next);
  };

  const onToggle = useCallback((id: string) => {
    haptics.selection();
    animate();
    toggleTask(id);
  }, [toggleTask]);

  const onEdit = useCallback((task: Task) => setSheet({ kind: 'task', task }), []);

  const onDelete = useCallback((task: Task) => {
    Alert.alert('Delete task?', `“${task.title}” will be removed. This can’t be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          haptics.warning();
          setSheet(current => (current?.kind === 'task' && current.task?.id === task.id ? null : current));
          animate();
          removeTask(task.id);
        },
      },
    ]);
  }, [removeTask]);

  const onClearCompleted = () => {
    Alert.alert('Clear completed tasks?', 'Completed tasks will be removed from this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => { animate(); clearCompleted(); } },
    ]);
  };

  const onBulkDelete = () => {
    const count = selectedIds.size;
    if (!count) return;
    Alert.alert(
      `Delete ${count} ${count === 1 ? 'task' : 'tasks'}?`,
      'This can’t be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            haptics.warning();
            animate();
            removeTasks([...selectedIds]);
            exitSelection();
          },
        },
      ],
    );
  };

  const empty = query.trim()
    ? { icon: 'search' as IconName, title: 'No matches.', message: `Nothing matches “${query.trim()}”. Try another word.` }
    : EMPTY[filter] ?? EMPTY.default;

  const header = (
    <View style={styles.header}>
      <View style={styles.greeting}>
        <AppText variant="overline" tone="accent">Your space, your pace</AppText>
        <AppText variant="display" numberOfLines={2}>{copy.heading}</AppText>
        <AppText variant="callout" tone="secondary">{subtitle}</AppText>
      </View>

      <ProgressCard {...stats} />
      <SearchBar value={query} onChange={setQuery} />
      <FilterBar
        value={filter}
        projects={projects}
        onChange={changeFilter}
        countFor={countFor}
        onCreateProject={() => setSheet({ kind: 'project' })}
        onEditProject={project => { haptics.light(); setSheet({ kind: 'project', project }); }}
      />

      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitle}>
          <View style={styles.sectionCopy}>
            <AppText variant="headline" numberOfLines={1}>{copy.section}</AppText>
            <AppText variant="caption" tone="tertiary">
              {visible.length} {visible.length === 1 ? 'task' : 'tasks'}{filter === 'Today' ? ' on your list' : ''}
            </AppText>
          </View>
          {activeProject && (
            <IconButton
              icon="edit-2"
              size={32}
              variant="plain"
              color={colors.textSecondary}
              accessibilityLabel={`Edit project ${activeProject.name}`}
              onPress={() => setSheet({ kind: 'project', project: activeProject })}
            />
          )}
        </View>
        <View style={styles.sectionActions}>
          {visible.length > 0 && !selectionMode && (
            <Pressable
              onPress={() => enterSelection()}
              accessibilityRole="button"
              hitSlop={10}
              style={[styles.toggle, { backgroundColor: colors.surfaceMuted }]}
            >
              <Icon name="check-square" size={13} color={colors.textSecondary} />
              <AppText variant="caption" tone="secondary" style={styles.toggleText}>Select</AppText>
            </Pressable>
          )}
          {filter !== 'Completed' && !selectionMode && (
            <Pressable
              onPress={() => { haptics.selection(); animate(); setShowCompleted(v => !v); }}
              accessibilityRole="button"
              hitSlop={10}
              style={[styles.toggle, { backgroundColor: colors.surfaceMuted }]}
            >
              <Icon name={showCompleted ? 'eye-off' : 'eye'} size={13} color={colors.textSecondary} />
              <AppText variant="caption" tone="secondary" style={styles.toggleText}>
                {showCompleted ? 'Hide done' : 'Show done'}
              </AppText>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );

  const footer = (
    <View style={styles.footer}>
      <QuickActions onCapture={() => setSheet({ kind: 'capture' })} onBackup={() => setSheet({ kind: 'backup' })} />
      <View style={styles.links}>
        <Pressable onPress={() => setSheet({ kind: 'backup', exportOnOpen: true })} accessibilityRole="button" hitSlop={8} style={styles.link}>
          <Icon name="download" size={14} color={colors.textSecondary} />
          <AppText variant="label" tone="secondary">Export backup JSON</AppText>
        </Pressable>
        {filter === 'Completed' && hasCompleted && (
          <Pressable onPress={onClearCompleted} accessibilityRole="button" hitSlop={8} style={styles.link}>
            <Icon name="trash-2" size={14} color={colors.danger} />
            <AppText variant="label" tone="danger">Clear completed tasks</AppText>
          </Pressable>
        )}
      </View>
      <View style={styles.note}>
        <Icon name="lock" size={12} color={colors.textTertiary} />
        <AppText variant="caption" tone="tertiary">Your tasks stay on this device · No account required</AppText>
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safe, { backgroundColor: colors.background }]}>
      <AppHeader />
      <FlatList
        data={visible}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            project={item.projectId ? projectsById.get(item.projectId) : undefined}
            selectionMode={selectionMode}
            selected={selectedIds.has(item.id)}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            onSelect={toggleSelected}
            onLongPress={enterSelection}
          />
        )}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <EmptyState
            {...empty}
            actionLabel={query.trim() ? undefined : 'Add a task'}
            onAction={() => setSheet({ kind: 'task' })}
          />
        }
        ListFooterComponent={footer}
        contentContainerStyle={[styles.content, selectionMode && styles.contentSelecting]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      />

      {!selectionMode && <Fab onPress={() => setSheet({ kind: 'task' })} />}

      {selectionMode && (
        <BulkActionBar
          selectedCount={selectedIds.size}
          totalCount={visible.length}
          onCancel={exitSelection}
          onSelectAll={selectAllVisible}
          onClearSelection={() => setSelectedIds(new Set())}
          onDelete={onBulkDelete}
        />
      )}

      <TaskSheet
        visible={sheet?.kind === 'task'}
        task={sheet?.kind === 'task' ? sheet.task : undefined}
        defaultProjectId={defaultProjectId}
        onProjectUsed={setLastProjectId}
        onDelete={onDelete}
        onClose={close}
      />
      <QuickCaptureSheet
        visible={sheet?.kind === 'capture'}
        defaultProjectId={defaultProjectId}
        onProjectUsed={setLastProjectId}
        onClose={close}
      />
      <BackupSheet
        visible={sheet?.kind === 'backup'}
        exportOnOpen={sheet?.kind === 'backup' && !!sheet.exportOnOpen}
        onClose={close}
      />
      <ProjectSheet
        visible={sheet?.kind === 'project'}
        project={sheet?.kind === 'project' ? sheet.project : undefined}
        onSaved={project => setFilter(projectFilter(project.id))}
        onClose={close}
      />
    </SafeAreaView>
  );
}

function Separator() {
  return <View style={{ height: spacing.sm + 2 }} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: 120 },
  contentSelecting: { paddingBottom: 200 },
  sectionActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexShrink: 0 },
  header: { gap: spacing.lg, paddingBottom: spacing.lg },
  greeting: { gap: spacing.xs + 2, paddingTop: spacing.md, paddingBottom: spacing.xs },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.md, marginTop: spacing.sm },
  sectionTitle: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  sectionCopy: { flexShrink: 1, gap: spacing.xxs + 1 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 1, paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: 999 },
  toggleText: { fontWeight: '600' },
  footer: { gap: spacing.lg, paddingTop: spacing.xxl },
  links: { alignItems: 'center', gap: spacing.xs },
  link: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2, paddingVertical: spacing.sm },
  note: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs + 2 },
});
