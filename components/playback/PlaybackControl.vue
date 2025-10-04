<template>
  <el-space>
    <el-button @click="emit('play')" type="primary">Play</el-button>
    <el-button @click="emit('pause')">Pause</el-button>
    <el-button @click="emit('stop')" type="danger">Stop</el-button>
  </el-space>
</template>

<script setup lang="ts">
const emit = defineEmits<{ (e: 'play'): void; (e: 'pause'): void; (e: 'stop'): void }>()
</script>
