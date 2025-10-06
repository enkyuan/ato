import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import tanStackRouterVite from '@tanstack/router-plugin/vite'
import { resolve } from 'node:path'
import { nitroV2Plugin } from '@tanstack/nitro-v2-vite-plugin'
import monicon from "@monicon/vite"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    nitroV2Plugin(),
    tanStackRouterVite({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
    monicon({
      collections: ['hugeicons'],
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
