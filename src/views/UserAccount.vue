<script lang="ts" setup>
import { NeButton, NeTextInput } from '@nethserver/vue-tailwind-lib'
import { NeInlineNotification } from '@nethesis/vue-components'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSave } from '@fortawesome/free-solid-svg-icons'
import { ref } from 'vue'
import axios from 'axios'
import { MessageBag } from '@/lib/validation'
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/composables/useAuth'
import { useNotificationEngine } from '@/stores/notifications'
import ContentPage from '@/components/ContentPage.vue'
import { useConfig } from '@/stores/config'

interface ChangePasswordResponse {
  status: 'success' | 'failure'
  message: string
}

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

// TODO: replace with password policy from server
const minimumPasswordLength = ref(8)
const minimumUppercaseCharacters = ref(1)
const minimumLowercaseCharacters = ref(1)
const minimumNumberCharacters = ref(1)
const minimumSpecialCharacters = ref(1)

const loading = ref(false)
const errorMessage = ref<string>()
const validationMessages = ref(new MessageBag())

const notificationEngine = useNotificationEngine()
const config = useConfig()

const { t } = useI18n()

const { uid } = useAuth()

function validate(): boolean {
  validationMessages.value.clear()
  if (newPassword.value != confirmPassword.value) {
    validationMessages.value.append('confirm_password', t('account_settings.passwords_mismatch'))
  }
  if (newPassword.value.length < minimumPasswordLength.value) {
    validationMessages.value.append(
      'password',
      t('account_settings.password_length', minimumPasswordLength.value)
    )
  }
  if (!newPassword.value.match(`(?=(?:.*[A-Z]){${minimumUppercaseCharacters.value},})`)) {
    validationMessages.value.append(
      'new_password',
      t('account_settings.password_uppercase', minimumUppercaseCharacters.value)
    )
  }
  if (!newPassword.value.match(`(?=(?:.*[a-z]){${minimumLowercaseCharacters.value},})`)) {
    validationMessages.value.append(
      'new_password',
      t('account_settings.password_lowercase', minimumLowercaseCharacters.value)
    )
  }
  if (!newPassword.value.match(`(?=(?:.*[0-9]){${minimumNumberCharacters.value},})`)) {
    validationMessages.value.append(
      'new_password',
      t('account_settings.password_number', minimumNumberCharacters.value)
    )
  }
  if (!newPassword.value.match(`(?=(?:.*[^A-Za-z0-9]){${minimumSpecialCharacters.value},})`)) {
    validationMessages.value.append(
      'new_password',
      t('account_settings.password_special', minimumSpecialCharacters.value)
    )
  }
  return validationMessages.value.size < 1
}

async function changePassword() {
  loading.value = true
  errorMessage.value = undefined
  try {
    if (validate()) {
      const response = await axios.post<ChangePasswordResponse>('/api/change-password', {
        current_password: oldPassword.value,
        new_password: newPassword.value
      })
      if (response.data.status == 'success') {
        oldPassword.value = ''
        newPassword.value = ''
        confirmPassword.value = ''
        notificationEngine.add(
          'success',
          'account_settings.password_changed',
          'account_settings.password_changed_description'
        )
      } else {
        switch (response.data.message) {
          case 'error_invalid_credentials':
            validationMessages.value.append(
              'old_password',
              t('account_settings.invalid_credentials')
            )
            break
          case 'error_password_complexity':
            validationMessages.value.append(
              'new_password',
              t('account_settings.password_complexity')
            )
            break
          case 'error_password_length':
            validationMessages.value.append(
              'new_password',
              t('account_settings.password_length', minimumPasswordLength.value)
            )
            break
          case 'error_password_history':
            validationMessages.value.append('new_password', t('account_settings.password_history'))
            break
          case 'error_password_minimum_age':
            validationMessages.value.append(
              'new_password',
              t('account_settings.password_minimum_age')
            )
            break
          default:
            errorMessage.value = t('account_settings.generic_error')
        }
      }
    }
  } catch (exception: any) {
    if (axios.isAxiosError(exception) && exception.response != undefined) {
      if (exception.response.status >= 500) {
        errorMessage.value = 'login_form.server_error'
      }
    } else {
      errorMessage.value = exception.message
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <ContentPage :title="$t('account_settings.title')">
    <div class="grid grid-cols-1 gap-x-6 gap-y-6 lg:grid-cols-2">
      <div class="space-y-1">
        <p>
          {{ $t('account_settings.change_password') }}
        </p>
        <p class="description-text">{{ $t('account_settings.change_password_description') }}</p>
        <ul class="description-text list-disc pl-6">
          <li v-for="(product, key) in config.services" :key="key">
            {{ $t(product) }}
          </li>
        </ul>
      </div>
      <form class="flex flex-col gap-y-8" @submit.prevent="changePassword()">
        <NeInlineNotification v-if="errorMessage" :title="errorMessage" kind="error" />
        <!-- This helps autocompletion -->
        <NeTextInput :value="uid" autocomplete="username" class="hidden" />
        <NeTextInput
          v-model="oldPassword"
          :disabled="loading"
          :invalid-message="validationMessages.getFirstMessage('old_password')"
          :label="$t('account_settings.current_password')"
          autocomplete="current-password"
          autofocus
          is-password
          name="old_password"
          required
        />
        <div class="space-y-4">
          <NeTextInput
            v-model="newPassword"
            :disabled="loading"
            :invalid-message="validationMessages.getFirstMessage('new_password')"
            :label="$t('account_settings.new_password')"
            autocomplete="new-password"
            is-password
            name="new_password"
            required
          />
          <ul class="description-text ml-6 list-disc">
            <li>{{ $t('account_settings.minimum_characters', minimumPasswordLength) }}</li>
            <li>{{ $t('account_settings.minimum_uppercase', minimumUppercaseCharacters) }}</li>
            <li>{{ $t('account_settings.minimum_lowercase', minimumLowercaseCharacters) }}</li>
            <li>{{ $t('account_settings.minimum_number', minimumNumberCharacters) }}</li>
            <li>{{ $t('account_settings.minimum_special', minimumSpecialCharacters) }}</li>
          </ul>
        </div>
        <NeTextInput
          v-model="confirmPassword"
          :disabled="loading"
          :invalid-message="validationMessages.getFirstMessage('confirm_password')"
          :label="$t('account_settings.confirm_password')"
          autocomplete="new-password"
          is-password
          name="confirm_password"
          required
        />
        <NeButton
          :disabled="loading"
          :loading="loading"
          class="ml-auto"
          kind="primary"
          type="submit"
        >
          <FontAwesomeIcon :icon="faSave" aria-hidden="true" class="mr-2 h-4 w-4" />
          {{ $t('account_settings.save_password') }}
        </NeButton>
      </form>
    </div>
  </ContentPage>
</template>
