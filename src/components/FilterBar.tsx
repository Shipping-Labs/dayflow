import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import {
  projectColor,
  projectFilter,
  SMART_FILTER_ICONS,
  SMART_FILTERS_AFTER,
  SMART_FILTERS_BEFORE,
} from '../constants/projects';
import { useTheme } from '../theme/ThemeProvider';
import { spacing } from '../theme/tokens';
import { Filter, Project } from '../types/task';
import { Chip } from './ui/Chip';

interface FilterBarProps {
  value: Filter;
  projects: Project[];
  onChange: (filter: Filter) => void;
  countFor: (projectId: string) => number;
  onCreateProject: () => void;
  onEditProject: (project: Project) => void;
}

export function FilterBar({ value, projects, onChange, countFor, onCreateProject, onEditProject }: FilterBarProps) {
  const { theme } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {SMART_FILTERS_BEFORE.map(filter => (
        <Chip key={filter} label={filter} icon={SMART_FILTER_ICONS[filter]} selected={value === filter} onPress={() => onChange(filter)} />
      ))}
      {projects.map(project => {
        const filter = projectFilter(project.id);
        return (
          <Chip
            key={project.id}
            label={project.name}
            dotColor={projectColor(project, theme.scheme)}
            selected={value === filter}
            onPress={() => onChange(filter)}
            onLongPress={() => onEditProject(project)}
            count={countFor(project.id)}
          />
        );
      })}
      {SMART_FILTERS_AFTER.map(filter => (
        <Chip key={filter} label={filter} icon={SMART_FILTER_ICONS[filter]} selected={value === filter} onPress={() => onChange(filter)} />
      ))}
      <Chip label="New project" icon="plus" dashed onPress={onCreateProject} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { marginHorizontal: -spacing.xl },
  row: { gap: spacing.sm, paddingHorizontal: spacing.xl },
});
