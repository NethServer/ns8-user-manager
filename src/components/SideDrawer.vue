<script lang="ts" setup>
import { faX } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { NeButton } from '@nethesis/vue-components'

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
        <div class="fixed inset-0 bg-gray-600/40" />
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
        <DialogPanel
          class="fixed inset-y-0 right-0 overflow-y-auto bg-gray-100 sm:w-120 dark:bg-gray-900"
        >
          <div class="space-y-6 p-6">
            <div class="flex gap-x-2 align-baseline break-all">
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
