import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    deps: {
      interopDefault: true,
    },
    include: [
      "src/tests/**/*.test.ts",
    ],
    teardownTimeout: 30000,
    watch: false,
  },
});
