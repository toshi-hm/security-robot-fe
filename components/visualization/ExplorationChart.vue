<script setup lang="ts">
const canvas = ref<HTMLCanvasElement | null>(null)
</script>

<template>
  <div class="chart-wrapper">
    <canvas ref="canvas" />
  </div>
</template>

<style lang="scss" scoped>
.chart-wrapper {
  min-height: 240px;
  position: relative;
  width: 100%;
}
</style>
