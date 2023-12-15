<script lang="ts" setup>
import { faEdit, faPlusCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  NeButton,
  NeDropdown,
  NeInlineNotification,
  NeSkeleton,
  NeTextInput
} from '@nethserver/vue-tailwind-lib'
import { type Group, useGroups } from '@/composables/useGroups'
import { ref } from 'vue'
import CreateGroupDrawer from '@/components/CreateGroupDrawer.vue'
import DeleteGroupModal from '@/components/DeleteGroupModal.vue'
import { useNotificationEngine } from '@/stores/useNotificationEngine'
import { useI18n } from 'vue-i18n'

const { loading, data, error, fetch } = useGroups()
const notifications = useNotificationEngine()

const create = ref(false)
const groupToDelete = ref<Group>()

const { t } = useI18n()

function handleGroupCreated() {
  create.value = false
  fetch()
  notifications.add(
    'success',
    t('user_manager.group_created'),
    t('user_manager.group_created_description')
  )
}

function handleGroupDeleted() {
  groupToDelete.value = undefined
  fetch()
  notifications.add(
    'success',
    t('user_manager.group_deleted'),
    t('user_manager.group_deleted_description')
  )
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-y-4 sm:flex-row">
      <NeButton class="sm:order-2 sm:ml-auto" @click="create = true">
        <template #prefix>
          <FontAwesomeIcon :icon="faPlusCircle" />
        </template>
        {{ $t('user_manager.add_group') }}
      </NeButton>
      <NeTextInput :placeholder="$t('user_manager.search_group')" class="sm:order-1" />
    </div>
    <NeInlineNotification
      v-if="error"
      :description="$t(error?.message)"
      :title="$t('errors.generic')"
      kind="error"
    />
    <NeSkeleton v-if="loading" :lines="10" />
    <!-- TODO: replace with proper table -->
    <table v-else class="w-full">
      <thead>
        <tr>
          <th>{{ $t('user_manager.group_name') }}</th>
          <th>{{ $t('user_manager.group_description') }}</th>
          <th><!-- Actions --></th>
        </tr>
      </thead>
      <tbody>
        <template v-if="data?.groups != undefined && data.groups.length > 0">
          <tr v-for="(group, index) in data?.groups" :key="index">
            <td>{{ group.group }}</td>
            <td>{{ group.description }}</td>
            <td class="flex items-center justify-end gap-x-4">
              <NeButton kind="tertiary" size="sm">
                <FontAwesomeIcon :icon="faEdit" class="pr-2" />
                {{ $t('user_manager.group_edit') }}
              </NeButton>
              <NeDropdown
                :items="[
                  {
                    id: 'delete',
                    danger: true,
                    label: $t('user_manager.group_delete'),
                    action: () => (groupToDelete = group)
                  }
                ]"
                align-to-right
              />
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
  <CreateGroupDrawer :show="create" @cancel="create = false" @success="handleGroupCreated" />
  <DeleteGroupModal
    :group="groupToDelete"
    @cancel="groupToDelete = undefined"
    @delete="handleGroupDeleted"
  />
</template>
