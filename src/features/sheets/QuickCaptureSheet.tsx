import React, { useEffect, useRef, useState } from 'react';
import { Alert, TextInput } from 'react-native';

import { AppText } from '../../components/ui/AppText';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { todayKey } from '../../lib/date';
import { haptics } from '../../lib/haptics';
import { parseTaskLines } from '../../lib/tasks';
import { useStore } from '../../state/StoreProvider';
import { ProjectPicker } from './pickers';

interface QuickCaptureSheetProps {
  visible: boolean;
  onClose: () => void;
  defaultProjectId: string | null;
  onProjectUsed?: (projectId: string | null) => void;
}

export function QuickCaptureSheet({ visible, onClose, defaultProjectId, onProjectUsed }: QuickCaptureSheetProps) {
  const { addTasks, projectsById } = useStore();
  const [text, setText] = useState('');
  const [projectId, setProjectId] = useState<string | null>(defaultProjectId);
  const inputRef = useRef<TextInput>(null);
  const lines = parseTaskLines(text);

  useEffect(() => {
    if (visible) setProjectId(defaultProjectId);
  }, [visible]);

  const submit = () => {
    if (!lines.length) return;
    const due = todayKey();
    addTasks(lines.map(title => ({ title, projectId, due, priority: 'medium' })));
    onProjectUsed?.(projectId);
    haptics.success();
    setText('');
    onClose();
    const where = projectId ? projectsById.get(projectId)?.name ?? 'Inbox' : 'Inbox';
    Alert.alert('Captured', `${lines.length} ${lines.length === 1 ? 'task' : 'tasks'} added to ${where}.`);
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Quick capture"
      subtitle="One task per line. Bullets and numbers are cleaned up for you."
      initialFocusRef={inputRef}
      footer={
        <Button
          label={lines.length ? `Create ${lines.length} ${lines.length === 1 ? 'task' : 'tasks'}` : 'Create tasks'}
          trailingIcon="arrow-right"
          onPress={submit}
          disabled={!lines.length}
        />
      }
    >
      <TextField
        ref={inputRef}
        value={text}
        onChangeText={setText}
        multiline
        placeholder={'Book dentist appointment\nSend proposal to client\nPlan weekend build'}
      />
      <ProjectPicker label="Add to project" value={projectId} onChange={setProjectId} />
      <AppText variant="caption" tone="tertiary">New tasks are due today with medium priority.</AppText>
    </BottomSheet>
  );
}
