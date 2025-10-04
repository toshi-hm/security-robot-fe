<template>
  <div class="robot-position">
    <el-tag type="info">Robot Position: ({{ position.row }}, {{ position.col }})</el-tag>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ position: { row: number; col: number } }>()
</script>
