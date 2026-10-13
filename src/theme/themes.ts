export type ColorScheme = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceMuted: string;
  surfaceSunken: string;
  border: string;
  borderStrong: string;

  text: string;
  textSecondary: string;
  textTertiary: string;

  accent: string;
  accentPressed: string;
  accentSoft: string;
  onAccent: string;

  hero: string;
  heroBorder: string;
  onHero: string;
  onHeroMuted: string;
  heroTrack: string;

  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;

  backdrop: string;
  shadow: string;
}

export interface Theme {
  scheme: ColorScheme;
  colors: ThemeColors;
}

export const lightTheme: Theme = {
  scheme: 'light',
  colors: {
    background: '#F4F3EF',
    surface: '#FFFFFF',
    surfaceMuted: '#EEEDE8',
    surfaceSunken: '#F7F6F3',
    border: '#E4E2DC',
    borderStrong: '#D3D0C8',

    text: '#141416',
    textSecondary: '#5F5E66',
    textTertiary: '#9A9AA1',

    accent: '#FF5B2E',
    accentPressed: '#E84A1F',
    accentSoft: '#FFE9E1',
    onAccent: '#FFFFFF',

    hero: '#141416',
    heroBorder: '#141416',
    onHero: '#FFFFFF',
    onHeroMuted: '#A3A2AA',
    heroTrack: 'rgba(255,255,255,0.12)',

    success: '#1E9E63',
    successSoft: '#DFF5E9',
    warning: '#E39A12',
    warningSoft: '#FFF2D6',
    danger: '#E2433F',
    dangerSoft: '#FDE6E5',

    backdrop: 'rgba(14,14,18,0.45)',
    shadow: '#1A1712',
  },
};

export const darkTheme: Theme = {
  scheme: 'dark',
  colors: {
    background: '#0B0B0D',
    surface: '#161619',
    surfaceMuted: '#1F1F23',
    surfaceSunken: '#111113',
    border: '#26262B',
    borderStrong: '#34343A',

    text: '#F3F2EE',
    textSecondary: '#A8A7AF',
    textTertiary: '#6E6D75',

    accent: '#FF6A3D',
    accentPressed: '#FF825C',
    accentSoft: '#3A1D14',
    onAccent: '#FFFFFF',

    hero: '#18181C',
    heroBorder: '#2A2A30',
    onHero: '#F3F2EE',
    onHeroMuted: '#8E8D95',
    heroTrack: 'rgba(255,255,255,0.08)',

    success: '#3DD68C',
    successSoft: '#11291D',
    warning: '#F5B544',
    warningSoft: '#33260C',
    danger: '#FF6B66',
    dangerSoft: '#3A1716',

    backdrop: 'rgba(0,0,0,0.6)',
    shadow: '#000000',
  },
};
