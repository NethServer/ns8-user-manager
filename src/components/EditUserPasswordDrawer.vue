<script lang="ts" setup>
import type { User } from '@/composables/useUsers'
import { ref, watch } from 'vue'
import SideDrawer from '@/components/SideDrawer.vue'
import { NeButton, NeTextInput } from '@nethserver/vue-tailwind-lib'
import { MessageBag } from '@/lib/validation'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import type { BaseResponse } from '@/lib/axiosHelpers'
import { NeInlineNotification } from '@nethesis/vue-components'

const minimumPasswordLength = 8
const minimumUppercaseCharacters = 1
const minimumLowercaseCharacters = 1
const minimumNumberCharacters = 1
const minimumSpecialCharacters = 1

const { t } = useI18n()

const props = defineProps<{
  user?: User
}>()

const emit = defineEmits(['success', 'cancel'])

const username = ref('')
const password = ref('')
const confirmPassword = ref('')

const loading = ref(false)
const error = ref<Error>()
const validationErrors = ref(new MessageBag())

watch(
  () => props.user,
  () => {
    if (props.user) {
      username.value = props.user.user
      password.value = ''
      confirmPassword.value = ''
    }
  },
  { immediate: true }
)

function handleCancel() {
  if (!loading.value) {
    emit('cancel')
  }
}

function validate(): boolean {
  // TODO: merge password logic between components
  validationErrors.value.clear()
  if (password.value != confirmPassword.value) {
    validationErrors.value.append('confirm_password', t('account_settings.passwords_mismatch'))
  }
  if (password.value.length < minimumPasswordLength) {
    validationErrors.value.append(
      'password',
      t('account_settings.password_length', minimumPasswordLength)
    )
  }
  if (!password.value.match(`(?=(?:.*[A-Z]){${minimumUppercaseCharacters},})`)) {
    validationErrors.value.append(
      'password',
      t('account_settings.password_uppercase', minimumUppercaseCharacters)
    )
  }
  if (!password.value.match(`(?=(?:.*[a-z]){${minimumLowercaseCharacters},})`)) {
    validationErrors.value.append(
      'password',
      t('account_settings.password_lowercase', minimumLowercaseCharacters)
    )
  }
  if (!password.value.match(`(?=(?:.*[0-9]){${minimumNumberCharacters},})`)) {
    validationErrors.value.append(
      'password',
      t('account_settings.password_number', minimumNumberCharacters)
    )
  }
  if (!password.value.match(`(?=(?:.*[^A-Za-z0-9]){${minimumSpecialCharacters},})`)) {
    validationErrors.value.append(
      'password',
      t('account_settings.password_special', minimumSpecialCharacters)
    )
  }
  return validationErrors.value.size < 1
}

function submit() {
  if (validate()) {
    loading.value = true
    error.value = undefined
    axios
      .post<BaseResponse>('/api/alter-user', {
        user: props.user!.user,
        password: password.value
      })
      .then((response) => {
        if (response.data.status == 'success') {
          emit('success')
        } else {
          switch (response.data.message) {
            case 'error_password_complexity':
              validationErrors.value.append('password', t('account_settings.password_complexity'))
              break
            case 'error_password_history':
              validationErrors.value.append('password', t('account_settings.password_history'))
              break
            case 'error_password_same':
              validationErrors.value.append('password', t('account_settings.password_same'))
              break
            default:
              error.value = new Error('account_settings.generic_error')
          }
        }
      })
      .catch((reason: Error) => {
        error.value = reason
      })
      .finally(() => {
        loading.value = false
      })
  }
}
</script>

<template>
  <SideDrawer
    :show="user != undefined"
    :title="$t('user_manager.change_user_password', { name: username })"
    @cancel="handleCancel"
  >
    <template #default>
      <form id="change-user-password" class="space-y-4" @submit.prevent="submit">
        <NeInlineNotification
          v-if="error"
          :description="$t(error.message)"
          :title="$t('errors.generic')"
          kind="error"
        />
        <NeTextInput
          v-model="username"
          autocomplete="username"
          :label="$t('user_manager.user_username')"
          disabled
        />
        <NeTextInput
          v-model="password"
          :disabled="loading"
          :invalid-message="validationErrors.getFirstMessage('password')"
          :label="$t('user_manager.user_password')"
          autocomplete="new-password"
          is-password
          required
        />
        <ul class="description-text ml-6 list-disc">
          <li>{{ t('account_settings.minimum_characters', minimumPasswordLength) }}</li>
          <li>{{ t('account_settings.minimum_uppercase', minimumUppercaseCharacters) }}</li>
          <li>{{ t('account_settings.minimum_lowercase', minimumLowercaseCharacters) }}</li>
          <li>{{ t('account_settings.minimum_number', minimumNumberCharacters) }}</li>
          <li>{{ t('account_settings.minimum_special', minimumSpecialCharacters) }}</li>
        </ul>
        <NeTextInput
          v-model="confirmPassword"
          :disabled="loading"
          :invalid-message="validationErrors.getFirstMessage('confirm_password')"
          :label="t('user_manager.user_confirm_password')"
          autocomplete="new-password"
          is-password
          required
        />
      </form>
    </template>
    <template #footer>
      <div class="flex flex-col justify-end gap-4 sm:flex-row">
        <NeButton :disabled="loading" kind="tertiary" @click="handleCancel">
          {{ t('user_manager.cancel') }}
        </NeButton>
        <NeButton
          :disabled="loading"
          :loading="loading"
          form="change-user-password"
          kind="primary"
          type="submit"
        >
          {{ t('save') }}
        </NeButton>
      </div>
    </template>
  </SideDrawer>
</template>
