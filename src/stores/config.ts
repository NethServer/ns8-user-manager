import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

interface ConfigResponse {
  domain?: string
}

export const useConfig = defineStore('config', () => {
  const domainName = ref<string>()

  axios.get<ConfigResponse>('/config.json').then(({ data }) => (domainName.value = data.domain))

  return { domainName }
})
