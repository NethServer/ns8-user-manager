import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

interface ConfigResponse {
  domain?: string
  services?: string[]
}

export const useConfig = defineStore('config', () => {
  const domainName = ref<string>()
  const services = ref<Array<string>>()

  axios.get<ConfigResponse>('/config.json').then(({ data }) => {
    domainName.value = data.domain
    services.value = data.services
  })

  return { domainName, services }
})
