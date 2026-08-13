<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const { resolvedLocale } = useNumberFormat()
</script>

<template>
  <InputNumber v-bind="$attrs" :locale="resolvedLocale" />
</template>
