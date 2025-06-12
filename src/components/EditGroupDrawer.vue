<script lang="ts" setup>
import SideDrawer from '@/components/SideDrawer.vue'
import type { Group } from '@/composables/useGroups'
import { ref, watch } from 'vue'
import {
  NeSkeleton,
  NeButton,
  NeCombobox,
  type NeComboboxOption,
  NeInlineNotification,
  NeTextInput
} from '@nethesis/vue-components'
import { useUsers } from '@/composables/useUsers'
import axios from 'axios'

const {
  comboboxChoices: userComboboxChoices,
  loading: loadingUsers,
  error: errorUsers
} = useUsers()

const emit = defineEmits(['cancel', 'success'])

const props = defineProps<{
  group?: Group
}>()

const name = ref('')
const description = ref('')
const users = ref<Array<NeComboboxOption>>([])

const loading = ref(false)
const error = ref<Error>()

watch(
  () => props.group,
  () => {
    if (props.group) {
      name.value = props.group.group
      description.value = props.group.description
      users.value = props.group.users.map((user): NeComboboxOption => {
        return {
          label: user,
          id: user
        }
      })
    }
  },
  { immediate: true }
)

function edit() {
  error.value = undefined
  loading.value = true
  axios
    .post('/api/alter-group', {
      group: name.value,
      description: description.value,
      users: users.value.map((user) => user.id)
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

function handleCancel() {
  if (loading.value) {
    return
  }
  emit('cancel')
}
</script>

<template>
  <SideDrawer
    :show="group != undefined"
    :title="$t('user_manager.group_edit')"
    @cancel="handleCancel"
  >
    <template #default>
      <form id="edit-group" class="space-y-4" @submit.prevent="edit">
        <NeTextInput v-model="name" :label="$t('user_manager.group_name')" disabled />
        <NeTextInput
          v-model="description"
          :disabled="loading"
          :label="$t('user_manager.group_description')"
          required
        />
        <NeInlineNotification
          v-if="errorUsers"
          :description="$t(errorUsers.message)"
          :title="$t('errors.generic_error')"
          kind="error"
        />
        <NeSkeleton v-if="loadingUsers" />
        <NeCombobox
          v-else
          v-model="users"
          :disabled="loading"
          :label="$t('user_manager.users')"
          :options="userComboboxChoices"
          :placeholder="$t('user_manager.choose_users')"
          multiple
          :no-results-label="$t('ne_combobox.no_results')"
          :limited-options-label="$t('ne_combobox.limited_options_label')"
          :no-options-label="$t('ne_combobox.no_options_label')"
          :selected-label="$t('ne_combobox.selected')"
          :user-input-label="$t('ne_combobox.user_input_label')"
          :optional-label="$t('common.optional')"
        />
      </form>
    </template>
    <template #footer>
      <div class="flex flex-col justify-end gap-4 sm:flex-row">
        <NeButton :disabled="loading" kind="secondary" @click="handleCancel">
          {{ $t('user_manager.cancel') }}
        </NeButton>
        <NeButton
          :disabled="loading"
          :loading="loading"
          form="edit-group"
          kind="primary"
          type="submit"
        >
          {{ $t('user_manager.edit_group') }}
        </NeButton>
      </div>
    </template>
  </SideDrawer>
</template>
