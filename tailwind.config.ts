import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'
import defaultTheme from 'tailwindcss/defaultTheme'
import tailwindConfig from '@nethesis/vue-components/tailwind.config'

export default {
  presets: [tailwindConfig],
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
