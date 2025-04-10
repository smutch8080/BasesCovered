import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

// Custom plugin to handle service worker content type and ensure proper serving
const serviceWorkerContentTypePlugin = (): Plugin => ({
  name: 'service-worker-content-type',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url && (
        req.url.endsWith('service-worker.js') || 
        req.url.endsWith('firebase-messaging-sw.js') ||
        req.url.endsWith('firebase-messaging-sw-loader.js') ||
        req.url.endsWith('service-worker-loader.js')
      )) {
        const filePath = path.join(__dirname, 'public', req.url);
        // Only serve if file exists in public
        if (fs.existsSync(filePath)) {
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
          res.setHeader('Service-Worker-Allowed', '/');
          res.setHeader('Cache-Control', 'no-cache');
          const content = fs.readFileSync(filePath, 'utf-8');
          res.end(content);
          return;
        }
      }
      next();
    });
  }
});

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'service-worker.ts',
      registerType: 'prompt',
      injectRegister: null, // Disable automatic registration
      manifest: {
        name: 'BasesCovered',
        short_name: 'BasesCovered',
        description: 'Simplifying youth sports for coaches, players, and parents.',
        theme_color: '#37543c',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        protocol_handlers: [
          {
            protocol: 'web+basescovered',
            url: '/%s'
          }
        ],
        icons: [
          {
            src: '/icons/icon-72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 3000000,
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [
          /^\/service-worker\.js$/,
          /^\/firebase-messaging-sw\.js$/,
          /^\/firebase-messaging-sw-loader\.js$/,
          /^\/service-worker-loader\.js$/
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: '/index.html'
      }
    }),
    serviceWorkerContentTypePlugin()
  ],
  optimizeDeps: {
    exclude: ['lucide-react']
  },
  envDir: '.',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        format: 'es',
        entryFileNames: 'static/assets/[name]-[hash].js',
        chunkFileNames: 'static/assets/[name]-[hash].js',
        assetFileNames: 'static/assets/[name]-[hash].[ext]'
      }
    },
    sourcemap: true,
    target: 'esnext',
    minify: 'terser',
    assetsDir: 'static/assets',
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: true
  },
  server: {
    fs: {
      allow: ['..']
    },
    headers: {
      'Service-Worker-Allowed': '/',
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tiny.cloud https://*.tinymce.com https://*.googleapis.com https://*.gstatic.com https://apis.google.com https://accounts.google.com https://www.google.com https://www.gstatic.com https://recaptcha.google.com https://recaptcha.net https://*.recaptcha.net",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.tinymce.com https://accounts.google.com https://www.gstatic.com",
        "img-src 'self' data: https://*.googleapis.com https://*.gstatic.com https://images.unsplash.com https://*.tinymce.com https://*.googleusercontent.com",
        "font-src 'self' https://fonts.gstatic.com https://*.tinymce.com",
        "connect-src 'self' https://*.googleapis.com https://api.openai.com https://*.tinymce.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://*.firebasestorage.googleapis.com wss://*.firebaseio.com https://fonts.gstatic.com https://*.gstatic.com https://*.cloudfunctions.net https://us-central1-softball-practice-planner.cloudfunctions.net https://securetoken.googleapis.com https://oauth2.googleapis.com https://www.google.com https://*.google.com https://recaptcha.google.com https://recaptcha.net https://*.recaptcha.net https://*.g.doubleclick.net",
        "frame-src 'self' https://*.tinymce.com https://www.google.com https://identitytoolkit.googleapis.com https://accounts.google.com https://*.firebaseapp.com https://softball-practice-planner.firebaseapp.com https://www.googletagmanager.com https://googleads.g.doubleclick.net https://oauth2.googleapis.com https://securetoken.googleapis.com https://recaptcha.google.com https://*.g.doubleclick.net https://recaptcha.net https://*.recaptcha.net",
        "worker-src 'self'"
      ].join('; ')
    }
  },
  publicDir: 'public',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});