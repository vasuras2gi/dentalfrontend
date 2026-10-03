import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // App apne aap background mein update ho jayegi
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Surjeet Clinic Smart Portal',
        short_name: 'Surjeet Clinic',
        description: 'Premium Queue Management & ERP System',
        theme_color: '#0f766e', // Teal-700 (Brand color)
        background_color: '#ffffff',
        display: 'standalone', // Ye browser UI (URL bar) hide kar dega aur App jaisa feel dega
        orientation: 'portrait',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // Android par icon shape ke hisab se adjust ho jayega
          }
        ]
      }
    })
  ]
});



// import react from '@vitejs/plugin-react'
// import { defineConfig } from 'vite'
// import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(),tailwindcss()],
// })
