/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        bitcount: ['"BitCount Prop Double"', "sans-serif"],
        roboto: ['"Roboto"', "sans-serif"],
      },
      backgroundImage: {
        "dotted-progress":
          "repeating-linear-gradient(90deg, white, white 4px, transparent 4px, transparent 8px)",
      },
      keyframes: {
        slideFromTop: {
          "0%": { top: "-30vh", opacity: "0" },
          "100%": { top: "25%", opacity: "1" },
        },
        slideFromBottom: {
          "0%": { top: "70vh", opacity: "0" },
          "100%": { top: "33%", opacity: "1" },
        },
        goTop: {
          "0%": { top: "25%", opacity: "1" },
          "100%": { top: "10vh", opacity: "0" },
        },
        goBottom: {
          "0%": { top: "33%", opacity: "1" },
          "100%": { top: "70vh", opacity: "0" },
        },
        zoomIn: {
          "0%": {
            transform: "scale(0.1)",
            opacity: "0",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
          },
        },
        slideFromBottomMsg: {
          "0%": { top: "90%", opacity: "0" },
          "100%": { top: "90%", opacity: "1" },
        },
        pulseStrong: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.2" },
        },
        slideAndPulse: {
          "0%": {
            top: "70%",
            opacity: "0",
            transform: "scale(1)",
          },
          "50%": {
            opacity: "0.2",
            transform: "scale(1)",
          },
          "100%": {
            top: "70%",
            opacity: "1",
            transform: "scale(1)",
          },
        },
        marioJump: {
          "0%": { transform: "translate(-40px, 20px) translateY(0)" },
          "30%": { transform: "translate(-40px, 20px) translateY(-20px)" },
          "100%": { transform: "translate(-40px, 20px) translateY(0)" },
        },
      },
      animation: {
        slideFromTop: "slideFromTop 0.7s ease-out forwards",
        slideFromBottom: "slideFromBottom 1.5s ease-out forwards",
        goTop: "goTop 0.7s ease-out forwards",
        goBottom: "goBottom 1s ease-out forwards",
        zoomIn: "zoomIn 0.6s ease-out forwards",
        slideFromBottomMsg: "slideFromBottomMsg 3s ease-out forwards",
        pulseStrong: "pulseStrong 0.5s ease-in-out infinite",
        slideAndPulse:
          "slideAndPulse 1.5s ease-out forwards, pulseStrong 1s ease-in-out infinite",
        jump: "jump 0.6s ease-in-out",
        marioJump: "marioJump 0.6s ease-in-out",
      },
    },
  },
  plugins: [],
};
