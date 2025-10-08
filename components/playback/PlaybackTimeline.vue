<script setup lang="ts">
defineProps<{ modelValue: number; max: number }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: number): void }>()

const onChange = (value: number | number[]) => {
  const numValue = Array.isArray(value) ? (value[0] ?? 0) : value
  emit('update:modelValue', numValue)
}
</script>

<template>
  <el-slider :model-value="modelValue" :max="max" @change="onChange" />
</template>
