import axios from 'axios'
import { ref } from 'vue'

interface Group {
  description: string
  group: string
}

interface ListGroupsResponse {
  groups: Array<Group>
}

export function useGroups() {
  const error = ref<Error>()
  const loading = ref(true)
  const data = ref<ListGroupsResponse>()

  async function fetch() {
    try {
      data.value = (await axios.post<ListGroupsResponse>('/api/list-groups', {})).data
    } catch (reason: any) {
      error.value = reason
      console.log(reason)
    } finally {
      loading.value = false
    }
  }

  return { data, error, loading, fetch }
}
