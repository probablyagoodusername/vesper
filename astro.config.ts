import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'

const site = process.env.ASTRO_SITE || 'https://apps.denis.me'
const base = process.env.ASTRO_BASE || '/bible'

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
  },
  prefetch: {
    defaultStrategy: 'viewport',
  },
})
