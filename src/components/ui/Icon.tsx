import React, { ComponentProps } from 'react';
import { Feather } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof Feather>['name'];

export function Icon({ name, size = 18, color }: { name: IconName; size?: number; color: string }) {
  return <Feather name={name} size={size} color={color} />;
}
