<template>
  <div class="chart-wrapper">
    <canvas ref="canvas" />
  </div>
</template>

<script setup lang="ts">
const canvas = ref<HTMLCanvasElement | null>(null)
</script>

<style lang="scss" scoped>
.chart-wrapper {
  position: relative;
  width: 100%;
  min-height: 240px;
}
</style>
