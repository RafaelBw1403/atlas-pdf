import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import commonjs from "vite-plugin-commonjs";


// https://vite.dev/config/
export default defineConfig({
  build: {
  },
  envDir: '../',
  plugins: [react(), commonjs()],
  server: {
    port: 5174,
    strictPort: true, // Optional: if true, Vite will exit if 5174 is already in use instead of automatically trying 5175
  }
})
