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
    // Middleware to set correct MIME type for service worker files
    server.middlewares.use((req, res, next) => {
      if (req.url && (
        req.url.includes('service-worker.js') || 
        req.url.includes('firebase-messaging-sw.js') ||
        req.url.includes('firebase-messaging-sw-loader.js') ||
        req.url.includes('service-worker-loader.js') ||
        req.url.endsWith('.js')
      )) {
        // Always set the correct content type for service worker files
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        
        if (req.url.includes('service-worker') || req.url.includes('firebase-messaging')) {
          res.setHeader('Service-Worker-Allowed', '/');
        }
        
        // Log the request for debugging
        console.log(`JavaScript file requested: ${req.url}`);
      }
      next();
    });
  },
  
  // Copy service worker files to the build output to ensure they're included
  closeBundle() {
    const publicDir = path.resolve(__dirname, 'public');
    const distDir = path.resolve(__dirname, 'dist');
    
    // List of service worker files to ensure they're properly copied
    const swFiles = [
      'firebase-messaging-sw.js',
      'firebase-messaging-sw-loader.js',
      'service-worker-loader.js'
    ];
    
    for (const file of swFiles) {
      const sourcePath = path.join(publicDir, file);
      const destPath = path.join(distDir, file);
      
      if (fs.existsSync(sourcePath)) {
        try {
          const content = fs.readFileSync(sourcePath, 'utf-8');
          fs.writeFileSync(destPath, content, 'utf-8');
          console.log(`Copied ${file} to dist directory`);
        } catch (err) {
          console.error(`Error copying ${file}:`, err);
        }
      } else {
        console.warn(`Service worker file not found: ${sourcePath}`);
      }
    }
  }
});

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'service-worker.ts',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 3000000,
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: '/index.html',
        navigateFallbackAllowlist: [/^(?!\/__).*/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets'
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false,
      },
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
      }
    }),
    serviceWorkerContentTypePlugin() // Add our custom plugin
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
        "img-src 'self' data: https://*.googleapis.com https://*.gstatic.com https://images.unsplash.com https://*.tinymce.com https://*.googleusercontent.com https://*.github.io",
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