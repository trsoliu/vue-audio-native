import {
  onScopeDispose,
  shallowRef,
  toValue,
  watch,
} from 'vue'

import {
  createAudioController,
  type AudioControllerOptions,
  type AudioInput,
  type AudioSnapshot,
} from '@trsoliu/audio-core'

import type {
  UseAudioPlayerOptions,
  UseAudioPlayerResult,
} from './types'

function runtimeOptions(options: AudioControllerOptions): AudioControllerOptions {
  const nextOptions: AudioControllerOptions = {
    autoplay: options.autoplay ?? false,
    bridge: options.bridge ?? null,
    exclusive: options.exclusive ?? false,
    group: options.group ?? 'default',
    mediaSession: options.mediaSession ?? false,
    muted: options.muted ?? false,
    playbackRate: options.playbackRate ?? 1,
    preload: options.preload ?? 'metadata',
    repeatMode: options.repeatMode ?? 'off',
    volume: options.volume ?? 1,
    waitBuffer: options.waitBuffer ?? true,
  }
  return nextOptions
}

function audioInput(options: AudioControllerOptions): AudioInput {
  const input: AudioInput = {}
  if (options.src !== undefined) input.src = options.src
  if (options.tracks !== undefined) input.tracks = options.tracks
  return input
}

export function useAudioPlayer(
  options: UseAudioPlayerOptions = {},
): UseAudioPlayerResult {
  const getOptions = (): AudioControllerOptions => toValue(options)
  const controller = createAudioController(getOptions())
  const audioRef = shallowRef<HTMLAudioElement | null>(null)
  const snapshot = shallowRef<AudioSnapshot>(controller.getSnapshot())
  const unsubscribe = controller.subscribe((nextSnapshot) => {
    snapshot.value = nextSnapshot
  })

  watch(
    audioRef,
    (element) => controller.attach(element),
    { flush: 'sync' },
  )
  watch(
    () => runtimeOptions(getOptions()),
    (nextOptions) => controller.updateOptions(nextOptions),
    { deep: true, flush: 'sync' },
  )
  const updateInput = (): void => controller.setInput(audioInput(getOptions()))
  watch(
    () => JSON.stringify(audioInput(getOptions())),
    () => updateInput(),
    { flush: 'sync' },
  )

  onScopeDispose(() => {
    unsubscribe()
    controller.destroy()
  })

  return {
    audioRef,
    controls: controller,
    snapshot,
  }
}
