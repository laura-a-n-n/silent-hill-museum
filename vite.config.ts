/// <reference types="vitest" />
import { defineConfig } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";

export default defineConfig({
  test: {
    setupFiles: ["src/tests/setup.ts"],
  },

  plugins: [
    createHtmlPlugin({
      inject: {
        data: {
          appVersion: process.env.npm_package_version,
        },
      },
    }),
  ],

  build: {
    target: "es6",
  },
});
