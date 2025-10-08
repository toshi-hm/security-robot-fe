<script setup lang="ts">
import { computed } from 'vue'

import TrainingMetrics from '~/components/training/TrainingMetrics.vue'

const route = useRoute()
const sessionId = computed(() => route.params.sessionId as string)
</script>

<template>
  <div>
    <h2>Training Session {{ sessionId }}</h2>
    <TrainingMetrics :metrics="[]" />
  </div>
</template>
