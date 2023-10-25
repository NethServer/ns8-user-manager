import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'

export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/@nethserver/vue-tailwind-lib/dist/vue-tailwind-lib.es.js'
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.blue
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif']
      },
      animation: {
        'spin-fast': 'spin 0.5s linear infinite'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
} satisfies Config
