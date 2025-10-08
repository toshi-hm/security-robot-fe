<script setup lang="ts">
import { ref } from 'vue'

const canvas = ref<HTMLCanvasElement | null>(null)
</script>

<template>
  <div class="environment-visualization">
    <canvas ref="canvas" width="640" height="480" />
  </div>
</template>

<style lang="scss" scoped>
.environment-visualization {
  height: 100%;
  width: 100%;
}
</style>
