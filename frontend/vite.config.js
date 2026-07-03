// Vite configuration file

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 9000,
    // Proxy to forward frontend API requests to backend Python server
    proxy: {
      '/api': 'http://localhost:8000'
    }
  }
})
