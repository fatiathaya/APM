/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.ejs", "./public/js/**/*.js"],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#0f172a',      // Slate 900
        'primary-blue': '#1e3a8a',      // Deep Medical Blue
        'secondary-blue': '#2563eb',    // Active Blue
        'accent-blue': '#38bdf8',       // Tech Blue
        'light-blue-bg': '#f0f9ff',     // Accent Background
        'body-bg': '#f8fafc',           // Light Slate Gray BG
        'success-light': '#f0fdf4',
        'danger-light': '#fff1f2',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 30px -10px rgba(15, 23, 42, 0.08)',
        medium: '0 20px 40px -15px rgba(15, 23, 42, 0.12)',
        glow: '0 0 25px rgba(37, 99, 235, 0.2)',
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
