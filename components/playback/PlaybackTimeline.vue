<script setup lang="ts">
const props = defineProps<{ modelValue: number; max: number }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: number): void }>()

const internalValue = useVModel(props, 'modelValue', emit)

const onChange = (value: number) => emit('update:modelValue', value)
</script>

<template>
  <el-slider v-model="internalValue" :max="max" @change="onChange" />
</template>
