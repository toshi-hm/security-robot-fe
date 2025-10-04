<template>
  <el-card>
    <div class="coverage-map">
      <slot />
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
.coverage-map {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}
</style>
