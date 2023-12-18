<script lang="ts" setup>
import { faEdit, faPlusCircle } from '@fortawesome/free-solid-svg-icons'
import {
  NeButton,
  NeDropdown,
  NeInlineNotification,
  NeSkeleton
} from '@nethserver/vue-tailwind-lib'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { type User, useUsers } from '@/composables/useUsers'
import { useGroups } from '@/composables/useGroups'
import { computed } from 'vue'

interface UserList extends User {
  groups: string[]
}

const { loading: userLoading, data: userData, error: userError } = useUsers()
const { loading: groupLoading, data: groupData, error: groupError } = useGroups()

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
          return group.group
        })
    }
  })
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-y-4 sm:flex-row">
      <NeButton class="sm:order-2 sm:ml-auto">
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
    <!-- TODO: replace with table -->
    <table v-else class="w-full">
      <thead>
        <tr>
          <th>{{ $t('user_manager.user_name') }}</th>
          <th>{{ $t('user_manager.user_display_name') }}</th>
          <th>{{ $t('user_manager.user_group') }}</th>
          <th>{{ $t('user_manager.user_status') }}</th>
          <th><!-- Actions --></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(user, index) in data" :key="index">
          <td>{{ user.user }}</td>
          <td>{{ user.display_name }}</td>
          <td v-if="user.groups.length > 0">{{ user.groups.join(', ') }}</td>
          <td v-else>-</td>
          <td>{{ user.locked }}</td>
          <td class="flex items-center justify-end gap-x-4">
            <NeButton disabled kind="tertiary" size="sm">
              <FontAwesomeIcon :icon="faEdit" class="pr-2" />
              {{ $t('edit') }}
            </NeButton>
            <NeDropdown
              :items="[
                {
                  id: 'lock',
                  label: $t('user_manager.user_lock'),
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
                  disabled: true,
                  label: $t('user_manager.user_delete')
                }
              ]"
              align-to-right
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
