<template>
  <div>
    <h2>Playback Sessions</h2>
    <PlaybackControl @play="noop" @pause="noop" @stop="noop" />
  </div>
</template>

<script setup lang="ts">
import PlaybackControl from '~/components/playback/PlaybackControl.vue'

const noop = () => {}
</script>
