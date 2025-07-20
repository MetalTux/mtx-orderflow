/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}', // Asegúrate de que esta línea esté presente
    './pages/**/*.{js,ts,jsx,tsx,mdx}', // Si usas la carpeta `pages` también
    './components/**/*.{js,ts,jsx,tsx,mdx}', // Si tienes una carpeta `components`
    // Añade cualquier otra ruta donde uses clases de Tailwind
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

