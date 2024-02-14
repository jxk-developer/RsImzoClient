import { resolve } from 'pathe'
import { defineConfig } from 'vitest/config'
import dts from 'vite-plugin-dts';

export default defineConfig({
  resolve: { alias: { src: resolve('src/') } },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'RsImzo',
      formats: ['iife', 'cjs', 'es', 'umd']
    },
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
  },
  plugins: [dts()]
})