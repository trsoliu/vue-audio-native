<script setup lang="ts">
import { VueAudioNative, type AudioTrack } from 'vue-audio-native'

const tracks: readonly AudioTrack[] = [
  {
    id: 'nuxt-fixture',
    sources: { src: '/fixture.wav', type: 'audio/wav' },
    title: 'Nuxt SSR fixture',
  },
]
</script>

<template>
  <main>
    <h1>Nuxt SSR consumer fixture</h1>
    <ClientOnly>
      <VueAudioNative :tracks="tracks" :show-download="false" />
    </ClientOnly>
  </main>
</template>
