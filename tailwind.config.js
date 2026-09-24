/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        editor: {
          border: "#e2e8f0",
          hover: "#f1f5f9",
          focus: "#0f766e",
        },
      },
      keyframes: {
        rleFadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "rle-fade-in": "rleFadeIn 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
