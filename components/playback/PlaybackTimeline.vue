<script setup lang="ts">
defineProps<{ modelValue: number; max: number }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: number): void }>()

const onChange = (value: number) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <el-slider :model-value="modelValue" :max="max" @change="onChange" />
</template>
