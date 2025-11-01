// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],

  // Hybrid rendering: ISR cho pages, SSR cho API
  routeRules: {
    // Pages: Pre-rendered (static)
    '/': { prerender: true },
    '/login': { prerender: true },
    '/register': { prerender: true },
    '/profile': { prerender: true },
    '/history': { prerender: true },
    '/change-password': { prerender: true },
    '/ranking': { prerender: true },
    '/add': { prerender: true },

    // API routes: Server-side (dynamic)
    '/api/**': { prerender: false },
  },

  // Nitro config cho Vercel
  nitro: {
    preset: 'vercel'
  },

  // Runtime config
  runtimeConfig: {
    // Private keys (only available on server-side)
    tursoUrl: process.env.TURSO_DATABASE_URL || '',
    tursoAuthToken: process.env.TURSO_AUTH_TOKEN || '',
    jwtSecret: process.env.JWT_SECRET || 'default-secret-key',
    
    // Public keys that are exposed to client-side
    public: {
      apiBase: process.env.API_BASE || '/api'
    }
  }
})
