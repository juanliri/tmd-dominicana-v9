import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isCanteraMode: boolean;
  toggleCanteraMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tmd-theme') as Theme | null;
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
      return 'dark'; // Industrial dark default for TMD Dominicana
    }
    return 'dark';
  });

  const [isCanteraMode, setIsCanteraMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tmd-cantera-mode') === 'true';
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    try {
      localStorage.setItem('tmd-theme', theme);
    } catch {
      // ignore local storage restrictions in sandboxes
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (isCanteraMode) {
      root.classList.add('cantera-mode');
    } else {
      root.classList.remove('cantera-mode');
    }
    try {
      localStorage.setItem('tmd-cantera-mode', String(isCanteraMode));
    } catch {
      // ignore
    }
  }, [isCanteraMode]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
  };

  const toggleCanteraMode = () => {
    setIsCanteraMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isCanteraMode, toggleCanteraMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
