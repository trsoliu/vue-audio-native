<script setup lang="ts">
import {
  Download,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from '@lucide/vue'
import {
  formatMediaTime,
  detectAudioCapabilities,
  normalizeSources,
  type AudioInput,
  type AudioPlayerError,
  type AudioPlayerHandle,
  type AudioSnapshot,
  type AudioTrack,
} from '@trsoliu/audio-core'
import {
  computed,
  getCurrentInstance,
  onMounted,
  ref,
  watch,
} from 'vue'

import type { VueAudioNativeProps } from './types'
import { useAudioPlayer } from './use-audio-player'

// eslint-disable-next-line vue/component-definition-name-casing -- Public Vue 2-era component name.
defineOptions({ name: 'vue-audio-native' })

const props = withDefaults(defineProps<VueAudioNativeProps>(), {
  autoplay: false,
  downloadName: '',
  exclusive: false,
  group: 'default',
  hint: '暂无有效音频...',
  mediaSession: false,
  muted: false,
  playbackRate: 1,
  preload: 'metadata',
  repeatMode: 'off',
  showControls: false,
  showCurrentTime: true,
  showDownload: true,
  showVolume: true,
  size: 'default',
  url: '',
  volume: 1,
  waitBuffer: true,
})

const emit = defineEmits<{
  ended: [snapshot: AudioSnapshot]
  error: [error: AudioPlayerError]
  'on-audioId': [id: string]
  'on-change': [playing: boolean]
  'on-metadata': [event: Event]
  'on-timeupdate': [currentTime: number]
  pause: [snapshot: AudioSnapshot]
  play: [snapshot: AudioSnapshot]
  ready: [snapshot: AudioSnapshot]
  statechange: [snapshot: AudioSnapshot]
  timeupdate: [currentTime: number, snapshot: AudioSnapshot]
  trackchange: [track: AudioTrack | null, trackIndex: number]
}>()

let mountedPlayerCount = 0
const audioId = ref('')
const customControlsSupported = ref(true)
const instance = getCurrentInstance()

function hasSource(input: VueAudioNativeProps['src']): boolean {
  if (typeof input === 'string') return input.trim().length > 0
  if (!input) return false
  if ('src' in input) return input.src.trim().length > 0
  return input.some((source) => hasSource(source))
}

const selectedInput = computed<AudioInput>(() => {
  if (props.tracks && props.tracks.length > 0) return { tracks: props.tracks }
  if (props.src !== undefined && hasSource(props.src)) return { src: props.src }
  if (props.url.trim()) return { src: props.url }
  return {}
})

watch(
  () => [props.tracks?.length ?? 0, hasSource(props.src), props.url.trim()],
  ([trackCount, modernSource, legacySource]) => {
    const inputCount =
      Number(Number(trackCount) > 0) +
      Number(Boolean(modernSource)) +
      Number(Boolean(legacySource))
    if (inputCount > 1) {
      console.warn(
        '[vue-audio-native] Multiple audio inputs were provided. Using tracks, then src, then url.',
      )
    }
  },
  { immediate: true },
)

const playerOptions = computed(() => ({
  ...selectedInput.value,
  autoplay: props.autoplay,
  exclusive: props.exclusive,
  group: props.group,
  mediaSession: props.mediaSession,
  muted: props.muted,
  playbackRate: props.playbackRate,
  preload: props.preload,
  repeatMode: props.repeatMode,
  volume: props.volume,
  waitBuffer: props.waitBuffer,
}))

const { audioRef, controls, snapshot } = useAudioPlayer(playerOptions)

function hasRawProp(camelName: string, kebabName: string): boolean {
  const rawProps = instance?.vnode.props
  return Boolean(
    rawProps &&
      (Object.hasOwn(rawProps, camelName) || Object.hasOwn(rawProps, kebabName)),
  )
}

const useNativeControls = computed(() => {
  if (!customControlsSupported.value) return true
  const modernValue = props.nativeControls
  return hasRawProp('nativeControls', 'native-controls')
    ? modernValue === true
    : props.showControls
})

const duration = computed(() => snapshot.value.duration)
const currentTime = computed(() => snapshot.value.currentTime)
const isPlaying = computed(
  () =>
    snapshot.value.state === 'playing' ||
    snapshot.value.state === 'buffering',
)
const currentSources = computed(() =>
  snapshot.value.track ? normalizeSources(snapshot.value.track.sources) : [],
)
const downloadSource = computed(() => {
  const element = controls.getElement()
  return element?.src || element?.currentSrc || currentSources.value[0]?.src || ''
})
const effectiveDownloadName = computed(
  () => snapshot.value.track?.downloadName ?? props.downloadName,
)
const progressMaximum = computed(() => duration.value ?? 0)
const progressRatio = computed(() => {
  const total = duration.value
  return total && total > 0 ? Math.min(1, currentTime.value / total) : 0
})
const waveform = computed(() => {
  const peaks = snapshot.value.track?.peaks ?? []
  if (peaks.length <= 96) return peaks
  const step = peaks.length / 96
  return Array.from({ length: 96 }, (_, index) => peaks[Math.floor(index * step)] ?? 0)
})

function togglePlayback(): void {
  void controls.toggle().catch(() => undefined)
}

function seekFromInput(event: Event): void {
  controls.seekTo(Number((event.currentTarget as HTMLInputElement).value))
}

function volumeFromInput(event: Event): void {
  controls.setVolume(Number((event.currentTarget as HTMLInputElement).value))
}

function onLoadedMetadata(event: Event): void {
  emit('on-metadata', event)
}

watch(
  snapshot,
  (nextSnapshot, previousSnapshot) => {
    if (nextSnapshot.state !== previousSnapshot.state) {
      emit('statechange', nextSnapshot)
      if (nextSnapshot.state === 'ready') emit('ready', nextSnapshot)
      if (nextSnapshot.state === 'playing') {
        emit('play', nextSnapshot)
        emit('on-change', true)
      }
      if (nextSnapshot.state === 'paused') {
        emit('pause', nextSnapshot)
        emit('on-change', false)
      }
      if (nextSnapshot.state === 'ended') {
        emit('ended', nextSnapshot)
        emit('on-change', false)
      }
    }

    if (nextSnapshot.currentTime !== previousSnapshot.currentTime) {
      emit('timeupdate', nextSnapshot.currentTime, nextSnapshot)
      emit('on-timeupdate', nextSnapshot.currentTime)
    }
    if (
      nextSnapshot.trackIndex !== previousSnapshot.trackIndex ||
      nextSnapshot.track !== previousSnapshot.track
    ) {
      emit('trackchange', nextSnapshot.track, nextSnapshot.trackIndex)
    }
    if (nextSnapshot.error && nextSnapshot.error !== previousSnapshot.error) {
      emit('error', nextSnapshot.error)
    }
  },
  { flush: 'sync' },
)

onMounted(() => {
  mountedPlayerCount += 1
  audioId.value = `vue-audio-native-${mountedPlayerCount}`
  customControlsSupported.value = detectAudioCapabilities(
    controls.getElement(),
  ).customControls
  emit('on-audioId', audioId.value)
})

defineExpose<AudioPlayerHandle>(controls)
</script>

<template>
  <section
    class="audio-native"
    :data-size="size"
    :data-state="snapshot.state"
    :aria-busy="snapshot.state === 'loading' || snapshot.state === 'buffering'"
  >
    <audio
      :id="audioId || undefined"
      ref="audioRef"
      class="audio-native__element"
      :controls="useNativeControls"
      @durationchange="onLoadedMetadata"
      @loadedmetadata="onLoadedMetadata"
    />

    <template v-if="snapshot.track">
      <div class="audio-native__track">
        <slot
          name="artwork"
          :track="snapshot.track"
        >
          <img
            v-if="snapshot.track.artwork?.[0]?.src"
            class="audio-native__artwork"
            :src="snapshot.track.artwork[0].src"
            :alt="snapshot.track.title ? `${snapshot.track.title} artwork` : 'Audio artwork'"
          >
        </slot>
        <div class="audio-native__track-copy">
          <p
            v-if="snapshot.track.title"
            class="audio-native__title"
          >
            {{ snapshot.track.title }}
          </p>
          <p
            v-if="snapshot.track.artist"
            class="audio-native__artist"
          >
            {{ snapshot.track.artist }}
          </p>
        </div>
      </div>

      <div
        v-if="!useNativeControls"
        class="audio-native__custom-controls"
      >
        <slot
          name="before-controls"
          :controls="controls"
          :snapshot="snapshot"
        />

        <div
          v-if="waveform.length"
          class="audio-native__waveform"
          aria-hidden="true"
        >
          <span
            v-for="(peak, index) in waveform"
            :key="index"
            class="audio-native__peak"
            :class="index / waveform.length <= progressRatio ? 'is-active' : ''"
            :style="{ height: `${Math.max(8, Math.min(100, Math.abs(peak) * 100))}%` }"
          />
        </div>

        <input
          class="audio-native__range audio-native__progress"
          type="range"
          min="0"
          :max="progressMaximum"
          step="0.01"
          :value="currentTime"
          :disabled="duration === null"
          aria-label="Audio progress"
          @input="seekFromInput"
        >

        <div class="audio-native__toolbar">
          <button
            v-if="tracks && tracks.length > 1"
            class="audio-native__icon-button"
            type="button"
            aria-label="Previous track"
            title="Previous track"
            @click="void controls.previous()"
          >
            <SkipBack aria-hidden="true" />
          </button>
          <button
            class="audio-native__play-button"
            type="button"
            :aria-label="isPlaying ? 'Pause audio' : 'Play audio'"
            :title="isPlaying ? 'Pause audio' : 'Play audio'"
            @click="togglePlayback"
          >
            <Pause
              v-if="isPlaying"
              aria-hidden="true"
            />
            <Play
              v-else
              aria-hidden="true"
            />
          </button>
          <button
            v-if="tracks && tracks.length > 1"
            class="audio-native__icon-button"
            type="button"
            aria-label="Next track"
            title="Next track"
            @click="void controls.next()"
          >
            <SkipForward aria-hidden="true" />
          </button>

          <span
            v-if="showCurrentTime"
            class="audio-native__time"
          >
            {{ formatMediaTime(currentTime) }} / {{ formatMediaTime(duration) }}
          </span>

          <div
            v-if="showVolume"
            class="audio-native__volume-control"
          >
            <button
              class="audio-native__icon-button"
              type="button"
              :aria-label="snapshot.muted ? 'Unmute audio' : 'Mute audio'"
              :title="snapshot.muted ? 'Unmute audio' : 'Mute audio'"
              @click="controls.setMuted(!snapshot.muted)"
            >
              <VolumeX
                v-if="snapshot.muted"
                aria-hidden="true"
              />
              <Volume2
                v-else
                aria-hidden="true"
              />
            </button>
            <input
              class="audio-native__range audio-native__volume"
              type="range"
              min="0"
              max="1"
              step="0.01"
              :value="snapshot.volume"
              aria-label="Audio volume"
              @input="volumeFromInput"
            >
          </div>

          <a
            v-if="showDownload && downloadSource"
            class="audio-native__icon-button"
            :href="downloadSource"
            :download="effectiveDownloadName"
            aria-label="Download audio"
            title="Download audio"
          >
            <Download aria-hidden="true" />
          </a>
        </div>

        <slot
          name="after-controls"
          :controls="controls"
          :snapshot="snapshot"
        />
      </div>
    </template>

    <div
      v-else
      class="audio-native__hint"
      role="status"
    >
      <slot name="tip">
        <slot name="slotTip">
          {{ hint }}
        </slot>
      </slot>
    </div>
  </section>
</template>
