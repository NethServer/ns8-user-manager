import axios from 'axios'
import { defineStore } from 'pinia'
import { ref } from 'vue'

interface ConfigResponse {
  domain?: string
  services?: string[]
  schema?: 'ad' | 'rfc2307'
}

export const useConfig = defineStore('config', () => {
  const domainName = ref<string>()
  const services = ref<Array<string>>()
  const schema = ref<'ad' | 'rfc2307'>()

  axios.get<ConfigResponse>('/config.json').then(({ data }) => {
    domainName.value = data.domain
    services.value = data.services
    schema.value = data.schema
  })

  return { domainName, services, schema }
})
