<template>
  <el-card class="training-control">
    <slot name="form" />
    <el-button type="primary" @click="onStart">Start Training</el-button>
  </el-card>
</template>

<script setup lang="ts">
const emit = defineEmits<{ (e: 'start'): void }>()

const onStart = () => emit('start')
</script>

<style lang="scss" scoped>
.training-control {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
