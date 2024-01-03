<script lang="ts" setup>
import SideDrawer from '@/components/SideDrawer.vue'
import { ref, watch } from 'vue'
import {
  NeButton,
  NeCombobox,
  type NeComboboxOption,
  NeSkeleton,
  NeTextInput
} from '@nethserver/vue-tailwind-lib'
import { useUsers } from '@/composables/useUsers'
import axios from 'axios'

const { comboboxChoices: userComboboxChoices, loading: userLoading } = useUsers()

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits(['success', 'cancel'])

const name = ref('')
const description = ref('')
const users = ref<Array<NeComboboxOption>>([])

const loading = ref(false)
const error = ref<Error>()

watch(
  () => props.show,
  (show) => {
    if (show) {
      name.value = ''
      description.value = ''
      users.value = []
    }
  }
)

async function submit() {
  loading.value = true
  try {
    await axios.post('/api/add-group', {
      group: name.value,
      description: description.value,
      users: users.value.map((user) => user.id)
    })
    emit('success')
  } catch (reason: any) {
    error.value = reason
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <SideDrawer :show="show" :title="$t('user_manager.add_group')" @cancel="$emit('cancel')">
    <template #default>
      <form id="create-group" class="space-y-4" @submit.prevent="submit">
        <NeTextInput
          v-model="name"
          :disabled="loading"
          :label="$t('user_manager.group_name')"
          required
        />
        <NeTextInput
          v-model="description"
          :disabled="loading"
          :label="$t('user_manager.group_description')"
          required
        />
        <NeSkeleton v-if="userLoading" :lines="2" />
        <NeCombobox
          v-else
          v-model="users"
          :disabled="loading"
          :label="$t('user_manager.users')"
          :options="userComboboxChoices"
          :placeholder="$t('user_manager.choose_users')"
          multiple
          name="users"
        />
      </form>
    </template>
    <template #footer>
      <div class="flex flex-col justify-end gap-4 sm:flex-row">
        <NeButton :disabled="loading" kind="tertiary" @click="$emit('cancel')">
          {{ $t('user_manager.cancel') }}
        </NeButton>
        <NeButton
          :disabled="loading"
          :loading="loading"
          form="create-group"
          kind="primary"
          type="submit"
        >
          {{ $t('user_manager.add_group') }}
        </NeButton>
      </div>
    </template>
  </SideDrawer>
</template>
