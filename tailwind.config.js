/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                skin: {
                    base: 'var(--color-bg)',
                    card: 'var(--color-card)',
                    text: 'var(--color-text)',
                    subtext: 'var(--color-subtext)',
                    border: 'var(--color-border)',
                    primary: 'var(--color-primary)',
                    'primary-fg': 'var(--color-primary-fg)',
                    accent: 'var(--color-accent)',
                }
            },
            borderRadius: {
                skin: 'var(--radius)',
            },
            boxShadow: {
                skin: 'var(--shadow)',
            },
            fontFamily: {
                skin: 'var(--font-family)',
            },
            animation: {
                'modal-in': 'modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'fade-in': 'fadeIn 0.3s ease-out forwards',
            },
            keyframes: {
                modalIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95) translateY(10px)' },
                    '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                }
            }
        },
    },
    plugins: [],
}
