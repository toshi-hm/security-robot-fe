<script setup lang="ts">
interface Props {
  modelValue: string
  placeholder?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'search', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search...',
})

const emit = defineEmits<Emits>()

const handleInput = (value: string) => {
  emit('update:modelValue', value)
}

const handleSearch = () => {
  emit('search', props.modelValue)
}
</script>

<template>
  <el-input
    :model-value="modelValue"
    :placeholder="placeholder"
    clearable
    class="search-filter"
    @update:model-value="handleInput"
    @keyup.enter="handleSearch"
  >
    <template #prefix>
      <el-icon><Search /></el-icon>
    </template>
  </el-input>
</template>

<style scoped lang="scss">
.search-filter {
  width: 100%;
}
</style>
