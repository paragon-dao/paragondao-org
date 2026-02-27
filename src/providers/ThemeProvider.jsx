import React, { createContext, useContext, useState, useEffect } from 'react';

// Theme definitions
const themes = {
  dark: {
    name: 'dark',
    // Backgrounds
    bgPrimary: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
    bgSecondary: 'rgba(30, 30, 50, 0.9)',
    bgCard: 'rgba(255,255,255,0.03)',
    bgHover: 'rgba(255,255,255,0.05)',
    bgHeader: 'rgba(15,23,42,0.98)',
    bgFooter: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)',
    bgInput: 'rgba(255,255,255,0.05)',
    // Text
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255,255,255,0.7)',
    textMuted: 'rgba(255,255,255,0.5)',
    textAccent: '#a5b4fc',
    // Borders
    borderPrimary: 'rgba(255,255,255,0.1)',
    borderAccent: 'rgba(99,102,241,0.2)',
    // Brand colors
    primary: '#6366f1',
    primaryLight: '#a5b4fc',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    // Shadows
    shadowCard: '0 8px 32px rgba(0, 0, 0, 0.3)',
    shadowButton: '0 4px 16px rgba(99,102,241,0.3)',
  },
  light: {
    name: 'light',
    // Backgrounds
    bgPrimary: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
    bgSecondary: 'rgba(255, 255, 255, 0.9)',
    bgCard: 'rgba(255,255,255,0.8)',
    bgHover: 'rgba(0,0,0,0.02)',
    bgHeader: 'rgba(255,255,255,0.95)',
    bgFooter: 'linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)',
    bgInput: 'rgba(0,0,0,0.03)',
    // Text
    textPrimary: '#1e293b',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    textAccent: '#6366f1',
    // Borders
    borderPrimary: 'rgba(0,0,0,0.1)',
    borderAccent: 'rgba(99,102,241,0.3)',
    // Brand colors
    primary: '#6366f1',
    primaryLight: '#818cf8',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    // Shadows
    shadowCard: '0 8px 32px rgba(0, 0, 0, 0.1)',
    shadowButton: '0 4px 16px rgba(99,102,241,0.2)',
  }
};

const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem('paragondao_theme');
    if (saved && (saved === 'dark' || saved === 'light')) {
      return saved;
    }
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark'; // Default to dark
  });

  const theme = themes[themeName];

  // Save to localStorage when theme changes
  useEffect(() => {
    localStorage.setItem('paragondao_theme', themeName);
    // Also update document root for potential CSS variable usage
    document.documentElement.setAttribute('data-theme', themeName);
  }, [themeName]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const saved = localStorage.getItem('paragondao_theme');
      if (!saved) {
        setThemeName(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setThemeName(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const setTheme = (name) => {
    if (name === 'dark' || name === 'light') {
      setThemeName(name);
    }
  };

  const value = {
    theme,
    themeName,
    isDark: themeName === 'dark',
    isLight: themeName === 'light',
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;










