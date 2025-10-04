<template>
  <el-select v-model="internalValue" placeholder="Speed">
    <el-option
      v-for="option in options"
      :key="option"
      :label="`${option}x`"
      :value="option"
    />
  </el-select>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: number; options?: number[] }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: number): void }>()

const internalValue = useVModel(props, 'modelValue', emit)

const options = computed(() => props.options ?? [0.5, 1, 2, 4])
</script>
