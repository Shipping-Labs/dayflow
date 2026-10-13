import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { loadThemePreference, saveThemePreference, ThemePreference } from '../lib/storage';
import { ColorScheme, darkTheme, lightTheme, Theme } from './themes';

interface ThemeContextValue {
  theme: Theme;
  preference: ThemePreference;
  ready: boolean;
  setPreference: (preference: ThemePreference) => void;
  toggleScheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme: ColorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadThemePreference().then(stored => {
      setPreferenceState(stored);
      setReady(true);
    });
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    saveThemePreference(next);
  }, []);

  const scheme: ColorScheme = preference === 'system' ? systemScheme : preference;
  const theme = scheme === 'dark' ? darkTheme : lightTheme;

  const toggleScheme = useCallback(() => {
    setPreference(scheme === 'dark' ? 'light' : 'dark');
  }, [scheme, setPreference]);

  const value = useMemo(
    () => ({ theme, preference, ready, setPreference, toggleScheme }),
    [theme, preference, ready, setPreference, toggleScheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}
