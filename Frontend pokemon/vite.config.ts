import { defineConfig } from 'vite'

// SPA: onbekende paden zoals /pokemon/25 gaan terug naar index.html.
export default defineConfig({
  appType: 'spa',
})
