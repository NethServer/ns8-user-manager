import axios from 'axios'
import { ref } from 'vue'

export interface Group {
  description: string
  group: string
  users: Array<string>
}

interface ListGroupsResponse {
  groups: Array<Group>
}

export function useGroups() {
  const error = ref<Error>()
  const loading = ref(true)
  const data = ref<ListGroupsResponse>()

  function fetch() {
    axios
      .post<ListGroupsResponse>('/api/list-groups', {})
      .then((response) => {
        data.value = response.data
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
