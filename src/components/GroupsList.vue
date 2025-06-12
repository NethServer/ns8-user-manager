<script lang="ts" setup>
import CreateGroupDrawer from '@/components/CreateGroupDrawer.vue'
import DeleteGroupModal from '@/components/DeleteGroupModal.vue'
import EditGroupDrawer from '@/components/EditGroupDrawer.vue'
import { useGroups, type Group } from '@/composables/useGroups'
import { useNotificationEngine } from '@/stores/notifications'
import { faEdit, faPlusCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  NeButton,
  NeDropdown,
  NeInlineNotification,
  NeSkeleton,
  NeTable,
  NeTableBody,
  NeTableCell,
  NeTableHead,
  NeTableHeadCell,
  NeTableRow
} from '@nethesis/vue-components'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { loading, data, error, fetch } = useGroups()
const notifications = useNotificationEngine()

const create = ref(false)
const groupToDelete = ref<Group>()
const groupToEdit = ref<Group>()

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

function handleGroupEdited() {
  groupToEdit.value = undefined
  fetch()
  notifications.add(
    'success',
    t('user_manager.group_edited'),
    t('user_manager.group_edited_description')
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
    </div>
    <NeInlineNotification
      v-if="error"
      :description="$t(error?.message)"
      :title="$t('errors.generic')"
      kind="error"
    />
    <NeSkeleton v-if="loading" :lines="10" />
    <NeTable v-else>
      <NeTableHead>
        <NeTableHeadCell>{{ $t('user_manager.group_name') }}</NeTableHeadCell>
        <NeTableHeadCell>{{ $t('user_manager.group_description') }}</NeTableHeadCell>
        <NeTableHeadCell><!-- Actions --></NeTableHeadCell>
      </NeTableHead>
      <NeTableBody>
        <NeTableRow v-for="(group, index) in data" :key="index">
          <NeTableCell>{{ group.group }}</NeTableCell>
          <NeTableCell>{{ group.description }}</NeTableCell>
          <NeTableCell>
            <div class="flex items-center justify-end gap-2">
              <NeButton kind="tertiary" size="sm" @click="groupToEdit = group">
                <FontAwesomeIcon :icon="faEdit" class="pr-2" />
                {{ $t('edit') }}
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
            </div>
          </NeTableCell>
        </NeTableRow>
      </NeTableBody>
    </NeTable>
  </div>
  <CreateGroupDrawer :show="create" @cancel="create = false" @success="handleGroupCreated" />
  <DeleteGroupModal
    :group="groupToDelete"
    @cancel="groupToDelete = undefined"
    @delete="handleGroupDeleted"
  />
  <EditGroupDrawer
    :group="groupToEdit"
    @cancel="groupToEdit = undefined"
    @success="handleGroupEdited"
  />
</template>
