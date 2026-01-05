/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        // Responsive breakpoints - Mobile First
        screens: {
            'xs': '475px',   // Extra small devices
            'sm': '640px',   // Mobile landscape / Small tablets
            'md': '768px',   // Tablets
            'lg': '1024px',  // Small laptops / Tablets landscape
            'xl': '1280px',  // Desktops
            '2xl': '1536px', // Large desktops
        },
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#3cc2cf',
                    dark: '#2aa3af',
                    light: '#66d4de',
                    50: '#f0fdff',
                    100: '#ccf7fc',
                    200: '#99eff9',
                    300: '#66d4de',
                    400: '#3cc2cf',
                    500: '#2aa3af',
                    600: '#1e8c96',
                    700: '#16707a',
                    800: '#0f5a62',
                    900: '#0a464d',
                },
                secondary: '#7c5cfc',
                sidebar: {
                    bg: '#2d3748',
                    dark: '#1a202c',
                },
                green: {
                    DEFAULT: '#059669',
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
                }
            },
            fontFamily: {
                sans: ['Prompt', 'Inter', 'Anuphan', 'sans-serif'],
                display: ['Prompt', 'Inter', 'sans-serif'],
            },
            // Fluid Typography
            fontSize: {
                'xs': ['clamp(0.75rem, 1.5vw, 0.875rem)', { lineHeight: '1.5' }],
                'sm': ['clamp(0.875rem, 2vw, 1rem)', { lineHeight: '1.5' }],
                'base': ['clamp(0.875rem, 2vw, 1rem)', { lineHeight: '1.6' }],
                'lg': ['clamp(1rem, 2.25vw, 1.125rem)', { lineHeight: '1.75' }],
                'xl': ['clamp(1.125rem, 2.5vw, 1.25rem)', { lineHeight: '1.75' }],
                '2xl': ['clamp(1.25rem, 3vw, 1.5rem)', { lineHeight: '2' }],
                '3xl': ['clamp(1.5rem, 3.5vw, 1.875rem)', { lineHeight: '2.25' }],
                '4xl': ['clamp(1.75rem, 4vw, 2.25rem)', { lineHeight: '2.5' }],
                '5xl': ['clamp(2rem, 5vw, 3rem)', { lineHeight: '1' }],
            },
            // Responsive Spacing
            spacing: {
                'safe-top': 'max(1rem, env(safe-area-inset-top))',
                'safe-bottom': 'max(1rem, env(safe-area-inset-bottom))',
                'safe-left': 'max(1rem, env(safe-area-inset-left))',
                'safe-right': 'max(1rem, env(safe-area-inset-right))',
            },
            // Enhanced Shadows
            boxShadow: {
                'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'card': '0 4px 12px rgba(0, 0, 0, 0.05)',
                'hover': '0 8px 24px rgba(0, 0, 0, 0.08)',
                'premium': '0 10px 30px rgba(6, 95, 70, 0.12)',
                'premium-hover': '0 16px 40px rgba(6, 95, 70, 0.15)',
                'inner-lg': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
            },
            // Border Radius - Touch Friendly
            borderRadius: {
                'sm': '0.5rem',
                'DEFAULT': '0.75rem',
                'md': '0.75rem',
                'lg': '1rem',
                'xl': '1.25rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            },
            // Min/Max Dimensions for Touch Targets
            minHeight: {
                'touch': '48px',      // Mobile touch target
                'touch-lg': '56px',   // Large touch target
                'touch-desktop': '44px', // Desktop touch target
            },
            minWidth: {
                'touch': '48px',
                'touch-lg': '56px',
                'touch-desktop': '44px',
            },
            // Transitions
            transitionDuration: {
                'fast': '150ms',
                'normal': '250ms',
                'slow': '350ms',
            },
            // Z-index scale
            zIndex: {
                'dropdown': '1000',
                'sticky': '1020',
                'fixed': '1030',
                'modal-backdrop': '1040',
                'modal': '1050',
                'popover': '1060',
                'tooltip': '1070',
            },
        },
    },
    plugins: [],
}
