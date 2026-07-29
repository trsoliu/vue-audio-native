<script setup lang="ts">
import { VueAudioNative, type AudioTrack } from 'vue-audio-native'

const tracks: readonly AudioTrack[] = [
  {
    id: 'fixture',
    sources: { src: '/fixture.wav', type: 'audio/wav' },
    title: 'Vite fixture',
  },
]
</script>

<template>
  <main>
    <h1>Vite consumer fixture</h1>
    <VueAudioNative :tracks="tracks" :show-download="false" />
  </main>
</template>
