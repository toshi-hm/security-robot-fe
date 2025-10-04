<template>
  <el-form label-position="top" class="configuration-panel">
    <slot />
  </el-form>
</template>

<style lang="scss" scoped>
.configuration-panel {
  display: grid;
  gap: 1rem;
}
</style>
