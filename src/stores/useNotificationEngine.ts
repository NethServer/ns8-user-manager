import { defineStore } from 'pinia'
import { ref } from 'vue'

type NotificationType = 'success'

interface Notification {
  type: NotificationType
  title: string
  description: string
}

export const useNotificationEngine = defineStore('notifications', () => {
  const notifications = ref(new Map<number, Notification>())
  const id = ref(0)

  /**
   * Add a new notification, returns the id of the notification
   * @param type
   * @param title
   * @param description
   */
  function add(type: NotificationType, title: string, description: string): number {
    id.value++
    notifications.value.set(id.value, { type, title, description })
    return id.value
  }

  /**
   * Remove a notification by id
   * @param id
   */
  function remove(id: number) {
    notifications.value.delete(id)
  }

  return { notifications, add, remove }
})
