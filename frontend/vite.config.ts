import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', '@mui/material', 'framer-motion'],
          utils: ['date-fns', 'axios'],
          'framer-motion': ['framer-motion']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['framer-motion']
  }
})
