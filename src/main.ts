import '@fontsource/poppins'
import './assets/main.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

import axios, { AxiosError } from 'axios'
import { createI18n } from 'vue-i18n'
import enJson from './i18n/en-US.json'
import itJson from './i18n/it-IT.json'

import { config } from '@fortawesome/fontawesome-svg-core'
config.autoAddCss = false

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(
  createI18n({
    legacy: false,
    locale: navigator.language,
    fallbackLocale: 'en-US',
    messages: {
      'en-US': enJson,
      'it-IT': itJson
    }
  })
)

// setup axios
axios.defaults.baseURL = import.meta.env.VITE_ENDPOINT ?? './'
axios.defaults.timeout = 5000

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
      if (exception.response) {
        switch (exception.response.status) {
          case 401:
            exception.message = 'errors.unauthorized'
            break
          case 403:
            exception.message = 'errors.forbidden'
            break
          case 404:
            exception.message = 'errors.not_found'
            break
          case 500:
            exception.message = 'errors.internal_server_error'
            break
          case 503:
            exception.message = 'errors.service_unavailable'
            break
        }
      } else {
        switch (exception.code) {
          case AxiosError.ECONNABORTED:
            exception.message = 'errors.connection_aborted'
            break
          case AxiosError.ERR_NETWORK:
            exception.message = 'errors.network'
            break
          case AxiosError.ERR_BAD_REQUEST:
            exception.message = 'errors.bad_request'
            break
          case AxiosError.ERR_BAD_RESPONSE:
            exception.message = 'errors.bad_response'
            break
        }
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
