import { createTheme } from '@mui/material/styles';

// Penguin Identity Theme
export const penguinTheme = createTheme({
    palette: {
        mode: 'light',
        background: {
            default: '#FFFFFF', // Pure White
            paper: '#FFFFFF', // White with heavy shadows
        },
        primary: {
            main: '#FF4500', // Vivid Orange-Red (The "Beak")
            dark: '#E63946', // Alternative orange-red
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#F4F6F8', // Ice White
        },
        text: {
            primary: '#000000', // Pitch Black
            secondary: '#333333',
        },
        divider: '#000000',
        border: '#000000',
    },
    shape: {
        borderRadius: 32, // rounded-3xl equivalent (32px)
    },
    typography: {
        fontFamily: [
            'Inter',
            'Nunito',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),
        h1: {
            fontWeight: 700, // Bold
            fontSize: '2.5rem',
            lineHeight: 1.2,
        },
        h2: {
            fontWeight: 700,
            fontSize: '2rem',
            lineHeight: 1.3,
        },
        h3: {
            fontWeight: 700,
            fontSize: '1.5rem',
            lineHeight: 1.4,
        },
        h4: {
            fontWeight: 700,
            fontSize: '1.25rem',
            lineHeight: 1.4,
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.6,
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.5,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 32, // Penguin belly corners
                    border: '2px solid #000000', // Thick borders
                    fontWeight: 600,
                    textTransform: 'none',
                    padding: '12px 24px',
                    fontSize: '1rem',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                    },
                },
                contained: {
                    backgroundColor: '#000000',
                    color: '#FFFFFF',
                    '&:hover': {
                        backgroundColor: '#333333',
                    },
                },
                outlined: {
                    backgroundColor: '#FFFFFF',
                    color: '#000000',
                    '&:hover': {
                        backgroundColor: '#F4F6F8',
                    },
                },
                primary: {
                    backgroundColor: '#FF4500',
                    borderColor: '#FF4500',
                    color: '#FFFFFF',
                    '&:hover': {
                        backgroundColor: '#E63946',
                        borderColor: '#E63946',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 32,
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #000000',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', // shadow-xl equivalent
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 32,
                    border: '2px solid #000000',
                    backgroundImage: 'none', // Remove default gradient
                },
                elevation1: {
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                },
            },
        },
        MuiSlider: {
            styleOverrides: {
                root: {
                    color: '#000000',
                    '& .MuiSlider-track': {
                        backgroundColor: '#000000',
                        border: '2px solid #000000',
                    },
                    '& .MuiSlider-rail': {
                        backgroundColor: '#F4F6F8',
                        border: '2px solid #000000',
                    },
                    '& .MuiSlider-thumb': {
                        backgroundColor: '#FF4500', // Primary action color
                        border: '2px solid #000000',
                        width: 24,
                        height: 24,
                        '&:hover, &.Mui-active': {
                            boxShadow: '0 0 0 8px rgba(255, 69, 0, 0.16)',
                        },
                    },
                },
            },
        },
        MuiContainer: {
            styleOverrides: {
                root: {
                    backgroundColor: '#FFFFFF',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#FFFFFF',
                    color: '#000000',
                    border: '2px solid #000000',
                    borderBottom: '2px solid #000000',
                },
            },
        },
    },
    shadows: [
        'none',
        '0 2px 4px rgba(0,0,0,0.1)',
        '0 4px 8px rgba(0,0,0,0.12)',
        '0 8px 16px rgba(0,0,0,0.14)',
        '0 16px 32px rgba(0,0,0,0.16)',
        '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', // shadow-xl
    ],
});

// Design tokens for consistent usage
export const designTokens = {
    colors: {
        background: {
            primary: '#FFFFFF',
            secondary: '#F4F6F8',
        },
        surface: '#FFFFFF',
        primary: {
            main: '#FF4500',
            dark: '#E63946',
        },
        text: {
            primary: '#000000',
            secondary: '#333333',
        },
        border: '#000000',
    },
    borderRadius: {
        large: 32, // rounded-3xl
        medium: 16,
        small: 8,
    },
    borderWidth: {
        thick: 2,
        medium: 1,
    },
    shadows: {
        heavy: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        medium: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        light: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    },
};

export default penguinTheme;
