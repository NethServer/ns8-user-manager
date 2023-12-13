<script lang="ts" setup>
defineOptions({
  inheritAttrs: false
})

defineProps<{
  title?: string
}>()
</script>

<template>
  <div class="space-y-8">
    <p v-if="title" class="h2">{{ title }}</p>
    <slot name="divider">
      <hr />
    </slot>
    <div class="max-w-4xl" v-bind="$attrs">
      <slot></slot>
    </div>
  </div>
</template>
