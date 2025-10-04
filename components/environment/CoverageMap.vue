<template>
  <el-card>
    <div class="coverage-map">
      <slot />
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
.coverage-map {
  align-items: center;
  display: flex;
  justify-content: center;
  min-height: 200px;
}
</style>
