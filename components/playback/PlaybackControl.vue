<script setup lang="ts">
const emit = defineEmits<{ (e: 'play'): void; (e: 'pause'): void; (e: 'stop'): void }>()
</script>

<template>
  <el-space>
    <el-button type="primary" @click="emit('play')">Play</el-button>
    <el-button @click="emit('pause')">Pause</el-button>
    <el-button type="danger" @click="emit('stop')">Stop</el-button>
  </el-space>
</template>
