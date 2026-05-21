import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "^/api/courses/.+/threads.*": {
        target: "http://localhost:9094",
        changeOrigin: true,
      },
      "/api/auth": {
        target: "http://localhost:9098",
        changeOrigin: true,
      },
      "/api/courses": {
        target: "http://localhost:9091",
        changeOrigin: true,
      },
      "/api/categories": {
        target: "http://localhost:9091",
        changeOrigin: true,
      },
      "/api/enrollments": {
        target: "http://localhost:9092",
        changeOrigin: true,
      },
      "/api/progress": {
        target: "http://localhost:9093",
        changeOrigin: true,
      },
      "/api/certificates": {
        target: "http://localhost:9099",
        changeOrigin: true,
      },
      "/api/admin": {
        target: "http://localhost:9095",
        changeOrigin: true,
      },
      "/notifications": {
        target: "http://localhost:9094",
        changeOrigin: true,
      },
      "/discussion": {
        target: "http://localhost:9094",
        changeOrigin: true,
      },
      "/api/threads": {
        target: "http://localhost:9094",
        changeOrigin: true,
      },
      "/api/replies": {
        target: "http://localhost:9094",
        changeOrigin: true,
      },
    },
  },
})
