<script setup lang="ts">
defineProps<{ position: { row: number; col: number } }>()
</script>

<template>
  <div class="robot-position">
    <el-tag type="info">Robot Position: ({{ position.row }}, {{ position.col }})</el-tag>
  </div>
</template>
