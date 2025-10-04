<script setup lang="ts">
defineProps<{ message?: string }>()
</script>

<template>
  <el-alert v-if="message" :title="message" type="error" show-icon />
</template>
