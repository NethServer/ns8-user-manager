<script lang="ts" setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faX } from '@fortawesome/free-solid-svg-icons'
import { NeButton } from '@nethserver/vue-tailwind-lib'

defineProps<{
  show: boolean
  title: string
}>()

defineEmits(['cancel'])
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="show"
        class="absolute bottom-0 left-0 right-0 top-0 bg-gray-600 bg-opacity-40"
        @click="$emit('cancel')"
      ></div>
    </Transition>
    <Transition name="slide">
      <div
        v-if="show"
        class="absolute right-0 top-0 flex h-full w-screen flex-col gap-y-6 bg-gray-900 p-6 sm:w-[30rem]"
      >
        <div class="flex gap-x-2 break-all align-baseline">
          <p class="text-xl font-medium">{{ title }}</p>
          <NeButton kind="tertiary" class="ml-auto self-center" @click="$emit('cancel')">
            <FontAwesomeIcon class="text-white" :icon="faX" />
          </NeButton>
        </div>
        <hr />
        <slot></slot>
        <hr v-if="$slots.footer" />
        <slot name="footer"></slot>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
