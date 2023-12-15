import { ref } from 'vue'
import axios from 'axios'

interface User {
  display_name: string
  locked: boolean
  user: string
}

interface UserListResponse {
  users: Array<User>
}

export function useUsers() {
  const loading = ref(true)
  const error = ref<Error>()
  const data = ref<Array<User>>()

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

  return { data, error, loading, fetch }
}
