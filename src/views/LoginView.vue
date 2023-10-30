<script lang="ts" setup>
import {
  NeButton,
  NeCheckbox,
  NeInlineNotification,
  NeTextInput
} from '@nethserver/vue-tailwind-lib'
import { onBeforeMount, ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import router from '@/router'
import axios from 'axios'

const { previouslyLogged, login } = useAuth()

const username = ref('')
const password = ref('')

const loading = ref(false)
const errorMessage = ref<string>()
const validationMessage = ref<string>()

onBeforeMount(() => {
  if (previouslyLogged.value) {
    router.replace({ name: 'user_account' })
  }
})

async function handleLogin() {
  if (!loading.value) {
    errorMessage.value = undefined
    validationMessage.value = undefined
    loading.value = true
    try {
      await login(username.value, password.value)
      await router.replace({ name: 'user_account' })
    } catch (exception: any) {
      if (axios.isAxiosError(exception) && exception.response != undefined) {
        if (exception.response.status == 401) {
          validationMessage.value = 'login_form.invalid_credentials'
        }
      } else {
        errorMessage.value = exception.message
      }
    } finally {
      loading.value = false
    }
  }
}
</script>

<template>
  <div
    class="min-w-screen flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-500 to-blue-950 p-4 dark:from-blue-900 dark:to-gray-950 lg:items-start lg:pl-[10%]"
  >
    <form
      class="w-full space-y-6 rounded-xl bg-gray-50 px-8 py-14 shadow-md dark:bg-gray-900 sm:max-w-lg"
      @submit.prevent="handleLogin()"
    >
      <div>
        <img alt="NethServer 8 logo" class="hidden dark:block" src="@/assets/nethserver.svg" />
        <img alt="NethServer 8 logo" class="dark:hidden" src="@/assets/nethserver-dark.svg" />
      </div>
      <div class="space-y-4">
        <div>
          <p class="text-xl">{{ $t('login_form.welcome') }}</p>
          <p class="text-sm font-normal">{{ $t('login_form.sign_in_description') }}</p>
        </div>
        <NeInlineNotification v-if="errorMessage" :title="$t(errorMessage)" kind="error" />
        <NeTextInput
          v-model="username"
          :invalid-message="validationMessage != undefined ? $t(validationMessage) : ''"
          :label="$t('login_form.username')"
          required
          autofocus
        />
        <NeTextInput v-model="password" :label="$t('login_form.password')" is-password required />
        <NeCheckbox :label="$t('login_form.remember_me')" />
      </div>
      <NeButton :disabled="loading" :loading="loading" class="w-full" kind="primary" type="submit">
        {{ $t('login_form.sign_in') }}
      </NeButton>
    </form>
  </div>
</template>
