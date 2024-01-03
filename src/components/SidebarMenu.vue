<script lang="ts" setup>
import { faGear, faUserFriends } from '@fortawesome/free-solid-svg-icons'
import SidebarLink from '@/components/SidebarLink.vue'
import { useAuth } from '@/composables/useAuth'

const { scopes } = useAuth()

defineEmits(['navigate'])
</script>

<template>
  <div class="flex flex-col space-y-2" @navigate="$emit('navigate')">
    <SidebarLink
      :icon="faGear"
      :label="$t('account_settings.title')"
      :to="{ name: 'user_account' }"
    />
    <SidebarLink
      v-if="scopes.length == 0"
      :icon="faUserFriends"
      :label="$t('user_manager.title')"
      :to="{ name: 'user_manager' }"
    />
  </div>
</template>
