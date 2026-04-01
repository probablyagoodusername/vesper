import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'

const site = process.env.ASTRO_SITE || 'https://vesper.pm'
const base = process.env.ASTRO_BASE || '/'

export default defineConfig({
  site,
  base,
  output: 'static',
  integrations: [
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ['onnxruntime-node'],
    },
    server: {
      allowedHosts: ['apps.denis.me'],
    },
    preview: {
      allowedHosts: ['apps.denis.me'],
    },
  },
  prefetch: {
    defaultStrategy: 'viewport',
  },
})
