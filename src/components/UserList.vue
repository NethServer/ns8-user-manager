<script lang="ts" setup>
import CreateUserDrawer from '@/components/CreateUserDrawer.vue'
import DeleteUserModal from '@/components/DeleteUserModal.vue'
import EditUserDrawer from '@/components/EditUserDrawer.vue'
import EditUserPasswordDrawer from '@/components/EditUserPasswordDrawer.vue'
import { useGroups } from '@/composables/useGroups'
import { useUsers, type User } from '@/composables/useUsers'
import { useNotificationEngine } from '@/stores/notifications'
import {
  faCircleCheck,
  faCircleXmark,
  faEdit,
  faExclamationTriangle,
  faPlusCircle
} from '@fortawesome/free-solid-svg-icons'
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
  NeTableRow,
  type NeComboboxOption
} from '@nethesis/vue-components'
import axios from 'axios'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

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
const userToChangePassword = ref<User>()

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
            label: group.description,
            id: group.group
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

function handleUserChangedPassword() {
  userToChangePassword.value = undefined
  notifications.add(
    'success',
    'user_manager.user_changed_password',
    'user_manager.user_changed_password_description'
  )
}

function toggleUserLock(user: User) {
  axios
    .post('/api/alter-user', {
      user: user.user,
      locked: !user.locked
    })
    .then(() => {
      fetchUsers()
      notifications.add(
        'success',
        user.locked
          ? 'user_manager.user_enabled_notification_title'
          : 'user_manager.user_disabled_notification_title',
        user.locked
          ? 'user_manager.user_enabled_notification_description'
          : 'user_manager.user_disabled_notification_description'
      )
    })
    .catch(() => {
      notifications.add('error', 'errors.generic', 'errors.unable_to_perform_action')
    })
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-y-4 sm:flex-row">
      <NeButton class="sm:order-2 sm:ml-auto" @click="createUser = true">
        <template #prefix>
          <FontAwesomeIcon :icon="faPlusCircle" />
        </template>
        {{ t('user_manager.add_user') }}
      </NeButton>
    </div>
    <NeInlineNotification
      v-if="error"
      :description="t(error.message)"
      :title="t('errors.generic')"
      kind="error"
    />
    <NeSkeleton v-if="loading" :lines="10" />
    <NeTable v-else>
      <NeTableHead>
        <NeTableHeadCell>{{ t('user_manager.user_username') }}</NeTableHeadCell>
        <NeTableHeadCell>{{ t('user_manager.user_display_name') }}</NeTableHeadCell>
        <NeTableHeadCell>{{ t('user_manager.user_group') }}</NeTableHeadCell>
        <NeTableHeadCell>{{ t('user_manager.user_mail') }}</NeTableHeadCell>
        <NeTableHeadCell>{{ t('user_manager.user_status') }}</NeTableHeadCell>
        <NeTableHeadCell></NeTableHeadCell>
      </NeTableHead>
      <NeTableBody>
        <NeTableRow v-for="(user, index) in data" :key="index">
          <NeTableCell
            >{{ user.user }}
            <span
              v-if="user.password_expiration > 0 && user.expired"
              :title="t('user_manager.password_expired_tooltip')"
            >
              <FontAwesomeIcon
                :icon="faExclamationTriangle"
                class="text-amber-700 dark:text-amber-500"
              />
            </span>
          </NeTableCell>
          <NeTableCell>{{ user.display_name.length != 0 ? user.display_name : '-' }}</NeTableCell>
          <NeTableCell v-if="user.groups.length > 0">
            {{ user.groups.map((group) => group.label).join(', ') }}
          </NeTableCell>
          <NeTableCell v-else>-</NeTableCell>
          <NeTableCell v-if="user.mail">{{ user.mail }}</NeTableCell>
          <NeTableCell v-else>-</NeTableCell>
          <NeTableCell>
            <div v-if="user.locked" class="flex items-center gap-2">
              <FontAwesomeIcon :icon="faCircleXmark" />
              <p>{{ t('user_manager.user_disabled') }}</p>
            </div>
            <div v-else class="flex items-center gap-2">
              <FontAwesomeIcon :icon="faCircleCheck" class="text-green-700 dark:text-green-500" />
              <p>{{ t('user_manager.user_enabled') }}</p>
            </div>
          </NeTableCell>
          <NeTableCell>
            <div class="flex justify-center gap-2">
              <NeButton kind="tertiary" size="sm" @click="userToEdit = user">
                <FontAwesomeIcon :icon="faEdit" class="pr-2" />
                {{ t('edit') }}
              </NeButton>
              <NeDropdown
                :items="[
                  {
                    id: 'lock',
                    label: user.locked
                      ? t('user_manager.user_enable')
                      : t('user_manager.user_disable'),
                    action: () => toggleUserLock(user)
                  },
                  {
                    id: 'change-password',
                    label: t('user_manager.user_change_password'),
                    action: () => (userToChangePassword = user)
                  },
                  {
                    id: 'delete',
                    danger: true,
                    label: t('user_manager.user_delete'),
                    action: () => (userToDelete = user)
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
  <CreateUserDrawer :show="createUser" @cancel="createUser = false" @success="handleCreatedUser" />
  <DeleteUserModal
    :user="userToDelete"
    @cancel="userToDelete = undefined"
    @delete="handleUserDeleted"
  />
  <EditUserDrawer :user="userToEdit" @cancel="userToEdit = undefined" @success="handleEditedUser" />
  <EditUserPasswordDrawer
    :user="userToChangePassword"
    @cancel="userToChangePassword = undefined"
    @success="handleUserChangedPassword"
  />
</template>
