import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  presets: [require('@nethesis/vue-components/tailwind.config.ts')],
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/@nethesis/vue-components/dist/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.blue
      },
      screens: {
        ...defaultTheme.screens,
        sidebar: defaultTheme.screens.lg
      }
    }
  },
  darkMode: 'media'
} satisfies Config
