<script setup lang="ts">
defineProps<{ threatMap: number[][] }>()
</script>

<template>
  <el-card>
    <pre>{{ threatMap }}</pre>
  </el-card>
</template>
