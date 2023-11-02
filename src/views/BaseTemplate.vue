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
import { NeButton } from '@nethserver/vue-tailwind-lib'

const { logout, uid } = useAuth()

const router = useRouter()

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
  <div class="min-w-screen flex min-h-screen">
    <!-- Side bar -->
    <div class="side-bar" ref="sidebarRef">
      <div>
        <NeButton class="absolute right-4 top-4 h-8 w-8 md:hidden" @click="toggleSidebar">
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
        <SidebarMenu />
      </div>
    </div>
    <div class="side-bar-overlay" @click="toggleSidebar()"></div>
    <!-- Main content -->
    <div class="flex grow flex-col">
      <!-- Header -->
      <div
        class="flex h-16 min-w-full items-center gap-x-2 border-b border-gray-300 bg-white pr-4 dark:border-gray-800 dark:bg-gray-950"
      >
        <button class="aspect-square self-stretch px-4 py-4 md:hidden" @click="toggleSidebar()">
          <FontAwesomeIcon :icon="faBars" class="h-full w-full" />
        </button>
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

<style scoped>
.side-bar {
  @apply hidden w-full flex-col gap-y-8 border-r border-gray-300 bg-white px-2 py-8 dark:border-gray-800 dark:bg-gray-950 sm:w-80 md:flex;
}

.side-bar.active {
  @apply absolute bottom-0 left-0 top-0 z-20 flex md:relative md:z-auto;
}

.side-bar-overlay {
  @apply absolute bottom-0 left-0 right-0 top-0 z-10 hidden bg-gray-800 opacity-70;
}

.side-bar.active + .side-bar-overlay {
  @apply sm:block md:hidden;
}
</style>
