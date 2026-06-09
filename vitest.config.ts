import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    // Resolve the "@/*" tsconfig path alias natively (no plugin needed).
    tsconfigPaths: true,
    alias: {
      // `server-only` throws when imported outside an RSC bundler context.
      // Stub it so server modules can be unit-tested under plain Node.
      "server-only": fileURLToPath(
        new URL("./test/stubs/server-only.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules", ".next", "dist", ".claude/**"],
  },
});
