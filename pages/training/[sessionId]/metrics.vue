<script setup lang="ts">
import { computed } from 'vue'

import RewardChart from '~/components/visualization/RewardChart.vue'

const route = useRoute()
const sessionId = computed(() => route.params.sessionId as string)
</script>

<template>
  <div class="metrics-page">
    <h2 class="metrics-page__title">Metrics for Session {{ sessionId }}</h2>
    <RewardChart />
  </div>
</template>

<style lang="scss" scoped>
.metrics-page {
  padding: 20px;

  &__title {
    color: var(--md-on-background);
    font-size: 1.75rem;
    font-weight: 600;
    margin-bottom: 20px;
  }
}
</style>
