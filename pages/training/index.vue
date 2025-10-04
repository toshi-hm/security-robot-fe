<script setup lang="ts">
import TrainingControl from '~/components/training/TrainingControl.vue'
import TrainingProgress from '~/components/training/TrainingProgress.vue'

const handleStart = () => {
  // Placeholder for training start handler
}
</script>

<template>
  <div>
    <h2>Training Sessions</h2>
    <TrainingControl @start="handleStart" />
    <TrainingProgress :progress="0" />
  </div>
</template>
