/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                constructive: {
                    DEFAULT: 'hsl(var(--constructive))',
                    foreground: 'hsl(var(--constructive-foreground))',
                },
            },
        },
    },
};
