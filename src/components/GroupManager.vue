<script setup lang="ts">
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  NeButton,
  NeInlineNotification,
  NeSkeleton,
  NeTextInput
} from '@nethserver/vue-tailwind-lib'
import { useGroups } from '@/composables/useGroups'
import { onMounted } from 'vue'

const { fetch, loading, data, error } = useGroups()

onMounted(() => {
  fetch()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-y-4 sm:flex-row">
      <NeButton class="sm:order-2 sm:ml-auto">
        <template #prefix>
          <FontAwesomeIcon :icon="faPlusCircle" />
        </template>
        {{ $t('user_manager.add_group') }}
      </NeButton>
      <NeTextInput :placeholder="$t('user_manager.search_group')" class="sm:order-1" />
    </div>
    <NeInlineNotification
      v-if="error"
      kind="error"
      :title="$t('errors.generic')"
      :description="$t(error?.message)"
    />
    <NeSkeleton v-if="loading" :lines="10" />
    <!-- TODO: replace with proper table -->
    <table v-else>
      <thead>
        <tr>
          <th>{{ $t('user_manager.group_name') }}</th>
          <th>{{ $t('user_manager.description') }}</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="data?.groups != undefined && data.groups.length > 0">
          <tr v-for="(group, index) in data?.groups" :key="index">
            <td>{{ group.group }}</td>
            <td>{{ group.description }}</td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
