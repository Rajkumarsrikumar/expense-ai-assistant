import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'

// Power Apps SDK expects port 3000 by default
export default defineConfig({
  base: './',
  server: {
    host: '::',
    port: 3000,
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
