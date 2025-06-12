<script lang="ts" setup>
import SidebarLink from '@/components/SidebarLink.vue'
import { useAuth } from '@/composables/useAuth'
import { faGear, faUserFriends } from '@fortawesome/free-solid-svg-icons'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const { scopes } = useAuth()

defineEmits(['navigate'])
</script>

<template>
  <div class="flex flex-col space-y-2">
    <SidebarLink
      :icon="faGear"
      :label="t('account_settings.title')"
      :to="{ name: 'user_account' }"
      @navigate="$emit('navigate')"
    />
    <SidebarLink
      v-if="scopes.length == 0"
      :icon="faUserFriends"
      :label="t('user_manager.title')"
      :to="{ name: 'user_manager' }"
      @navigate="$emit('navigate')"
    />
  </div>
</template>
