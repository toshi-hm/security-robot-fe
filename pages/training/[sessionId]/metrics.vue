<script setup lang="ts">
import { computed } from 'vue'

import RewardChart from '~/components/visualization/RewardChart.vue'

const route = useRoute()
const sessionId = computed(() => route.params.sessionId as string)
</script>

<template>
  <div>
    <h2>Metrics for Session {{ sessionId }}</h2>
    <RewardChart />
  </div>
</template>
