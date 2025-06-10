import { createTheme } from '@mui/material/styles';

// This file contains shared styles for blog components
const blogTheme = createTheme({
  palette: {
    primary: {
      main: '#0056b3',
      light: '#e9f5ff',
      dark: '#003b7a',
    },
    secondary: {
      main: '#3498db',
      light: '#5dade2',
      dark: '#2980b9',
    },
    text: {
      primary: '#333',
      secondary: '#666',
    },
    background: {
      paper: '#fff',
      default: '#f8f9fa',
    },
    action: {
      hover: '#f0f7ff',
    }
  },
  typography: {
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
      '@media (max-width:600px)': {
        fontSize: '1.8rem',
      },
    },
    h2: {
      fontSize: '1.8rem',
      fontWeight: 500,
      lineHeight: 1.4,
      color: '#0056b3',
      marginTop: '40px',
      marginBottom: '20px',
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
      '@media (max-width:600px)': {
        fontSize: '1.3rem',
      },
    },
    h4: {
      fontSize: '1.2rem',
      fontWeight: 500,
    },
    body1: {
      lineHeight: 1.8,
      marginBottom: '20px',
    },
    body2: {
      color: '#666',
    },
    caption: {
      color: '#7f8c8d',
      fontSize: '0.9rem',
    }
  },
  components: {
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 4,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    }
  }
});

export default blogTheme;

// Common styled components shared by multiple blog components
export const blogStyles = {
  container: {
    maxWidth: '1000px',
    margin: '40px auto 60px',
    padding: '0 20px',
  },
  featuredImage: {
    width: '100%',
    borderRadius: '8px',
    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
  },
  blockquote: {
    borderLeft: '4px solid #0056b3',
    padding: '20px',
    backgroundColor: '#f5f5f5',
    margin: '30px 0',
    fontStyle: 'italic',
    color: '#555',
  }
}; 