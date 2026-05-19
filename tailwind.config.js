/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        vivo: {
          black: "#030008",
          graphite: "#0B0614",
          purple: "#6600CC",
          neon: "#9B2DFF",
          lilac: "#C084FC",
          text: "#B8B8C7"
        }
      },
      boxShadow: {
        neon: "0 0 28px rgba(155, 45, 255, 0.45)",
        panel: "0 24px 80px rgba(0, 0, 0, 0.45)"
      }
    }
  },
  plugins: []
};
