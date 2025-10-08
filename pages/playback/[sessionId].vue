<script setup lang="ts">
import { ref, computed } from 'vue'

import PlaybackTimeline from '~/components/playback/PlaybackTimeline.vue'

const route = useRoute()
const sessionId = computed(() => route.params.sessionId as string)
const position = ref(0)
</script>

<template>
  <div>
    <h2>Playback {{ sessionId }}</h2>
    <PlaybackTimeline v-model="position" :max="100" />
  </div>
</template>
