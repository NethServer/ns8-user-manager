<script lang="ts" setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCircleUser } from '@fortawesome/free-solid-svg-icons/faCircleUser'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons/faAngleDown'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { useAuth } from '@/composables/useAuth'
import SidebarMenu from '@/components/SidebarMenu.vue'
import { useRouter } from 'vue-router'
import { faBars, faXmark } from '@fortawesome/free-solid-svg-icons'
import { ref } from 'vue'
import { NeButton } from '@nethesis/vue-components'
import NotificationHandler from '@/components/NotificationHandler.vue'
import { useConfig } from '@/stores/config'

const { logout, uid } = useAuth()

const router = useRouter()
const config = useConfig()

const sidebarRef = ref<HTMLElement | null>(null)

function toggleSidebar() {
  sidebarRef.value?.classList.toggle('active')
}

function handleLogout() {
  logout()
  router.replace({ name: 'login' })
}
</script>

<template>
  <div class="flex min-h-screen min-w-screen">
    <!-- Side bar -->
    <div ref="sidebarRef" class="side-bar">
      <div>
        <NeButton class="sidebar:hidden absolute top-4 right-4 h-8 w-8" @click="toggleSidebar">
          <FontAwesomeIcon :icon="faXmark" class="h-full w-full text-gray-900 dark:text-gray-50" />
        </NeButton>
        <div class="mb-8 flex flex-col items-center justify-center gap-y-2">
          <FontAwesomeIcon
            :icon="faCircleUser"
            class="h-24 w-24 text-gray-700 dark:text-gray-200"
          />
          <div class="text-center">
            <p class="font-medium">{{ uid }}</p>
          </div>
        </div>
        <SidebarMenu @navigate="toggleSidebar()" />
      </div>
    </div>
    <div class="side-bar-overlay" @click="toggleSidebar()"></div>
    <!-- Main content -->
    <div class="flex min-w-0 grow flex-col">
      <!-- Header -->
      <div
        class="flex h-16 min-w-full items-center gap-x-2 border-b border-gray-300 bg-white pr-4 dark:border-gray-800 dark:bg-gray-950"
      >
        <button
          class="sidebar:hidden aspect-square self-stretch px-4 py-4"
          @click="toggleSidebar()"
        >
          <FontAwesomeIcon :icon="faBars" class="h-full w-full" />
        </button>

        <div class="ml-auto flex items-center text-gray-700 dark:text-gray-200">
          <p v-if="config.domainName" class="pr-6 text-sm">{{ config.domainName }}</p>
          <div class="mr-2 h-8 w-8">
            <FontAwesomeIcon :icon="faCircleUser" class="h-full w-full" />
          </div>
          <Menu as="div" class="relative">
            <MenuButton>
              <FontAwesomeIcon :icon="faAngleDown" />
            </MenuButton>
            <MenuItems
              class="absolute top-10 right-0 z-10 w-32 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700"
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
      <main class="relative grow bg-gray-50 p-6 dark:bg-gray-900">
        <!-- Notification handler -->
        <div class="sticky top-0 z-20">
          <div class="absolute top-0 right-0 max-w-lg">
            <NotificationHandler />
          </div>
        </div>
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/main.css";

.side-bar {
  @apply sidebar:flex hidden w-full shrink-0 flex-col gap-y-8 border-r border-gray-300 bg-white px-2 py-8 sm:w-80 dark:border-gray-800 dark:bg-gray-950;
}

.side-bar.active {
  @apply sidebar:relative sidebar:z-auto absolute top-0 bottom-0 left-0 z-20 flex;
}

.side-bar-overlay {
  @apply absolute top-0 right-0 bottom-0 left-0 z-10 hidden bg-gray-800 opacity-70;
}

.side-bar.active + .side-bar-overlay {
  @apply sidebar:hidden sm:block;
}
</style>
