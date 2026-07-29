<script setup lang="ts">
import {
  createAudioController,
  detectAudioCapabilities,
  type AudioBridgeEvent,
  type AudioRuntimeCapabilities,
  type AudioSnapshot,
} from '@trsoliu/audio-core'
import { onBeforeUnmount, onMounted, ref } from 'vue'

import { createToneUrl } from './tone'

const audio = ref<HTMLAudioElement | null>(null)
const capabilities = ref<AudioRuntimeCapabilities | null>(null)
const events = ref<AudioBridgeEvent[]>([])
const toneUrl = createToneUrl()
const controller = createAudioController({
  bridge: {
    emit(event) {
      events.value = [event, ...events.value].slice(0, 12)
    },
  },
  src: { src: toneUrl, type: 'audio/wav' },
})
const snapshot = ref<AudioSnapshot>(controller.getSnapshot())
const unsubscribe = controller.subscribe((next) => {
  snapshot.value = next
})

onMounted(() => {
  controller.attach(audio.value)
  capabilities.value = detectAudioCapabilities(audio.value)
})

onBeforeUnmount(() => {
  unsubscribe()
  controller.destroy()
  URL.revokeObjectURL(toneUrl)
})
</script>

<template>
  <main>
    <header>
      <p class="eyebrow">AUDIO NATIVE / CAPABILITY PROBE</p>
      <h1>Browser &amp; WebView compatibility lab</h1>
      <p>
        A UA-independent harness for Chromium, Gecko, WebKit, WKWebView and ArkWeb device-cloud runs.
      </p>
    </header>

    <section aria-labelledby="capability-heading">
      <h2 id="capability-heading">Runtime capabilities</h2>
      <dl v-if="capabilities" class="matrix">
        <div v-for="(value, name) in capabilities" :key="name">
          <dt>{{ name }}</dt>
          <dd :data-supported="value">{{ value ? 'available' : 'fallback' }}</dd>
        </div>
      </dl>
    </section>

    <section aria-labelledby="player-heading">
      <h2 id="player-heading">Native media probe</h2>
      <audio ref="audio" controls preload="metadata" />
      <div class="controls">
        <button type="button" @click="void controller.play()">Play</button>
        <button type="button" @click="controller.pause()">Pause</button>
        <button type="button" @click="controller.skipBy(5)">Skip +5</button>
        <button type="button" @click="controller.setPlaybackRate(1.5)">1.5×</button>
      </div>
      <pre>{{ JSON.stringify(snapshot, null, 2) }}</pre>
    </section>

    <section aria-labelledby="bridge-heading">
      <h2 id="bridge-heading">Host bridge events</h2>
      <ol aria-live="polite">
        <li v-for="(event, index) in events" :key="`${event.type}-${index}`">
          {{ event.type }} · {{ event.snapshot.state }}
        </li>
      </ol>
    </section>
  </main>
</template>
