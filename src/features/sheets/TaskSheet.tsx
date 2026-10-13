import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { BottomSheet } from '../../components/ui/BottomSheet';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { dueValidationMessage, normalizeDueInput, todayKey } from '../../lib/date';
import { haptics } from '../../lib/haptics';
import { useStore } from '../../state/StoreProvider';
import { spacing } from '../../theme/tokens';
import { Priority, Task } from '../../types/task';
import { DueDateField } from './DueDateField';
import { PriorityPicker, ProjectPicker } from './pickers';

interface TaskSheetProps {
  visible: boolean;
  onClose: () => void;
  task?: Task;
  defaultProjectId: string | null;
  onProjectUsed?: (projectId: string | null) => void;
  onDelete?: (task: Task) => void;
}

export function TaskSheet({ visible, onClose, task, defaultProjectId, onProjectUsed, onDelete }: TaskSheetProps) {
  const { addTask, updateTask } = useStore();
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState<string | null>(defaultProjectId);
  const [priority, setPriority] = useState<Priority>('medium');
  const [due, setDue] = useState(todayKey());
  const [dueError, setDueError] = useState<string>();
  const titleRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!visible) return;
    setDueError(undefined);
    if (task) {
      setTitle(task.title);
      setProjectId(task.projectId);
      setPriority(task.priority);
      setDue(task.due);
    } else {
      setTitle('');
      setProjectId(defaultProjectId);
      setPriority('medium');
      setDue(todayKey());
    }
  }, [visible, task, defaultProjectId]);

  const submit = () => {
    const clean = title.trim();
    if (!clean) return;
    const dueValue = normalizeDueInput(due);
    const dueMsg = dueValidationMessage(dueValue);
    if (dueMsg) {
      setDueError(dueMsg);
      setDue(dueValue);
      return;
    }
    if (task) updateTask(task.id, { title: clean, projectId, priority, due: dueValue });
    else addTask({ title: clean, projectId, priority, due: dueValue });
    onProjectUsed?.(projectId);
    haptics.success();
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={task ? 'Edit task' : 'Make it happen'}
      subtitle={task ? 'Change anything, then save.' : 'Capture it now, plan it in seconds.'}
      initialFocusRef={task ? undefined : titleRef}
      footer={
        <View style={styles.actions}>
          {task && onDelete && (
            <Button label="Delete" icon="trash-2" variant="danger" onPress={() => onDelete(task)} style={styles.delete} />
          )}
          <Button
            label={task ? 'Save changes' : 'Add to my day'}
            trailingIcon={task ? undefined : 'arrow-right'}
            onPress={submit}
            disabled={!title.trim()}
            style={styles.primary}
          />
        </View>
      }
    >
      <TextField
        ref={titleRef}
        label="Task"
        value={title}
        onChangeText={setTitle}
        placeholder="What do you want to get done?"
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <ProjectPicker value={projectId} onChange={setProjectId} />
      <PriorityPicker value={priority} onChange={setPriority} />
      <DueDateField value={due} onChange={setDue} error={dueError} onError={setDueError} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: spacing.md },
  delete: { paddingHorizontal: spacing.lg },
  primary: { flex: 1 },
});
