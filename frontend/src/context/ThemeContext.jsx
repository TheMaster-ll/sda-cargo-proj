import React, { createContext, useState, useEffect, useMemo, useContext } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material/styles';

const ThemeContext = createContext({ mode: 'light', toggleTheme: () => {} });

const baseTypography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h4: { fontWeight: 700 },
  h5: { fontWeight: 600 },
  h6: { fontWeight: 600 },
  subtitle1: { fontWeight: 500 },
  button: { textTransform: 'none', fontWeight: 600 }
};

const baseShape = { borderRadius: 8 };

function buildTheme(mode) {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#1a7a7a' : '#1a3a4a',
        light: isDark ? '#2dd4bf' : '#2d5f72',
        dark: isDark ? '#115e5e' : '#0f2a36',
        contrastText: '#ffffff'
      },
      secondary: {
        main: '#f59e0b',
        light: '#fbbf24',
        dark: '#d97706',
        contrastText: '#000000'
      },
      success: { main: '#10b981', light: isDark ? '#065f46' : '#d1fae5', dark: '#059669' },
      error: { main: '#ef4444', light: isDark ? '#7f1d1d' : '#fee2e2', dark: '#dc2626' },
      warning: { main: '#f59e0b', light: isDark ? '#78350f' : '#fef3c7', dark: '#d97706' },
      info: { main: '#3b82f6', light: isDark ? '#1e3a5f' : '#dbeafe', dark: '#2563eb' },
      background: {
        default: isDark ? '#0f172a' : '#f8fafc',
        paper: isDark ? '#1e293b' : '#ffffff'
      },
      text: {
        primary: isDark ? '#f1f5f9' : '#0f172a',
        secondary: isDark ? '#94a3b8' : '#64748b'
      },
      divider: isDark ? '#334155' : '#e2e8f0',
      sidebar: {
        bg: '#0f172a',
        hover: '#1e293b',
        active: isDark ? '#2dd4bf' : '#f59e0b',
        text: '#94a3b8',
        activeText: isDark ? '#000' : '#000'
      },
      // Custom tokens for components with hardcoded colors
      custom: {
        cardBorder: isDark ? '#334155' : '#e2e8f0',
        inputBg: isDark ? '#1e293b' : '#f1f5f9',
        headerBg: isDark ? '#1e293b' : '#ffffff',
        headerBorder: isDark ? '#334155' : '#e2e8f0',
        hoverBg: isDark ? '#334155' : '#f1f5f9',
        accent: isDark ? '#2dd4bf' : '#f59e0b',
        primaryButton: isDark ? '#1a7a7a' : '#1a3a4a',
        primaryButtonHover: isDark ? '#115e5e' : '#0f2a36',
      }
    },
    typography: baseTypography,
    shape: baseShape,
    components: {
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 8, padding: '8px 20px', fontSize: '0.875rem' },
          containedPrimary: {
            backgroundColor: isDark ? '#1a7a7a' : '#1a3a4a',
            '&:hover': { backgroundColor: isDark ? '#115e5e' : '#0f2a36' }
          },
          containedSecondary: {
            backgroundColor: '#f59e0b',
            color: '#000000',
            '&:hover': { backgroundColor: '#d97706' }
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            backgroundColor: isDark ? '#1e293b' : '#ffffff'
          }
        }
      },
      MuiTextField: {
        styleOverrides: {
          root: { '& .MuiOutlinedInput-root': { borderRadius: 8 } }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 500, fontSize: '0.75rem' }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none'
          }
        }
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
          }
        }
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#1e293b' : '#ffffff'
          }
        }
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: isDark ? '#334155' : '#e2e8f0'
          }
        }
      }
    }
  });
}

export function ThemeContextProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('cargoport-theme') || 'light');

  useEffect(() => {
    const handler = (e) => {
      const newMode = e.detail;
      if (newMode === 'light' || newMode === 'dark') {
        setMode(newMode);
      }
    };
    window.addEventListener('theme-change', handler);
    return () => window.removeEventListener('theme-change', handler);
  }, []);

  const theme = useMemo(() => buildTheme(mode), [mode]);

  const toggleTheme = () => {
    const next = mode === 'light' ? 'dark' : 'light';
    setMode(next);
    localStorage.setItem('cargoport-theme', next);
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export const useThemeMode = () => useContext(ThemeContext);
export default ThemeContext;
