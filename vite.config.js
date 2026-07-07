import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),

      "@api": path.resolve(__dirname, "./src/api"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@context": path.resolve(__dirname, "./src/context"),
      "@data": path.resolve(__dirname, "./src/data"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@redux": path.resolve(__dirname, "./src/redux"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@form": path.resolve(__dirname, "./src/form-engine"),
      "@hpCommonModal": path.resolve(__dirname, "./src/hp-common-modal"),

      // Layout
      "@layouts": path.resolve(__dirname, "./src/layouts"),

      // Routes
      "@routes": path.resolve(__dirname, "./src/routes"),

      // HP Grid
      "@hpGrid": path.resolve(__dirname, "./src/components/hpGrid/src"),

      // Common Components
      "@ui": path.resolve(__dirname, "./src/components/ui"),

      // Config
      "@config": path.resolve(__dirname, "./src/config"),

      // Constants
      "@constants": path.resolve(__dirname, "./src/constants"),

      // Custom Libraries
      "@lib": path.resolve(__dirname, "./src/lib"),

      
    },
  },
});
