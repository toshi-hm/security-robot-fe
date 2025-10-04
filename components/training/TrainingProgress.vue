<template>
  <el-progress :percentage="Math.round(progress * 100)" :status="status" />
</template>

<script setup lang="ts">
const props = defineProps<{
  progress: number
  status?: 'success' | 'warning' | 'exception'
}>()
</script>
