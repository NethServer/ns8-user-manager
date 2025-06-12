<script lang="ts" setup>
import type { User } from '@/composables/useUsers'
import { NeInlineNotification, NeModal } from '@nethesis/vue-components'
import axios from 'axios'
import { ref, watch } from 'vue'

const props = defineProps<{
  user?: User
}>()

const emit = defineEmits(['delete', 'cancel'])

const loading = ref(false)
const error = ref<Error>()
const userToDelete = ref<User>()

function handleClose() {
  if (!loading.value) {
    emit('cancel')
  }
}

watch(
  () => props.user,
  (user) => {
    if (user != undefined) {
      userToDelete.value = user
    }
  }
)

function deleteUser() {
  loading.value = true
  error.value = undefined
  axios
    .post('/api/remove-user', {
      user: userToDelete.value!.user
    })
    .then(() => {
      emit('delete')
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
  <NeModal
    :primary-label="$t('user_manager.user_delete')"
    :title="$t('user_manager.user_delete_modal_title')"
    :visible="user != undefined"
    kind="warning"
    primary-button-kind="danger"
    :primary-button-loading="loading"
    :primary-button-disabled="loading"
    :close-aria-label="$t('close')"
    @primary-click="deleteUser"
    @close="handleClose"
  >
    <div class="space-y-4">
      <NeInlineNotification
        v-if="error"
        :description="$t(error.message)"
        :title="$t('errors.generic')"
        kind="error"
      />
      <p>
        {{ $t('user_manager.user_delete_modal_description', { name: userToDelete!.user }) }}
      </p>
    </div>
  </NeModal>
</template>
