<script lang="ts" setup>
import { useNotificationEngine } from '@/stores/useNotificationEngine'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCheckCircle, faX } from '@fortawesome/free-solid-svg-icons'

const notificationEngine = useNotificationEngine()

notificationEngine.$onAction(({ name, after }) => {
  if (name == 'add') {
    after((id) => {
      setTimeout(() => {
        notificationEngine.remove(id)
      }, 5000)
    })
  }
})
</script>

<template>
  <div class="flex flex-col items-end space-y-4 p-4">
    <div v-for="[id, notification] in notificationEngine.notifications" :key="id">
      <div class="flex items-start gap-x-4 rounded-lg bg-white p-4 shadow-lg dark:bg-gray-800">
        <div
          class="h-10 w-10 shrink-0 rounded-full bg-green-100 py-2.5 text-green-700 dark:bg-green-800 dark:text-green-100"
        >
          <FontAwesomeIcon :icon="faCheckCircle" class="h-full w-full" />
        </div>
        <div class="space-y-1">
          <h3 class="text-sm">{{ $t(notification.title) }}</h3>
          <small class="text-gray-500 dark:text-gray-400">{{ $t(notification.description) }}</small>
        </div>
        <button class="h-3.5 w-3.5 shrink-0" @click="notificationEngine.remove(id)">
          <FontAwesomeIcon :icon="faX" class="h-full w-full" />
        </button>
      </div>
    </div>
  </div>
</template>
