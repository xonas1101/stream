/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        bitcount: ['"BitCount Prop Double"', "sans-serif"],
      },
      keyframes: {
        slideFromTop: {
          "0%": { top: "-30vh", opacity: "0" },
          "100%": { top: "25%", opacity: "1" },
        },
        slideFromBottom: {
          "0%": { top: "50vh", opacity: "0" },
          "100%": { top: "33%", opacity: "1" },
        },
        goTop: {
          "0%": { top: "25%", opacity: "1" },
          "100%": { top: "-50vh", opacity: "0" },
        },
        goBottom: {
          "0%": { top: "33%", opacity: "1" },
          "100%": { top: "100vh", opacity: "0" },
        },
      },
      animation: {
        slideFromTop: "slideFromTop 0.3s ease-out forwards",
        slideFromBottom: "slideFromBottom 0.5s ease-out forwards",
        goTop: "goTop 1.5s ease-out forwards",
        goBottom: "goBottom 1.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};
