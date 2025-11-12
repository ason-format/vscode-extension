import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/extension.ts"],
  format: ["cjs"],
  dts: false,
  splitting: false,
  sourcemap: false,
  clean: true,
  minify: true,
  treeshake: true,
  outDir: "dist",
  external: ["vscode"],
  platform: "node",
  target: "node18",
  async onSuccess() {
    console.log("✓ VS Code extension built successfully");
  },
});
