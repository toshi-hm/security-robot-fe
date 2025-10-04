<template>
  <el-card>
    <pre>{{ threatMap }}</pre>
  </el-card>
</template>

<script setup lang="ts">
const props = defineProps<{ threatMap: number[][] }>()
</script>
