import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import {
  pwaManifest,
  pwaRuntimeCaching,
  pwaStaticAssetIgnores,
  pwaStaticAssetPatterns,
} from './src/pwa/cachePolicy'

// keep local dev at root while production builds target GitHub Pages repo path
// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const base = command === 'build' ? '/plate-atlas/' : '/'

  return {
    base,
    plugins: [
      vue(),
      vueDevTools(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: pwaManifest,
        workbox: {
          cleanupOutdatedCaches: true,
          globIgnores: pwaStaticAssetIgnores,
          globPatterns: pwaStaticAssetPatterns,
          navigateFallback: `${base}index.html`,
          runtimeCaching: pwaRuntimeCaching,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
