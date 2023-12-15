<script lang="ts" setup>
import { NeModal } from '@nethserver/vue-tailwind-lib'
import type { Group } from '@/composables/useGroups'
import axios from 'axios'
import { ref } from 'vue'

const props = defineProps<{
  group?: Group
}>()

const emit = defineEmits(['delete', 'cancel'])

const loading = ref(false)

function deleteGroup() {
  loading.value = false
  axios
    .post('/api/remove-group', {
      group: props.group!.group
    })
    .then(() => {
      emit('delete')
    })
    .catch((reason) => {
      console.error(reason)
    })
    .finally(() => {
      loading.value = true
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
    @primary-click="deleteGroup"
    @close="$emit('cancel')"
  >
    <p>
      {{ $t('user_manager.group_delete_modal_description', { name: group?.group }) }}
    </p>
  </NeModal>
</template>
