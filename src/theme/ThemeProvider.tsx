import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, Theme } from './theme';
import { useSettingsStore } from '@/store/useSettingsStore';

const ThemeContext = createContext<Theme>(lightTheme);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const themePreference = useSettingsStore((s) => s.themePreference);

  const resolvedTheme = useMemo(() => {
    const mode =
      themePreference === 'system' ? systemScheme ?? 'light' : themePreference;
    return mode === 'dark' ? darkTheme : lightTheme;
  }, [themePreference, systemScheme]);

  return (
    <ThemeContext.Provider value={resolvedTheme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
