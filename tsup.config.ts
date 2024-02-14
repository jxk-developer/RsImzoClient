import { defineConfig } from "tsup";

export default defineConfig({
  entryPoints: ["src/index.ts"],
  format: ["cjs", "esm", "iife"],
  dts: true,
  shims: true,
  skipNodeModulesBundle: true,
  clean: true,
  globalName: 'RsImzo',
  minify: true,
  sourcemap: true
})