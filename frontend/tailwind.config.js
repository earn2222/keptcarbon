/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#3cc2cf',
                    dark: '#2aa3af',
                    light: '#66d4de',
                },
                secondary: '#7c5cfc',
                sidebar: {
                    bg: '#2d3748',
                    dark: '#1a202c',
                }
            },
            fontFamily: {
                sans: ['Inter', 'Prompt', 'sans-serif'],
            },
            boxShadow: {
                'card': '0 4px 20px rgba(0, 0, 0, 0.05)',
                'hover': '0 8px 30px rgba(0, 0, 0, 0.1)',
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
            }
        },
    },
    plugins: [],
}
