<template>
  <div>
    <h2>Playback {{ sessionId }}</h2>
    <PlaybackTimeline v-model="position" :max="100" />
  </div>
</template>

<script setup lang="ts">
import PlaybackTimeline from '~/components/playback/PlaybackTimeline.vue'

const route = useRoute()
const sessionId = computed(() => route.params.sessionId as string)
const position = ref(0)
</script>
