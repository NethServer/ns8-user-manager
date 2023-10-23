import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/@nethserver/vue-tailwind-lib/dist/vue-tailwind-lib.es.js'
  ],
  theme: {
    extend: {}
  },
  plugins: []
} satisfies Config
