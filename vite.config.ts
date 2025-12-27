/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  plugins: [UnoCSS()],
  test: {
    coverage: {
      provider: 'v8'
    },
    include: ['src/**/*.test.ts']
  }
})
