<script setup lang="ts">
defineProps<{
  progress: number
  status?: 'success' | 'warning' | 'exception'
}>()
</script>

<template>
  <el-progress :percentage="Math.round(progress * 100)" :status="status" />
</template>
