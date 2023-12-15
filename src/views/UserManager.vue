<script lang="ts" setup>
import { NeButton, NeSkeleton, NeTabs, NeTextInput } from '@nethserver/vue-tailwind-lib'
import { NeInlineNotification } from '@nethesis/vue-components'
import { onMounted, ref } from 'vue'
import ContentPage from '@/components/ContentPage.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
import GroupsList from '@/components/GroupsList.vue'

interface User {
  display_name: string
  locked: boolean
  user: string
}

interface UserListResponse {
  users: Array<User>
}

const selectedTab = ref('users')
const fetchError = ref<Error>()
const loading = ref(false)

const create = ref(false)

const data = ref<UserListResponse>()

async function fetch() {
  try {
    await axios.post<UserListResponse>('/api/list-users', {}).then((response) => {
      data.value = response.data
    })
  } catch (error: any) {
    fetchError.value = error
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loading.value = true
  fetch()
})
</script>

<template>
  <ContentPage :title="$t('user_manager.title')" class="max-w-7xl">
    <template #divider>
      <NeTabs
        :tabs="[
          {
            name: 'users',
            label: $t('user_manager.tabs.users')
          },
          {
            name: 'groups',
            label: $t('user_manager.tabs.groups')
          }
        ]"
        class="!mt-4"
        @select-tab="selectedTab = $event"
      />
    </template>
    <template #default>
      <div v-if="selectedTab == 'users'" class="space-y-6">
        <div class="flex flex-col gap-y-4 sm:flex-row">
          <NeButton class="sm:order-2 sm:ml-auto" @click="create = true">
            <template #prefix>
              <FontAwesomeIcon :icon="faPlusCircle" />
            </template>
            {{ $t('user_manager.add_user') }}
          </NeButton>
          <NeTextInput :placeholder="$t('user_manager.search_user')" class="sm:order-1" />
        </div>
        <NeInlineNotification
          v-if="fetchError"
          :description="fetchError.message"
          :title="$t('errors.generic')"
          kind="error"
        />
        <NeSkeleton v-if="loading" :lines="10" />
        <ol v-else>
          <li v-for="(user, index) in data?.users" :key="index">{{ user.display_name }}</li>
        </ol>
      </div>
      <div v-if="selectedTab == 'groups'">
        <GroupsList />
      </div>
    </template>
  </ContentPage>
</template>
