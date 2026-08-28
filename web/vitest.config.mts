import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    setupFiles: ["./src/test/setup.ts"],
    // Multiple test files share one real Postgres database (see
    // provisioning.test.ts and whatsapp.test.ts) and each wipes shared
    // tables (users/organizations/productAccess/...) between tests.
    // Running test files in parallel races those deletes against each
    // other's fixtures across files; sequential file execution keeps each
    // file's DB state isolated without needing per-test transactions.
    fileParallelism: false,
  },
});
