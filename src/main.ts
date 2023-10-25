import './assets/main.css'
import '@fontsource/poppins'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { createI18n } from 'vue-i18n'
import enJson from './i18n/en-US.json'
import itJson from './i18n/it-IT.json'
import axios, { AxiosError } from 'axios'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(
  createI18n({
    locale: navigator.language,
    fallbackLocale: 'en-US',
    messages: {
      'en-US': enJson,
      'it-IT': itJson
    }
  })
)

// setup axios
axios.defaults.baseURL = import.meta.env.VITE_ENDPOINT ?? ''
axios.defaults.timeout = 500

axios.interceptors.request.use((config) => {
  if (localStorage.getItem('token') != null) {
    config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`
  }
  return config
})

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const exception = error as AxiosError
      switch (exception.code) {
        case AxiosError.ECONNABORTED:
          exception.message = 'errors.connection_aborted'
          break
        case AxiosError.ERR_NETWORK:
          exception.message = 'errors.network'
          break
      }
      return Promise.reject(exception)
    }
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const exception = error as AxiosError
      if (exception.code == AxiosError.ERR_BAD_REQUEST && exception.response?.status == 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('expire')
        router.replace('/login')
      }
      return Promise.reject(exception)
    }
    return Promise.reject(error)
  }
)

app.mount('#app')
