import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/recharts")) return "vendor-recharts";
          if (
            id.includes("node_modules/leaflet") ||
            id.includes("node_modules/react-leaflet")
          )
            return "vendor-maps";
          if (id.includes("node_modules/@tanstack/react-query"))
            return "vendor-query";
        },
      },
    },
  },
  server: {
    port: 3000,
  },
});
