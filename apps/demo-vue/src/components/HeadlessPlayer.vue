<script setup lang="ts">
import { Pause, Play, RotateCcw } from '@lucide/vue'
import { computed } from 'vue'
import { formatMediaTime, useAudioPlayer } from 'vue-audio-native'

import { Button } from '@/components/ui/button'

const props = defineProps<{ src: string }>()
const options = computed(() => ({ src: props.src }))
const player = useAudioPlayer(options)
const { controls, snapshot } = player

const playing = computed(
  () => snapshot.value.state === 'playing' || snapshot.value.state === 'buffering',
)

function seek(event: Event): void {
  controls.seekTo(Number((event.currentTarget as HTMLInputElement).value))
}

function setAudioElement(element: unknown): void {
  player.audioRef.value = element instanceof HTMLAudioElement ? element : null
}
</script>

<template>
  <div class="flex flex-col gap-3 rounded-xl border bg-muted/30 p-4">
    <audio :ref="setAudioElement" />
    <div class="flex items-center gap-2">
      <Button
        size="icon"
        :aria-label="playing ? 'Pause headless player' : 'Play headless player'"
        @click="void controls.toggle()"
      >
        <Pause v-if="playing" aria-hidden="true" />
        <Play v-else aria-hidden="true" />
      </Button>
      <Button size="icon" variant="outline" aria-label="Restart headless player" @click="controls.stop()">
        <RotateCcw aria-hidden="true" />
      </Button>
      <input
        class="h-2 min-w-0 flex-1 accent-primary"
        type="range"
        min="0"
        :max="snapshot.duration ?? 0"
        step="0.01"
        :value="snapshot.currentTime"
        aria-label="Headless player progress"
        @input="seek"
      >
      <span class="text-xs tabular-nums text-muted-foreground">
        {{ formatMediaTime(snapshot.currentTime) }} / {{ formatMediaTime(snapshot.duration) }}
      </span>
    </div>
    <code class="text-xs text-muted-foreground">state: {{ snapshot.state }}</code>
  </div>
</template>
