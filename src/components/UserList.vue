<script lang="ts" setup>
import {
  faCircleCheck,
  faCircleXmark,
  faEdit,
  faPlusCircle
} from '@fortawesome/free-solid-svg-icons'
import {
  NeButton,
  type NeComboboxOption,
  NeDropdown,
  NeInlineNotification,
  NeSkeleton
} from '@nethserver/vue-tailwind-lib'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { type User, useUsers } from '@/composables/useUsers'
import { useGroups } from '@/composables/useGroups'
import { computed, ref } from 'vue'
import {
  NeTable,
  NeTableBody,
  NeTableCell,
  NeTableHead,
  NeTableHeadCell,
  NeTableRow
} from '@nethesis/vue-components'
import DeleteUserModal from '@/components/DeleteUserModal.vue'
import { useI18n } from 'vue-i18n'
import { useNotificationEngine } from '@/stores/useNotificationEngine'
import CreateUserDrawer from '@/components/CreateUserDrawer.vue'
import EditUserDrawer from '@/components/EditUserDrawer.vue'

export interface UserList extends User {
  groups: NeComboboxOption[]
}

const { t } = useI18n()

const notifications = useNotificationEngine()

const { loading: userLoading, data: userData, error: userError, fetch: fetchUsers } = useUsers()
const {
  loading: groupLoading,
  data: groupData,
  error: groupError,
  fetch: fetchGroups
} = useGroups()

const createUser = ref(false)
const userToDelete = ref<User>()
const userToEdit = ref<UserList>()

const loading = computed((): boolean => {
  return userLoading.value || groupLoading.value
})

const error = computed((): Error | undefined => {
  return userError.value || groupError.value
})

const data = computed((): UserList[] => {
  return userData.value.map((user): UserList => {
    return {
      ...user,
      groups: groupData.value
        .filter((group) => {
          return group.users.includes(user.user)
        })
        .map((group) => {
          return {
            label: group.group,
            id: group.description
          }
        })
    }
  })
})

function handleCreatedUser() {
  createUser.value = false
  fetchUsers()
  fetchGroups()
  notifications.add(
    'success',
    t('user_manager.user_created'),
    t('user_manager.user_created_description')
  )
}

function handleUserDeleted() {
  userToDelete.value = undefined
  fetchUsers()
  notifications.add(
    'success',
    t('user_manager.user_deleted'),
    t('user_manager.user_deleted_description')
  )
}

function handleEditedUser() {
  userToEdit.value = undefined
  fetchUsers()
  fetchGroups()
  notifications.add('success', 'user_manager.user_edited', 'user_manager.user_edited_description')
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-y-4 sm:flex-row">
      <NeButton class="sm:order-2 sm:ml-auto" @click="createUser = true">
        <template #prefix>
          <FontAwesomeIcon :icon="faPlusCircle" />
        </template>
        {{ $t('user_manager.add_user') }}
      </NeButton>
    </div>
    <NeInlineNotification
      v-if="error"
      :description="error.message"
      :title="$t('errors.generic')"
      kind="error"
    />
    <NeSkeleton v-if="loading" :lines="10" />
    <NeTable v-else>
      <NeTableHead>
        <NeTableHeadCell>{{ $t('user_manager.user_username') }}</NeTableHeadCell>
        <NeTableHeadCell>{{ $t('user_manager.user_display_name') }}</NeTableHeadCell>
        <NeTableHeadCell>{{ $t('user_manager.user_group') }}</NeTableHeadCell>
        <NeTableHeadCell>{{ $t('user_manager.user_status') }}</NeTableHeadCell>
        <NeTableHeadCell></NeTableHeadCell>
      </NeTableHead>
      <NeTableBody>
        <NeTableRow v-for="(user, index) in data" :key="index">
          <NeTableCell>{{ user.user }}</NeTableCell>
          <NeTableCell>{{ user.display_name }}</NeTableCell>
          <NeTableCell v-if="user.groups.length > 0">
            {{ user.groups.map((group) => group.label).join(', ') }}
          </NeTableCell>
          <NeTableCell v-else>-</NeTableCell>
          <NeTableCell>
            <div v-if="user.locked" class="flex items-center gap-2">
              <FontAwesomeIcon :icon="faCircleXmark" />
              <p>{{ $t('user_manager.user_disabled') }}</p>
            </div>
            <div v-else class="flex items-center gap-2">
              <FontAwesomeIcon :icon="faCircleCheck" />
              <p>{{ $t('user_manager.user_enabled') }}</p>
            </div>
          </NeTableCell>
          <NeTableCell class="flex items-center justify-end gap-4">
            <NeButton kind="tertiary" size="sm" @click="userToEdit = user">
              <FontAwesomeIcon :icon="faEdit" class="pr-2" />
              {{ $t('edit') }}
            </NeButton>
            <NeDropdown
              :items="[
                {
                  id: 'lock',
                  label: user.locked
                    ? $t('user_manager.user_unlock')
                    : $t('user_manager.user_lock'),
                  disabled: true
                },
                {
                  id: 'change-password',
                  label: $t('user_manager.user_change_password'),
                  disabled: true
                },
                {
                  id: 'delete',
                  danger: true,
                  label: $t('user_manager.user_delete'),
                  action: () => (userToDelete = user)
                }
              ]"
              align-to-right
            />
          </NeTableCell>
        </NeTableRow>
      </NeTableBody>
    </NeTable>
  </div>
  <CreateUserDrawer :show="createUser" @cancel="createUser = false" @success="handleCreatedUser" />
  <DeleteUserModal
    :user="userToDelete"
    @cancel="userToDelete = undefined"
    @delete="handleUserDeleted"
  />
  <EditUserDrawer :user="userToEdit" @cancel="userToEdit = undefined" @success="handleEditedUser" />
</template>
