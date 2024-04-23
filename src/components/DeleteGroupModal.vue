<script lang="ts" setup>
import { NeInlineNotification, NeModal } from '@nethesis/vue-components'
import type { Group } from '@/composables/useGroups'
import axios from 'axios'
import { ref } from 'vue'

const props = defineProps<{
  group?: Group
}>()

const emit = defineEmits(['delete', 'cancel'])

const loading = ref(false)
const error = ref<Error>()

function handleClose() {
  if (!loading.value) {
    emit('cancel')
  }
}

function deleteGroup() {
  loading.value = true
  error.value = undefined
  axios
    .post('/api/remove-group', {
      group: props.group!.group
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
    :primary-label="$t('user_manager.group_delete')"
    :title="$t('user_manager.group_delete_modal_title')"
    :visible="group != undefined"
    kind="warning"
    primary-button-kind="danger"
    :primary-button-loading="loading"
    :primary-button-disabled="loading"
    :close-aria-label="$t('close')"
    @primary-click="deleteGroup"
    @close="handleClose"
  >
    <div class="space-y-4">
      <NeInlineNotification
        v-if="error"
        kind="error"
        :title="$t('errors.generic')"
        :description="$t(error.message)"
      />
      <p>
        {{ $t('user_manager.group_delete_modal_description', { name: group?.group }) }}
      </p>
    </div>
  </NeModal>
</template>
