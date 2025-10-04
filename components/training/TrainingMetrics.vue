<script setup lang="ts">
import type { TrainingMetricsEntity } from '~/libs/entities/training/TrainingMetricsEntity'

defineProps<{ metrics: TrainingMetricsEntity | null }>()
</script>

<template>
  <el-card>
    <pre>{{ JSON.stringify(metrics, null, 2) }}</pre>
  </el-card>
</template>
