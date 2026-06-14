/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#619224",
        },
        secondary: {
          DEFAULT: "#2B6A1A",
        },
        accent: {
          DEFAULT: "#803DF5",
        },
        darkbg: {
          DEFAULT: "#1F221C",
          sub: "#151713",
        },
        darktext: {
          DEFAULT: "#DDE4D6",
        }
      },
    },
  },
  plugins: [],
}
