import { createContext, useContext, useState, ReactNode } from 'react';

// Define theme types
type ThemeColors = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
};

// Define available themes
const themes: Record<string, ThemeColors> = {
  default: {
    primary: 'blue-600',
    secondary: 'indigo-500',
    accent: 'purple-500',
    background: 'gray-50',
    text: 'gray-800'
  },
  therapist1: {
    primary: 'emerald-600',
    secondary: 'teal-500',
    accent: 'cyan-500',
    background: 'gray-50',
    text: 'gray-800'
  },
  therapist2: {
    primary: 'violet-600',
    secondary: 'purple-500',
    accent: 'fuchsia-500',
    background: 'gray-50',
    text: 'gray-800'
  },
  therapist3: {
    primary: 'amber-600',
    secondary: 'orange-500',
    accent: 'yellow-500',
    background: 'gray-50',
    text: 'gray-800'
  }
};

// Create context
type ThemeContextType = {
  currentTheme: string;
  colors: ThemeColors;
  setTheme: (themeId: string) => void;
  getColor: (colorType: keyof ThemeColors) => string;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider component
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [currentTheme, setCurrentTheme] = useState('default');

  const setTheme = (themeId: string) => {
    if (themes[themeId]) {
      setCurrentTheme(themeId);
    }
  };

  const getColor = (colorType: keyof ThemeColors) => {
    return themes[currentTheme][colorType];
  };

  const value = {
    currentTheme,
    colors: themes[currentTheme],
    setTheme,
    getColor
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook for using the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};