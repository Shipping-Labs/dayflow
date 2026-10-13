import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ColorPicker } from '../../components/ColorPicker';
import { AppText } from '../../components/ui/AppText';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { Icon } from '../../components/ui/Icon';
import { TextField } from '../../components/ui/TextField';
import { COLOR_ORDER, CUSTOM_COLOR_SWATCHES, MAX_PROJECT_NAME, PROJECT_COLORS } from '../../constants/projects';
import { isValidHexColor, normalizeHexColor, sanitizeHexDraft } from '../../lib/color';
import { haptics } from '../../lib/haptics';
import { openCountFor } from '../../lib/tasks';
import { useStore } from '../../state/StoreProvider';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/tokens';
import { Project, ProjectColor } from '../../types/task';

type ColorMode = 'preset' | 'picker';

interface ProjectSheetProps {
  visible: boolean;
  onClose: () => void;
  project?: Project;
  onSaved?: (project: Project) => void;
  onDeleted?: (project: Project) => void;
}

export function ProjectSheet({ visible, onClose, project, onSaved, onDeleted }: ProjectSheetProps) {
  const { theme } = useTheme();
  const { projects, tasks, addProject, updateProject, removeProject } = useStore();
  const [name, setName] = useState('');
  const [preset, setPreset] = useState<ProjectColor>('violet');
  const [mode, setMode] = useState<ColorMode>('preset');
  const [customHex, setCustomHex] = useState('#FF5B2E');
  const [customError, setCustomError] = useState<string>();
  const [error, setError] = useState<string>();
  const nameRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!visible) return;
    setError(undefined);
    setCustomError(undefined);
    if (project) {
      setName(project.name);
      setPreset(project.color);
      if (project.customColor) {
        setMode('picker');
        setCustomHex(project.customColor);
      } else {
        setMode('preset');
        setCustomHex(CUSTOM_COLOR_SWATCHES[0]);
      }
    } else {
      const used = new Set(projects.map(p => p.color));
      setName('');
      setPreset(COLOR_ORDER.find(c => !used.has(c)) ?? COLOR_ORDER[projects.length % COLOR_ORDER.length]);
      setMode('preset');
      setCustomHex(CUSTOM_COLOR_SWATCHES[0]);
    }
  }, [visible, project, projects]);

  const previewColor = useMemo(() => {
    if (mode === 'picker') {
      return normalizeHexColor(customHex) ?? PROJECT_COLORS[preset][theme.scheme];
    }
    return PROJECT_COLORS[preset][theme.scheme];
  }, [mode, customHex, preset, theme.scheme]);

  const pickPreset = (c: ProjectColor) => {
    haptics.selection();
    setMode('preset');
    setPreset(c);
    setCustomError(undefined);
  };

  const commitCustomHex = () => {
    const normalized = normalizeHexColor(customHex);
    if (!normalized) {
      setCustomError('Enter a valid hex color, e.g. #FF5B2E');
      return;
    }
    setCustomHex(normalized);
    setCustomError(undefined);
  };

  const save = () => {
    const clean = name.trim();
    if (!clean) return;
    if (clean.toLowerCase() === 'inbox') {
      setError('Inbox is built in. Pick another name.');
      return;
    }
    if (projects.some(p => p.id !== project?.id && p.name.toLowerCase() === clean.toLowerCase())) {
      setError('You already have a project with this name.');
      return;
    }

    let customColor: string | null = null;
    if (mode === 'picker') {
      const normalized = normalizeHexColor(customHex);
      if (!normalized) {
        setCustomError('Pick a color on the wheel or enter a valid hex code.');
        return;
      }
      customColor = normalized;
    }

    let saved: Project;
    if (project) {
      updateProject(project.id, { name: clean, color: preset, customColor });
      saved = {
        ...project,
        name: clean,
        color: preset,
        ...(customColor ? { customColor } : {}),
      };
      if (!customColor) delete saved.customColor;
    } else {
      saved = addProject({ name: clean, color: preset, ...(customColor ? { customColor } : {}) });
    }
    haptics.success();
    onSaved?.(saved);
    onClose();
  };

  const confirmDelete = () => {
    if (!project) return;
    const count = tasks.filter(t => t.projectId === project.id).length;
    const open = openCountFor(tasks, project.id);
    Alert.alert(
      `Delete “${project.name}”?`,
      count
        ? `Its ${count} ${count === 1 ? 'task' : 'tasks'}${open ? ` (${open} open)` : ''} will move to Inbox.`
        : 'This project has no tasks.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            haptics.warning();
            removeProject(project.id);
            onDeleted?.(project);
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
      title={project ? 'Edit project' : 'New project'}
      subtitle={project ? 'Rename it, pick a color, or remove it.' : 'Group related tasks together.'}
      initialFocusRef={project ? undefined : nameRef}
      footer={
        <View style={styles.actions}>
          {project && (
            <Button label="Delete" icon="trash-2" variant="danger" onPress={confirmDelete} style={styles.delete} />
          )}
          <Button
            label={project ? 'Save' : 'Create project'}
            trailingIcon={project ? undefined : 'arrow-right'}
            onPress={save}
            disabled={!name.trim()}
            style={styles.primary}
          />
        </View>
      }
    >
      <View style={[styles.preview, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}>
        <View style={[styles.previewDot, { backgroundColor: previewColor }]} />
        <View style={styles.previewCopy}>
          <AppText variant="label">{name.trim() || 'Project name'}</AppText>
          <AppText variant="caption" tone="tertiary">
            {mode === 'picker' ? `Custom ${normalizeHexColor(customHex) ?? customHex}` : 'Preset color'}
          </AppText>
        </View>
      </View>

      <TextField
        ref={nameRef}
        label="Name"
        value={name}
        onChangeText={value => { setName(value); setError(undefined); }}
        placeholder="e.g. Side project, Home, Fitness"
        maxLength={MAX_PROJECT_NAME}
        returnKeyType="done"
        onSubmitEditing={save}
        error={error}
      />

      <View style={styles.modeRow}>
        <Chip label="Presets" selected={mode === 'preset'} onPress={() => setMode('preset')} style={styles.modeChip} />
        <Chip label="Color picker" icon="sliders" selected={mode === 'picker'} onPress={() => { setMode('picker'); haptics.selection(); }} style={styles.modeChip} />
      </View>

      {mode === 'preset' ? (
        <View style={styles.colors}>
          <AppText variant="overline" tone="tertiary" style={styles.label}>Choose a preset</AppText>
          <View style={styles.swatches}>
            {COLOR_ORDER.map(c => {
              const selected = c === preset;
              const swatch = PROJECT_COLORS[c][theme.scheme];
              return (
                <Pressable
                  key={c}
                  onPress={() => pickPreset(c)}
                  accessibilityRole="button"
                  accessibilityLabel={`${c} color`}
                  accessibilityState={{ selected }}
                  hitSlop={4}
                  style={[styles.swatchRing, { borderColor: selected ? swatch : 'transparent' }]}
                >
                  <View style={[styles.swatch, { backgroundColor: swatch }]}>
                    {selected && <Icon name="check" size={16} color="#FFFFFF" />}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : (
        <View style={styles.colors}>
          <AppText variant="overline" tone="tertiary" style={styles.label}>Drag on the square, slide hue, or type hex</AppText>
          <ColorPicker
            value={customHex}
            onChange={hex => {
              setMode('picker');
              setCustomHex(hex);
              setCustomError(undefined);
            }}
          />
          <TextField
            label="Hex code"
            value={customHex}
            onChangeText={value => { setMode('picker'); setCustomHex(sanitizeHexDraft(value)); setCustomError(undefined); }}
            onBlur={commitCustomHex}
            placeholder="#FF5B2E"
            autoCapitalize="characters"
            autoCorrect={false}
            error={customError}
          />
          <AppText variant="overline" tone="tertiary" style={styles.label}>Shortcuts</AppText>
          <View style={styles.swatches}>
            {CUSTOM_COLOR_SWATCHES.map(hex => {
              const selected = normalizeHexColor(customHex) === hex;
              return (
                <Pressable
                  key={hex}
                  onPress={() => { setMode('picker'); setCustomHex(hex); setCustomError(undefined); haptics.selection(); }}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[styles.swatchRing, { borderColor: selected ? hex : theme.colors.border }]}
                >
                  <View style={[styles.swatch, { backgroundColor: hex }]}>
                    {selected && <Icon name="check" size={16} color="#FFFFFF" />}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: spacing.md },
  delete: { paddingHorizontal: spacing.lg },
  primary: { flex: 1 },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
  },
  previewDot: { width: 28, height: 28, borderRadius: 14 },
  previewCopy: { flex: 1, gap: spacing.xxs },
  modeRow: { flexDirection: 'row', gap: spacing.sm },
  modeChip: { flex: 1, justifyContent: 'center' },
  colors: { gap: spacing.sm },
  label: { marginLeft: 2 },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  swatchRing: { padding: 3, borderRadius: 24, borderWidth: 2 },
  swatch: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});
