import type { ManifestOptions } from 'vite-plugin-pwa'
import type { RuntimeCaching } from 'workbox-build'

const imageCacheMaxAgeSeconds = 60 * 60 * 24 * 30

export const pwaStaticAssetPatterns: string[] = [
  '**/*.{js,css,html,ico,png,svg,webmanifest,woff,woff2,ttf}',
  // precache overview flags because they are core list context
  'images/overview/**/*',
]

export const pwaStaticAssetIgnores: string[] = [
  // keep plate images out of the install-time cache
  'images/detail/**/*',
]

export const pwaRuntimeCaching: RuntimeCaching[] = [
  {
    urlPattern: ({ url }: { url: URL }) => {
      return url.pathname.includes('/images/detail/')
    },
    // runtime-cache plate images so mobile installs do not download the full photo library
    handler: 'CacheFirst',
    options: {
      cacheName: 'plate-atlas-detail-images',
      expiration: {
        maxEntries: 320,
        maxAgeSeconds: imageCacheMaxAgeSeconds,
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },
]

export const pwaManifest: Partial<ManifestOptions> = {
  name: 'Plate Atlas',
  short_name: 'Plate Atlas',
  description: 'A mobile-friendly atlas of international vehicle registration plates',
  theme_color: '#17131b',
  background_color: '#17131b',
  display: 'standalone',
  orientation: 'portrait-primary',
  scope: '/plate-atlas/',
  start_url: '/plate-atlas/overview',
  icons: [
    {
      src: '/plate-atlas/favicon.svg',
      sizes: 'any',
      type: 'image/svg+xml',
      purpose: 'any maskable',
    },
  ],
}
