import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '../../components/ui/AppText';
import { Chip } from '../../components/ui/Chip';
import { PriorityChip } from '../../components/ui/PriorityChip';
import { INBOX_COLOR, PRIORITIES, projectColor } from '../../constants/projects';
import { useStore } from '../../state/StoreProvider';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/tokens';
import { Priority } from '../../types/task';
import { ProjectSheet } from './ProjectSheet';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <AppText variant="overline" tone="tertiary" style={styles.label}>{label}</AppText>
      <View style={styles.wrap}>{children}</View>
    </View>
  );
}

interface ProjectPickerProps {
  label?: string;
  value: string | null;
  onChange: (projectId: string | null) => void;
}

export function ProjectPicker({ label = 'Project', value, onChange }: ProjectPickerProps) {
  const { theme } = useTheme();
  const { projects } = useStore();
  const [creating, setCreating] = useState(false);

  return (
    <Field label={label}>
      <Chip label="Inbox" dotColor={INBOX_COLOR[theme.scheme]} selected={value === null} onPress={() => onChange(null)} />
      {projects.map(p => (
        <Chip
          key={p.id}
          label={p.name}
          dotColor={projectColor(p, theme.scheme)}
          selected={value === p.id}
          onPress={() => onChange(p.id)}
        />
      ))}
      <Chip label="New" icon="plus" dashed onPress={() => setCreating(true)} />
      <ProjectSheet visible={creating} onClose={() => setCreating(false)} onSaved={p => onChange(p.id)} />
    </Field>
  );
}

export function PriorityPicker({ value, onChange }: { value: Priority; onChange: (p: Priority) => void }) {
  return (
    <View style={styles.field}>
      <AppText variant="overline" tone="tertiary" style={styles.label}>Priority</AppText>
      <View style={styles.priorityRow}>
        {PRIORITIES.map(p => (
          <PriorityChip key={p} priority={p} selected={value === p} onPress={() => onChange(p)} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.sm },
  label: { marginLeft: 2 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  priorityRow: { flexDirection: 'row', gap: spacing.sm, width: '100%' },
});
