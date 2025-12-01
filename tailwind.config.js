/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],

  theme: {
    extend: {
      colors: {
        darkBlue: "#003366", // العناوين والنافبار
        blue: "#336699", // الروابط والعناصر الثانوية
        orange: "#ff9933", // أزرار الشراء و CTA
        white: "#FFFFFF", // الخلفية الأساسية

        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },

        green: {
          100: "#d1fae5",
          500: "#22c55e",
          600: "#16a34a",
        },

        red: {
          500: "#ef4444",
        },
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
