<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  strengthEnforced: boolean
  complexityCheck: boolean
  minimumPasswordLength: number
  minimumUppercaseCharacters: number
  minimumLowercaseCharacters: number
  minimumNumberCharacters: number
  minimumSpecialCharacters: number
}>()
</script>

<template>
  <ul v-if="strengthEnforced" class="description-text ml-6 list-disc">
    <li>{{ t('account_settings.minimum_characters', minimumPasswordLength) }}</li>
    <template v-if="complexityCheck">
      <li>{{ t('account_settings.minimum_uppercase', minimumUppercaseCharacters) }}</li>
      <li>{{ t('account_settings.minimum_lowercase', minimumLowercaseCharacters) }}</li>
      <li>{{ t('account_settings.minimum_number', minimumNumberCharacters) }}</li>
      <li>{{ t('account_settings.minimum_special', minimumSpecialCharacters) }}</li>
    </template>
  </ul>
</template>
