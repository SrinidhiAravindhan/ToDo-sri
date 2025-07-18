/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { qrcode } from "vite-plugin-qrcode";
import manifest from "./manifest";
import basicSsl from "@vitejs/plugin-basic-ssl";

const isDevHost = process.env.npm_lifecycle_event === "dev:host";
const DEV_ENABLE_HTTPS = isDevHost;
const DEV_ENABLE_PWA = false; // optional: set to true if you want to test PWA

export default defineConfig({
  test: {
    globals: true,
  },
  plugins: [
    react({
      jsxImportSource: "@emotion/react",
      babel: {
        plugins: ["@emotion/babel-plugin"],
      },
    }),
    DEV_ENABLE_HTTPS && basicSsl(),
    qrcode({
      filter: (url) =>
        url.startsWith("http://192.168.0.") || url.startsWith("https://192.168.0."),
    }),
    VitePWA({
      manifest,
      devOptions: {
        enabled: DEV_ENABLE_PWA,
        type: "module",
      },
      registerType: "prompt",
      includeAssets: ["**/*", "sw.js", "!splash-screens/**/*"],
    }),
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json", ".mjs", ".mts"],
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        if (
          warning.code === "SOURCEMAP_ERROR" ||
          warning.message.includes("PURE")
        ) {
          return;
        }
        warn(warning);
      },
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.match(/node_modules\/react(-dom)?\//) ||
              id.includes("node_modules/react-is/") ||
              id.includes("node_modules/scheduler/")
            ) {
              return "vendor-react";
            }
            if (id.includes("@dnd-kit")) {
              return "dnd-kit";
            }
            if (id.includes("@mui") || id.includes("@emotion")) {
              return "ui-lib";
            }
            if (id.includes("emoji-picker-react")) {
              return "emoji";
            }
            if (id.includes("ntc-ts")) {
              return "ntc";
            }
            return "vendor";
          }

          if (id.includes("src/components/tasks")) {
            return "tasks";
          }
          if (id.includes("src/components/settings")) {
            return "settings";
          }
        },
      },
    },
  },
});
