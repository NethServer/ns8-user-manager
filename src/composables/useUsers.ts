import { computed, ref } from 'vue'
import axios from 'axios'
import type { NeComboboxOption } from '@nethesis/vue-components'

export interface User {
  display_name: string
  locked: boolean
  user: string
  mail: string
  password_expiration: number
  expired: boolean
}

interface UserListResponse {
  users: Array<User>
}

export function useUsers() {
  const loading = ref(true)
  const error = ref<Error>()
  const data = ref<Array<User>>([])

  function fetch() {
    axios
      .post<UserListResponse>('/api/list-users', {})
      .then((response) => {
        data.value = response.data.users
      })
      .catch((reason) => {
        error.value = reason
      })
      .finally(() => {
        loading.value = false
      })
  }

  fetch()

  const comboboxChoices = computed((): Array<NeComboboxOption> => {
    return data.value.map((user): NeComboboxOption => {
      let label = user.user
      if (user.display_name != '') {
        label += ' (' + user.display_name + ')'
      }
      return {
        label: label,
        id: user.user
      }
    })
  })

  return { data, error, loading, fetch, comboboxChoices }
}
