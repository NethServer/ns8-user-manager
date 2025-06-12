<script lang="ts" setup>
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import type { RouterLinkProps } from 'vue-router'

defineProps<{
  to: RouterLinkProps['to']
  label: string
  icon: IconDefinition
}>()

defineEmits<{
  navigate: []
}>()
</script>

<template>
  <RouterLink
    :to="to"
    active-class="group active text-gray-900 bg-gray-100 dark:bg-gray-800 dark:text-gray-50"
    class="flex items-center gap-x-4 rounded-md px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-50"
    @click="$emit('navigate')"
  >
    <span
      class="float-left -ml-4 hidden h-7 basis-1 rounded-r-md bg-blue-700 group-[.active]:inline dark:bg-blue-500"
    ></span>
    <FontAwesomeIcon :icon="icon" class="h-6 w-6" />
    <p class="overflow-hidden text-ellipsis">{{ label }}</p>
  </RouterLink>
</template>
