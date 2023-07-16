/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',

        // Or if using `src` directory:
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {},
    },
    plugins: [require('daisyui')],
    daisyui: {
        themes: [
            {
                mytheme: {
                    primary: '#FFFFFF',
                    secondary: '#f6d860',
                    accent: '#37cdbe',
                    neutral: '#3d4451',
                    'base-100': '#ffffff',
                },
            },
            'dark',
            'cupcake',
        ],
    },
};
