<script lang="ts" setup>
import { NeButton, NeCheckbox, NeTextInput } from '@nethserver/vue-tailwind-lib'
</script>

<template>
  <div
    class="min-w-screen flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-500 to-blue-950 p-4 dark:from-blue-900 dark:to-gray-950 lg:items-start lg:pl-[10%]"
  >
    <div
      class="w-full space-y-4 rounded-xl bg-gray-50 px-8 py-14 shadow-md dark:bg-gray-900 sm:max-w-lg"
    >
      <div>
        <img alt="NethServer 8 logo" class="hidden dark:block" src="@/assets/nethserver.svg" />
        <img alt="NethServer 8 logo" class="dark:hidden" src="@/assets/nethserver-dark.svg" />
      </div>
      <div>
        <p class="text-xl">Welcome</p>
        <p class="text-sm font-normal">Sign in to access your account settings</p>
      </div>
      <NeTextInput label="Username" />
      <NeTextInput is-password label="Password" />
      <NeCheckbox label="Remember me" />
      <NeButton kind="primary" class="w-full">Sign In</NeButton>
    </div>
  </div>
</template>
