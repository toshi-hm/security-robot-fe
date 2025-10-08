<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ modelValue: number; options?: number[] }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: number): void }>()

const options = computed(() => props.options ?? [0.5, 1, 2, 4])

const handleUpdate = (value: number) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <el-select :model-value="modelValue" placeholder="Speed" @update:model-value="handleUpdate">
    <el-option v-for="option in options" :key="option" :label="`${option}x`" :value="option" />
  </el-select>
</template>
