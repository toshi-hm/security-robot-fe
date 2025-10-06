<script setup lang="ts">
import type { TrainingMetrics } from '~/libs/domains/training/TrainingMetrics'

defineProps<{ metrics: TrainingMetrics[] }>()
</script>

<template>
  <el-card>
    <pre>{{ JSON.stringify(metrics, null, 2) }}</pre>
  </el-card>
</template>
