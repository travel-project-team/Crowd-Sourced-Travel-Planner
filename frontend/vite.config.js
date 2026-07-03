// Vite configuration file

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // API Proxy to connect with backend
    proxy: {
      '/api': 'http://localhost:8000'
    }
  }
})
