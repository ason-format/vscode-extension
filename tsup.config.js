import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/extension.ts"],
  format: ["cjs"],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  treeshake: false,
  outDir: "dist",
  external: ["vscode"],
  noExternal: ["@ason-format/ason"],
  platform: "node",
  target: "node18",
  async onSuccess() {
    console.log("✓ VS Code extension built successfully");
  },
});
