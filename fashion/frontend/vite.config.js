import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/predict': 'http://localhost:8000',
      '/stats': 'http://localhost:8000',
      '/static': 'http://localhost:8000',
      '/recommendations': 'http://localhost:8000'
    }
  }
})
