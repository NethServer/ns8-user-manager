<script lang="ts" setup>
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

interface MenuEntry {
  label: string
  route_name: string
  icon: IconDefinition
}

const entries: Array<MenuEntry> = [
  {
    label: 'account_settings.title',
    route_name: 'user_account',
    icon: faGear
  }
]

defineEmits(['navigate'])
</script>

<template>
  <div class="flex flex-col space-y-2">
    <RouterLink
      @click="$emit('navigate')"
      v-for="entry in entries"
      :key="entry.label"
      :to="{ name: entry.route_name }"
      active-class="active text-gray-900 bg-gray-100 dark:bg-gray-800 dark:text-gray-50"
      class="flex items-center gap-x-4 rounded-md px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-50"
    >
      <span
        class="float-left -ml-4 hidden h-7 basis-1 rounded-r-md bg-blue-700 dark:bg-blue-500"
      ></span>
      <FontAwesomeIcon :icon="entry.icon" class="h-6 w-6" />
      <p class="overflow-hidden text-ellipsis">{{ $t(entry.label) }}</p>
    </RouterLink>
  </div>
</template>

<style scoped>
.active > span {
  @apply inline;
}
</style>
