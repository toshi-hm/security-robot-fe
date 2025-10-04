<template>
  <el-alert v-if="message" :title="message" type="error" show-icon />
</template>

<script setup lang="ts">
const props = defineProps<{ message?: string }>()
</script>
