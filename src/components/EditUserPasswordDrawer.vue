<script lang="ts" setup>
import type { User } from '@/composables/useUsers'
import { ref, watch } from 'vue'
import SideDrawer from '@/components/SideDrawer.vue'
import { NeButton, NeTextInput } from '@nethserver/vue-tailwind-lib'
import { MessageBag } from '@/lib/validation'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import type { BaseResponse } from '@/lib/axiosHelpers'
import { NeInlineNotification, NeSkeleton } from '@nethesis/vue-components'
import PasswordRequirementList from '@/components/PasswordRequirementList.vue'
import { usePasswordPolicy } from '@/composables/usePasswordPolicy'

const { t } = useI18n()

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
  validationErrors.value.clear()
  validatePassword(password.value, confirmPassword.value, 'password').forEach((item, key) => {
    validationErrors.value.set(key, item)
  })
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
        <NeSkeleton v-if="passwordPolicyLoading" :lines="2" />
        <NeInlineNotification
          v-else-if="passwordPolicyError"
          :title="t('account_settings.password_policy_error')"
          kind="error"
        />
        <template v-else>
          <NeTextInput
            v-model="password"
            :disabled="loading"
            :invalid-message="validationErrors.getFirstMessage('password')"
            :label="$t('user_manager.user_password')"
            autocomplete="new-password"
            is-password
            required
          />
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
            :invalid-message="validationErrors.getFirstMessage('confirm_password')"
            :label="t('user_manager.user_confirm_password')"
            autocomplete="new-password"
            is-password
            required
          />
        </template>
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
