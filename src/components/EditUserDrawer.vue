<script lang="ts" setup>
import type { UserList } from '@/components/UserList.vue'
import { computed, ref, watch } from 'vue'
import { useGroups } from '@/composables/useGroups'
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
import type { BaseResponse } from '@/lib/axiosHelpers'
import axios from 'axios'
import SideDrawer from '@/components/SideDrawer.vue'

const { data: remoteGroups, loading: groupsLoading, error: groupsError } = useGroups()

const props = defineProps<{
  user?: UserList
}>()

const emit = defineEmits(['success', 'cancel'])

const enabled = ref(true)
const username = ref('')
const name = ref('')
const groups = ref<Array<NeComboboxOption>>([])
const email = ref('')

const loading = ref(false)
const error = ref<Error>()

watch(
  () => props.user,
  () => {
    if (props.user) {
      enabled.value = !props.user.locked
      username.value = props.user.user
      name.value = props.user.display_name
      groups.value = props.user.groups
      email.value = props.user.mail
    }
  },
  { immediate: true }
)

const groupsOptions = computed(() => {
  return remoteGroups.value?.map((group): NeComboboxOption => {
    return {
      label: group.description,
      id: group.group
    }
  })
})

function handleCancel() {
  if (!loading.value) {
    emit('cancel')
  }
}

function submit() {
  axios
    .post<BaseResponse>('/api/alter-user', {
      user: props.user!.user,
      display_name: name.value,
      locked: !enabled.value,
      groups: groups.value.map((group) => group.id),
      mail: email.value ? email.value : ''
    })
    .then(() => {
      emit('success')
    })
    .catch((reason: Error) => {
      error.value = reason
    })
    .finally(() => {
      loading.value = false
    })
}
</script>

<template>
  <SideDrawer
    :show="user != undefined"
    :title="$t('user_manager.edit_user', { name: username })"
    @cancel="$emit('cancel')"
  >
    <template #default>
      <form id="edit-user" class="space-y-4" @submit.prevent="submit">
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
        <NeTextInput v-model="username" :label="$t('user_manager.user_username')" disabled />
        <NeTextInput
          v-model="name"
          :disabled="loading"
          :label="$t('user_manager.user_name')"
          required
        />
        <NeSkeleton v-if="groupsLoading" :lines="2" />
        <NeInlineNotification
          v-else-if="groupsError"
          :description="$t(groupsError.message)"
          :title="$t('errors.generic')"
          kind="error"
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
          v-model="email"
          :disabled="loading"
          :label="$t('user_manager.email')"
          autocomplete="email"
          optional
          type="email"
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
          form="edit-user"
          kind="primary"
          type="submit"
        >
          {{ $t('edit') }}
        </NeButton>
      </div>
    </template>
  </SideDrawer>
</template>
