import React, { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';

import { AppText } from '../../components/ui/AppText';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { TextField } from '../../components/ui/TextField';
import { createBackup, parseBackup } from '../../lib/backup';
import { haptics } from '../../lib/haptics';
import { useStore } from '../../state/StoreProvider';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing, typography } from '../../theme/tokens';

interface BackupSheetProps {
  visible: boolean;
  onClose: () => void;
  /** When true, the sheet opens with a freshly generated backup. */
  exportOnOpen?: boolean;
}

export function BackupSheet({ visible, onClose, exportOnOpen }: BackupSheetProps) {
  const { tasks, projects, replaceAll } = useStore();
  const { theme, preference, setPreference } = useTheme();
  const [text, setText] = useState('');
  const [generated, setGenerated] = useState(false);

  const generate = () => {
    setText(createBackup(tasks, projects, preference));
    setGenerated(true);
    haptics.light();
  };

  // Regenerate only when the sheet opens, not on every task change while it is open.
  useEffect(() => {
    if (!visible) return;
    if (exportOnOpen) generate();
    else setGenerated(false);
  }, [visible, exportOnOpen]);

  const restore = () => {
    let backup: ReturnType<typeof parseBackup>;
    try {
      backup = parseBackup(text);
    } catch {
      haptics.warning();
      Alert.alert('Could not read backup', 'Paste a valid Dayflow JSON backup.');
      return;
    }
    Alert.alert(
      'Restore backup?',
      `This will replace your current ${tasks.length} tasks and ${projects.length} projects with ${backup.tasks.length} tasks and ${backup.projects.length} projects from the backup.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: () => {
            replaceAll({ tasks: backup.tasks, projects: backup.projects });
            if (backup.theme) setPreference(backup.theme);
            haptics.success();
            setText('');
            setGenerated(false);
            onClose();
          },
        },
      ],
    );
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Backup & restore"
      subtitle="Export your tasks as JSON, or paste a previous backup to restore it. Restoring replaces your current list."
      footer={
        <View style={styles.actions}>
          <Button label="Generate" icon="download" variant="secondary" onPress={generate} style={styles.action} />
          <Button label="Restore" icon="upload" onPress={restore} disabled={!text.trim()} style={styles.action} />
        </View>
      }
    >
      <TextField
        value={text}
        onChangeText={value => { setText(value); setGenerated(false); }}
        multiline
        multilineHeight={200}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="Your backup JSON appears here when you generate it…"
        style={styles.mono}
      />
      {generated && (
        <View style={styles.hint}>
          <Icon name="check-circle" size={14} color={theme.colors.success} />
          <AppText variant="caption" tone="secondary" style={styles.hintText}>
            Backup of {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} ready. Select all, copy, and keep it somewhere safe.
          </AppText>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: spacing.md },
  action: { flex: 1 },
  mono: { ...typography.caption, fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }), lineHeight: 18 },
  hint: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginTop: -spacing.sm },
  hintText: { flex: 1 },
});
