<script lang="ts" setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faX } from '@fortawesome/free-solid-svg-icons'
import { NeButton } from '@nethesis/vue-components'
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'

defineProps<{
  show: boolean
  title: string
}>()

defineEmits(['cancel'])
</script>

<template>
  <TransitionRoot :show="show" as="template">
    <Dialog @close="$emit('cancel')">
      <TransitionChild
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-600 bg-opacity-40" />
      </TransitionChild>
      <TransitionChild
        as="template"
        enter="transition ease-in-out duration-300 transform"
        enter-from="translate-x-full"
        enter-to="translate-x-0"
        leave="transition ease-in-out duration-300 transform"
        leave-from="translate-x-0"
        leave-to="translate-x-full"
      >
        <DialogPanel class="fixed inset-y-0 right-0 bg-gray-100 sm:w-[30rem] dark:bg-gray-900">
          <div class="flex flex-col gap-y-6 overflow-y-auto p-6">
            <div class="flex gap-x-2 break-all align-baseline">
              <p class="text-xl font-medium">{{ title }}</p>
              <NeButton class="ml-auto self-center" kind="tertiary" @click="$emit('cancel')">
                <FontAwesomeIcon :icon="faX" class="text-gray-600 dark:text-white" />
              </NeButton>
            </div>
            <hr />
            <slot></slot>
            <hr v-if="$slots.footer" />
            <slot name="footer"></slot>
          </div>
        </DialogPanel>
      </TransitionChild>
    </Dialog>
  </TransitionRoot>
</template>
