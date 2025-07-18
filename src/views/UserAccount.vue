<script lang="ts" setup>
import ContentPage from '@/components/ContentPage.vue'
import PasswordRequirementList from '@/components/PasswordRequirementList.vue'
import { useAuth } from '@/composables/useAuth'
import { usePasswordPolicy } from '@/composables/usePasswordPolicy'
import { MessageBag } from '@/lib/validation'
import { useConfig } from '@/stores/config'
import { useNotificationEngine } from '@/stores/notifications'
import { faSave } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { NeButton, NeInlineNotification, NeSkeleton, NeTextInput } from '@nethesis/vue-components'
import axios from 'axios'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

interface ChangePasswordResponse {
  status: 'success' | 'failure'
  message: string
}

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const loading = ref(false)
const errorMessage = ref<string>()
const validationMessages = ref(new MessageBag())

const notificationEngine = useNotificationEngine()
const config = useConfig()

const { t } = useI18n()

const { uid } = useAuth()
const {
  validatePassword,
  passwordPolicyLoading,
  passwordPolicyError,
  minimumLength,
  minimumLowercaseCharacters,
  minimumNumberCharacters,
  minimumSpecialCharacters,
  minimumUppercaseCharacters,
  complexityCheck,
  strengthEnforced
} = usePasswordPolicy()

function validate(): boolean {
  validationMessages.value.clear()
  validatePassword(newPassword.value, confirmPassword.value, 'new_password').forEach(
    (item, key) => {
      validationMessages.value.set(key, item)
    }
  )
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
              t('account_settings.password_length', minimumLength.value)
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
  } catch (exception: unknown) {
    if (axios.isAxiosError(exception) && exception.response != undefined) {
      if (exception.response.status >= 500) {
        errorMessage.value = 'login_form.server_error'
      }
    } else if (exception instanceof Error) {
      errorMessage.value = exception.message
    } else {
      errorMessage.value = 'errors.generic'
      console.log(exception)
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <ContentPage :title="t('account_settings.title')">
    <div class="grid grid-cols-1 gap-x-6 gap-y-6 lg:grid-cols-2">
      <div class="space-y-1">
        <p>
          {{ t('account_settings.change_password') }}
        </p>
        <p class="description-text">{{ t('account_settings.change_password_description') }}</p>
        <ul class="description-text list-disc pl-6">
          <li v-for="(product, key) in config.services" :key="key">
            {{ t(product) }}
          </li>
        </ul>
      </div>
      <NeSkeleton v-if="passwordPolicyLoading" :lines="15" />
      <NeInlineNotification
        v-else-if="passwordPolicyError"
        :title="t('account_settings.password_policy_error')"
        kind="error"
      />
      <form v-else class="flex flex-col gap-y-8" @submit.prevent="changePassword()">
        <NeInlineNotification v-if="errorMessage" :title="errorMessage" kind="error" />
        <!-- This helps autocompletion -->
        <NeTextInput :value="uid" autocomplete="username" class="hidden" />
        <NeTextInput
          v-model="oldPassword"
          :disabled="loading"
          :invalid-message="validationMessages.getFirstMessage('old_password')"
          :label="t('account_settings.current_password')"
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
            :label="t('account_settings.new_password')"
            autocomplete="new-password"
            is-password
            name="new_password"
            required
          />
        </div>
        <PasswordRequirementList
          :strength-enforced="strengthEnforced"
          :complexity-check="complexityCheck"
          :minimum-password-length="minimumLength"
          :minimum-uppercase-characters="minimumUppercaseCharacters"
          :minimum-lowercase-characters="minimumLowercaseCharacters"
          :minimum-number-characters="minimumNumberCharacters"
          :minimum-special-characters="minimumSpecialCharacters"
        />
        <NeTextInput
          v-model="confirmPassword"
          :disabled="loading"
          :invalid-message="validationMessages.getFirstMessage('confirm_password')"
          :label="t('account_settings.confirm_password')"
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
          {{ t('account_settings.save_password') }}
        </NeButton>
      </form>
    </div>
  </ContentPage>
</template>
