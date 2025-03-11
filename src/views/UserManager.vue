<script lang="ts" setup>
import { NeTabs } from '@nethesis/vue-components'
import { ref } from 'vue'
import ContentPage from '@/components/ContentPage.vue'
import GroupsList from '@/components/GroupsList.vue'
import UserList from '@/components/UserList.vue'

const selectedTab = ref('users')
</script>

<template>
  <ContentPage :title="$t('user_manager.title')" class="max-w-full">
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
      <div v-if="selectedTab == 'users'">
        <UserList />
      </div>
      <div v-if="selectedTab == 'groups'">
        <GroupsList />
      </div>
    </template>
  </ContentPage>
</template>
