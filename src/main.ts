import './assets/main.css'
import '@fontsource/poppins'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { createI18n } from 'vue-i18n'
import enJson from './i18n/en-US.json'
import itJson from './i18n/it-IT.json'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(
  createI18n({
    locale: navigator.language,
    fallbackLocale: 'en',
    messages: {
      en: enJson,
      it: itJson
    }
  })
)

app.mount('#app')
