<script lang="ts" setup>
import SideDrawer from '@/components/SideDrawer.vue'
import {
  NeButton,
  NeCombobox,
  type NeComboboxOption,
  NeFormItemLabel,
  NeTextInput,
  NeToggle
} from '@nethserver/vue-tailwind-lib'
import { NeInlineNotification, NeSkeleton } from '@nethesis/vue-components'
import { computed, ref, watch } from 'vue'
import axios from 'axios'
import type { BaseResponse } from '@/lib/axiosHelpers'
import { MessageBag } from '@/lib/validation'
import { useI18n } from 'vue-i18n'
import { useGroups } from '@/composables/useGroups'

interface ErrorResponse extends BaseResponse {
  error: Array<{ error: string; field: string; parameter: string; value: string }>
}

const { t } = useI18n()

const { data: remoteGroups, loading: groupsLoading, error: groupsError } = useGroups()

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits(['success', 'cancel'])

const enabled = ref(true)
const username = ref('')
const name = ref('')
const password = ref('')
const confirmPassword = ref('')
const groups = ref<Array<NeComboboxOption>>([])

const minimumPasswordLength = 8
const minimumUppercaseCharacters = 1
const minimumLowercaseCharacters = 1
const minimumNumberCharacters = 1
const minimumSpecialCharacters = 1

const validationErrors = ref(new MessageBag())
const loading = ref(false)
const error = ref<Error>()

/**
 * Resets the form to its initial state.
 */
watch(
  () => props.show,
  (show) => {
    if (show) {
      enabled.value = true
      name.value = ''
      username.value = ''
      password.value = ''
      confirmPassword.value = ''
    }
  }
)

const groupsOptions = computed((): Array<NeComboboxOption> => {
  return remoteGroups.value.map((group) => ({
    label: group.description,
    id: group.group
  }))
})

function handleCancel() {
  if (!loading.value) {
    emit('cancel')
  }
}

function validate(): boolean {
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
      .post<BaseResponse>('/api/add-user', {
        user: username.value,
        display_name: name.value,
        password: password.value,
        locked: !enabled.value,
        groups: groups.value.map((group) => group.id)
      })
      .then((response) => {
        if (response.data.status == 'success') {
          emit('success')
        } else {
          const errorResponse = response.data as ErrorResponse
          errorResponse.error.forEach((item) => {
            if (item.error == 'user_already_exists') {
              validationErrors.value.append('username', t('user_manager.user_already_exists'))
            }
          })
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
  <SideDrawer :show="show" :title="$t('user_manager.add_user')" @cancel="handleCancel()">
    <template #default>
      <form id="create-user" class="space-y-4" @submit.prevent="submit">
        <NeInlineNotification
          v-if="error"
          :description="$t(error.message)"
          :title="$t('errors.generic')"
          kind="error"
        />
        <div>
          <NeFormItemLabel>{{ $t('user_manager.user_status') }}</NeFormItemLabel>
          <NeToggle
            v-model="enabled"
            :disabled="loading"
            :label="enabled ? $t('user_manager.user_enabled') : $t('user_manager.user_disabled')"
          />
        </div>
        <NeTextInput
          v-model="username"
          :disabled="loading"
          :invalid-message="validationErrors.getFirstMessage('username')"
          :label="$t('user_manager.user_username')"
          autocomplete="username"
          required
        />
        <NeTextInput
          v-model="name"
          :disabled="loading"
          :label="$t('user_manager.user_name')"
          required
        />
        <NeSkeleton v-if="groupsLoading" :lines="2" />
        <NeInlineNotification
          v-else-if="groupsError"
          :title="$t('errors.generic')"
          kind="error"
          :description="$t(groupsError.message)"
        />
        <NeCombobox
          v-else
          v-model="groups"
          :disabled="loading"
          :label="$t('user_manager.groups')"
          :options="groupsOptions"
          :placeholder="$t('user_manager.choose_groups')"
          multiple
          name="users"
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
          <li>{{ $t('account_settings.minimum_characters', minimumPasswordLength) }}</li>
          <li>{{ $t('account_settings.minimum_uppercase', minimumUppercaseCharacters) }}</li>
          <li>{{ $t('account_settings.minimum_lowercase', minimumLowercaseCharacters) }}</li>
          <li>{{ $t('account_settings.minimum_number', minimumNumberCharacters) }}</li>
          <li>{{ $t('account_settings.minimum_special', minimumSpecialCharacters) }}</li>
        </ul>
        <NeTextInput
          v-model="confirmPassword"
          :disabled="loading"
          :invalid-message="validationErrors.getFirstMessage('confirm_password')"
          :label="$t('user_manager.user_confirm_password')"
          autocomplete="new-password"
          is-password
          required
        />
      </form>
    </template>
    <template #footer>
      <div class="flex flex-col justify-end gap-4 sm:flex-row">
        <NeButton :disabled="loading" kind="tertiary" @click="handleCancel()">
          {{ $t('user_manager.cancel') }}
        </NeButton>
        <NeButton
          :disabled="loading"
          :loading="loading"
          form="create-user"
          kind="primary"
          type="submit"
        >
          {{ $t('user_manager.add_user') }}
        </NeButton>
      </div>
    </template>
  </SideDrawer>
</template>
