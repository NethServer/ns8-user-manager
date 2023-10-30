<script lang="ts" setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCircleUser } from '@fortawesome/free-solid-svg-icons/faCircleUser'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons/faAngleDown'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'

import { useAuth } from '@/composables/useAuth'
import router from '@/router'
import SidebarMenu from '@/components/SidebarMenu.vue'

const { logout } = useAuth()

function handleLogout() {
  logout()
  router.replace({ name: 'login' })
}
</script>

<template>
  <div class="min-w-screen flex min-h-screen bg-white dark:bg-gray-950">
    <div
      class="hidden w-80 flex-col gap-y-8 border-r border-gray-300 px-2 py-8 dark:border-gray-800 sm:flex"
    >
      <div>
        <div class="mb-8 flex flex-col items-center justify-center gap-y-1">
          <FontAwesomeIcon
            :icon="faCircleUser"
            class="h-24 w-24 text-gray-700 dark:text-gray-200"
          />
          <div class="text-center">
            <p class="font-medium">Placeholder</p>
          </div>
        </div>
        <SidebarMenu />
      </div>
    </div>
    <div class="flex grow flex-col">
      <div
        class="flex h-16 min-w-full items-center gap-x-2 border-b border-gray-300 px-4 dark:border-gray-800"
      >
        <div class="ml-auto flex items-center text-gray-700 dark:text-gray-200">
          <div class="mr-2 h-8 w-8">
            <FontAwesomeIcon :icon="faCircleUser" class="h-full w-full" />
          </div>
          <Menu as="div" class="relative">
            <MenuButton>
              <FontAwesomeIcon :icon="faAngleDown" />
            </MenuButton>
            <MenuItems
              class="absolute right-0 top-10 w-32 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700"
            >
              <MenuItem>
                <button
                  class="flex w-full px-6 py-2 text-gray-900 hover:bg-gray-100 dark:text-gray-50 dark:hover:bg-gray-700"
                  @click="handleLogout()"
                >
                  {{ $t('base_template.logout') }}
                </button>
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>
      </div>
      <main class="grow bg-gray-50 p-6 dark:bg-gray-900">
        <RouterView />
      </main>
    </div>
  </div>
</template>
