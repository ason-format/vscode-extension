import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/extension.ts"],
  format: ["cjs"], // VS Code extensions use CommonJS
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false, // Keep readable for debugging
  treeshake: true,
  outDir: "dist",
  external: ["vscode"], // VS Code API is always external
  platform: "node",
  target: "node18",
  async onSuccess() {
    console.log("✓ VS Code extension built successfully");
  },
});
