<script lang="ts" setup>
import SideDrawer from '@/components/SideDrawer.vue'
import {
  NeInlineNotification,
  NeSkeleton,
  NeButton,
  NeCombobox,
  type NeComboboxOption,
  NeFormItemLabel,
  NeTextInput,
  NeToggle
} from '@nethesis/vue-components'
import { computed, ref, watch } from 'vue'
import axios from 'axios'
import type { BaseResponse } from '@/lib/axiosHelpers'
import { MessageBag } from '@/lib/validation'
import { useI18n } from 'vue-i18n'
import { useGroups } from '@/composables/useGroups'
import { usePasswordPolicy } from '@/composables/usePasswordPolicy'
import PasswordRequirementList from '@/components/PasswordRequirementList.vue'

interface ErrorResponse extends BaseResponse {
  error: Array<{ error: string; field: string; parameter: string; value: string }>
}

const { t } = useI18n()

const { data: remoteGroups, loading: groupsLoading, error: groupsError } = useGroups()
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
  show: boolean
}>()

const emit = defineEmits(['success', 'cancel'])

const enabled = ref(true)
const username = ref('')
const name = ref('')
const password = ref('')
const confirmPassword = ref('')
const groups = ref<Array<NeComboboxOption>>([])

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
  validatePassword(password.value, confirmPassword.value).forEach((item, key) => {
    validationErrors.value.set(key, item)
  })
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
            :label="$t('user_manager.user_confirm_password')"
            autocomplete="new-password"
            is-password
            required
          />
        </template>
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
