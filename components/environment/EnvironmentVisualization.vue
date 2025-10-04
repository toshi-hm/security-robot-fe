<script setup lang="ts">
const canvas = ref<HTMLCanvasElement | null>(null)
</script>

<template>
  <div class="environment-visualization">
    <canvas ref="canvas" width="640" height="480" />
  </div>
</template>

<style lang="scss" scoped>
.environment-visualization {
  width: 100%;
  height: 100%;
}
</style>
