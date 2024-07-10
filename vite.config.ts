import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: "./ui/public",
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./ui/src"),
    },
  },
});
