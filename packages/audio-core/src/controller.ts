import { announcePlayback, registerCoordinatorClient } from './coordinator'
import { AudioControllerError, fromMediaError, fromPlayError } from './errors'
import { normalizeInput, normalizeSources } from './source'
import type {
  AudioController,
  AudioControllerOptions,
  AudioBridgeEvent,
  AudioInput,
  AudioPlayerError,
  AudioSnapshot,
  AudioSnapshotListener,
  AudioSource,
  BufferedRange,
  RepeatMode,
} from './types'

const DEFAULT_GROUP = 'default'
const MEDIA_SESSION_ACTIONS: readonly MediaSessionAction[] = [
  'nexttrack',
  'pause',
  'play',
  'previoustrack',
  'seekbackward',
  'seekforward',
  'seekto',
  'stop',
]

let activeMediaSessionOwner: string | null = null

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value))

const finiteOrNull = (value: number): number | null =>
  Number.isFinite(value) && value >= 0 ? value : null

function readBuffered(buffered: TimeRanges): BufferedRange[] {
  const ranges: BufferedRange[] = []
  for (let index = 0; index < buffered.length; index += 1) {
    try {
      ranges.push({ start: buffered.start(index), end: buffered.end(index) })
    } catch {
      break
    }
  }
  return ranges
}

let instanceCounter = 0

export function createAudioController(
  initialOptions: AudioControllerOptions = {},
): AudioController {
  const id = `audio-controller-${++instanceCounter}`
  let options: AudioControllerOptions = { ...initialOptions }
  let tracks = normalizeInput(initialOptions)
  let trackIndex = tracks.length > 0 ? 0 : -1
  let element: HTMLAudioElement | null = null
  let sourceIndex = -1
  let destroyed = false
  let animationFrame: number | null = null
  const listeners = new Set<AudioSnapshotListener>()

  let snapshot: AudioSnapshot = Object.freeze({
    buffered: [],
    currentTime: 0,
    duration: null,
    error: null,
    muted: options.muted ?? false,
    playbackRate: clamp(options.playbackRate ?? 1, 0.25, 4),
    repeatMode: options.repeatMode ?? 'off',
    state: 'idle',
    track: tracks[trackIndex] ?? null,
    trackIndex,
    volume: clamp(options.volume ?? 1, 0, 1),
  })

  function emitBridge(event: AudioBridgeEvent): void {
    try {
      options.bridge?.emit(event)
    } catch {
      // Host bridges are optional integration points and cannot break playback.
    }
  }

  function emit(next: AudioSnapshot): void {
    const previous = snapshot
    snapshot = Object.freeze(next)
    if (snapshot.state !== previous.state) {
      emitBridge({ snapshot, type: 'statechange' })
    }
    if (
      snapshot.trackIndex !== previous.trackIndex ||
      snapshot.track !== previous.track
    ) {
      emitBridge({
        snapshot,
        track: snapshot.track,
        trackIndex: snapshot.trackIndex,
        type: 'trackchange',
      })
    }
    if (snapshot.error && snapshot.error !== previous.error) {
      emitBridge({ error: snapshot.error, snapshot, type: 'error' })
    }
    for (const listener of listeners) listener(snapshot)
  }

  function patch(values: Partial<AudioSnapshot>): void {
    emit({ ...snapshot, ...values })
  }

  function syncMediaValues(): void {
    if (!element) return
    patch({
      buffered: readBuffered(element.buffered),
      currentTime: Number.isFinite(element.currentTime)
        ? Math.max(0, element.currentTime)
        : 0,
      duration: finiteOrNull(element.duration),
      muted: element.muted,
      playbackRate: element.playbackRate,
      volume: element.volume,
    })
  }

  function stopProgressLoop(): void {
    if (animationFrame === null || typeof cancelAnimationFrame !== 'function') {
      animationFrame = null
      return
    }
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }

  function startProgressLoop(): void {
    if (
      animationFrame !== null ||
      typeof requestAnimationFrame !== 'function'
    ) {
      return
    }

    const update = (): void => {
      if (!element || element.paused || destroyed) {
        animationFrame = null
        return
      }
      syncMediaValues()
      animationFrame = requestAnimationFrame(update)
    }

    animationFrame = requestAnimationFrame(update)
  }

  function currentSources(): AudioSource[] {
    const track = tracks[trackIndex]
    return track ? normalizeSources(track.sources) : []
  }

  function chooseSource(sources: readonly AudioSource[]): number {
    if (!element) return sources.length > 0 ? 0 : -1
    const supported = sources.findIndex(
      (source) => !source.type || element?.canPlayType(source.type) !== '',
    )
    return supported >= 0 ? supported : sources.length > 0 ? 0 : -1
  }

  function setFatalError(error: AudioPlayerError): void {
    stopProgressLoop()
    patch({ error, state: 'error' })
  }

  function updateMediaSessionMetadata(): void {
    if (
      !options.mediaSession ||
      typeof navigator === 'undefined' ||
      !('mediaSession' in navigator)
    ) {
      return
    }

    const track = tracks[trackIndex]
    if (!track || typeof MediaMetadata === 'undefined') return
    const metadata: MediaMetadataInit = { title: track.title ?? '' }
    if (track.album !== undefined) metadata.album = track.album
    if (track.artist !== undefined) metadata.artist = track.artist
    if (track.artwork !== undefined) metadata.artwork = track.artwork
    navigator.mediaSession.metadata = new MediaMetadata(metadata)
  }

  function applyElementOptions(): void {
    if (!element) return
    element.autoplay = options.autoplay ?? false
    element.muted = snapshot.muted
    element.playbackRate = snapshot.playbackRate
    element.preload = options.preload ?? 'metadata'
    element.volume = snapshot.volume
  }

  function loadSource(index: number): void {
    if (!element) return
    const sources = currentSources()
    const source = sources[index]
    if (!source) {
      setFatalError(
        new AudioControllerError(
          'SOURCE_NOT_SUPPORTED',
          'No playable audio source was provided.',
        ),
      )
      return
    }

    sourceIndex = index
    element.src = source.src
    patch({
      buffered: [],
      currentTime: 0,
      duration: null,
      error: null,
      state: 'loading',
      track: tracks[trackIndex] ?? null,
      trackIndex,
    })
    updateMediaSessionMetadata()
    element.load()
  }

  async function loadTrack(shouldPlay: boolean): Promise<void> {
    if (!element) return
    const sources = currentSources()
    sourceIndex = chooseSource(sources)
    loadSource(sourceIndex)
    if (shouldPlay && snapshot.state !== 'error') await play()
  }

  function onLoadStart(): void {
    patch({ error: null, state: 'loading' })
  }

  function onLoadedMetadata(): void {
    syncMediaValues()
  }

  function onCanPlay(): void {
    if (snapshot.state !== 'playing') patch({ state: 'ready' })
  }

  function onPlay(): void {
    patch({ error: null, state: 'playing' })
    announcePlayback(coordinatorClient)
    activateMediaSession()
    startProgressLoop()
  }

  function onPause(): void {
    stopProgressLoop()
    if (snapshot.state !== 'ended' && snapshot.state !== 'error') {
      patch({ state: 'paused' })
    }
    updateMediaSessionPlaybackState('paused')
  }

  function onPlaying(): void {
    patch({ error: null, state: 'playing' })
    updateMediaSessionPlaybackState('playing')
    startProgressLoop()
  }

  function onWaiting(): void {
    if (element && !element.paused) patch({ state: 'buffering' })
  }

  function onTimeUpdate(): void {
    syncMediaValues()
  }

  function onVolumeChange(): void {
    if (!element) return
    patch({ muted: element.muted, volume: element.volume })
  }

  function onRateChange(): void {
    if (element) patch({ playbackRate: element.playbackRate })
  }

  function onError(): void {
    const sources = currentSources()
    const nextIndex = sourceIndex + 1
    if (nextIndex < sources.length) {
      const shouldResume =
        snapshot.state === 'playing' || snapshot.state === 'buffering'
      loadSource(nextIndex)
      if (shouldResume || options.autoplay === true) {
        void play().catch(() => undefined)
      }
      return
    }
    setFatalError(fromMediaError(element?.error ?? null))
  }

  async function onEnded(): Promise<void> {
    stopProgressLoop()
    if (snapshot.repeatMode === 'one') {
      seekTo(0)
      await play().catch(() => undefined)
      return
    }

    if (trackIndex < tracks.length - 1) {
      await changeTrack(trackIndex + 1, true).catch(() => undefined)
      return
    }

    if (snapshot.repeatMode === 'all' && tracks.length > 0) {
      await changeTrack(0, true).catch(() => undefined)
      return
    }

    patch({ state: 'ended' })
    updateMediaSessionPlaybackState('none')
  }

  const eventHandlers: Readonly<Record<string, EventListener>> = {
    canplay: onCanPlay,
    durationchange: onLoadedMetadata,
    ended: () => void onEnded(),
    error: onError,
    loadedmetadata: onLoadedMetadata,
    loadstart: onLoadStart,
    pause: onPause,
    play: onPlay,
    playing: onPlaying,
    progress: onTimeUpdate,
    ratechange: onRateChange,
    stalled: onWaiting,
    timeupdate: onTimeUpdate,
    volumechange: onVolumeChange,
    waiting: onWaiting,
  }

  function addElementListeners(): void {
    if (!element) return
    for (const [event, handler] of Object.entries(eventHandlers)) {
      element.addEventListener(event, handler)
    }
  }

  function removeElementListeners(): void {
    if (!element) return
    for (const [event, handler] of Object.entries(eventHandlers)) {
      element.removeEventListener(event, handler)
    }
  }

  async function play(): Promise<void> {
    if (!element || trackIndex < 0) {
      const error = new AudioControllerError(
        'SOURCE_NOT_SUPPORTED',
        'Attach an audio element and provide a source before playing.',
      )
      setFatalError(error)
      throw error
    }

    try {
      await element.play()
    } catch (cause) {
      const error = fromPlayError(cause)
      patch({
        error,
        state:
          snapshot.state === 'loading' || snapshot.state === 'ready'
            ? 'ready'
            : 'paused',
      })
      throw error
    }
  }

  function pause(): void {
    element?.pause()
  }

  async function toggle(): Promise<void> {
    if (!element || element.paused) await play()
    else pause()
  }

  function seekTo(seconds: number): void {
    if (!element || !Number.isFinite(seconds)) return
    const duration = finiteOrNull(element.duration)
    let target = clamp(seconds, 0, duration ?? Number.MAX_SAFE_INTEGER)

    if (options.waitBuffer === false) {
      const ranges = readBuffered(element.buffered)
      const maximumBuffered = ranges.reduce(
        (maximum, range) => Math.max(maximum, range.end),
        0,
      )
      target = Math.min(target, maximumBuffered)
    }

    if (typeof element.fastSeek === 'function') element.fastSeek(target)
    else element.currentTime = target
    syncMediaValues()
  }

  function skipBy(seconds: number): void {
    seekTo((element?.currentTime ?? snapshot.currentTime) + seconds)
  }

  async function changeTrack(index: number, shouldPlay: boolean): Promise<void> {
    if (!Number.isInteger(index) || index < 0 || index >= tracks.length) {
      throw new RangeError(`Track index ${index} is out of range.`)
    }
    trackIndex = index
    await loadTrack(shouldPlay)
  }

  async function selectTrack(index: number): Promise<void> {
    const shouldPlay =
      Boolean(element && !element.paused) || options.autoplay === true
    await changeTrack(index, shouldPlay)
  }

  async function previous(): Promise<void> {
    if (snapshot.currentTime > 3) {
      seekTo(0)
      return
    }
    if (trackIndex > 0) await selectTrack(trackIndex - 1)
    else if (snapshot.repeatMode === 'all' && tracks.length > 0) {
      await selectTrack(tracks.length - 1)
    } else seekTo(0)
  }

  async function next(): Promise<void> {
    if (trackIndex < tracks.length - 1) await selectTrack(trackIndex + 1)
    else if (snapshot.repeatMode === 'all' && tracks.length > 0) {
      await selectTrack(0)
    } else patch({ state: 'ended' })
  }

  function stop(): void {
    pause()
    seekTo(0)
  }

  function setVolume(volume: number): void {
    const next = clamp(volume, 0, 1)
    if (element) element.volume = next
    patch({ volume: next })
  }

  function setMuted(muted: boolean): void {
    if (element) element.muted = muted
    patch({ muted })
  }

  function setPlaybackRate(playbackRate: number): void {
    const next = clamp(playbackRate, 0.25, 4)
    if (element) element.playbackRate = next
    patch({ playbackRate: next })
  }

  function setRepeatMode(repeatMode: RepeatMode): void {
    patch({ repeatMode })
  }

  function setInput(input: AudioInput): void {
    tracks = normalizeInput(input)
    trackIndex = tracks.length > 0 ? 0 : -1
    sourceIndex = -1
    patch({
      buffered: [],
      currentTime: 0,
      duration: null,
      error: null,
      state: tracks.length > 0 && element ? 'loading' : 'idle',
      track: tracks[trackIndex] ?? null,
      trackIndex,
    })

    if (element) {
      if (trackIndex >= 0) void loadTrack(options.autoplay === true)
      else {
        element.pause()
        element.removeAttribute('src')
        element.load()
        patch({ state: 'idle' })
      }
    }
  }

  function updateOptions(nextOptions: Partial<AudioControllerOptions>): void {
    const mediaSessionWasEnabled = options.mediaSession === true
    options = { ...options, ...nextOptions }
    if (mediaSessionWasEnabled && options.mediaSession !== true) {
      releaseMediaSession()
    }
    if ('src' in nextOptions || 'tracks' in nextOptions) {
      const input: AudioInput = {}
      if (nextOptions.src !== undefined) input.src = nextOptions.src
      if (nextOptions.tracks !== undefined) input.tracks = nextOptions.tracks
      setInput(input)
    }
    if (nextOptions.repeatMode) setRepeatMode(nextOptions.repeatMode)
    if (nextOptions.volume !== undefined) setVolume(nextOptions.volume)
    if (nextOptions.muted !== undefined) setMuted(nextOptions.muted)
    if (nextOptions.playbackRate !== undefined) {
      setPlaybackRate(nextOptions.playbackRate)
    }
    applyElementOptions()
    updateMediaSessionMetadata()
  }

  function attach(nextElement: HTMLAudioElement | null): void {
    if (element === nextElement) return
    removeElementListeners()
    stopProgressLoop()
    element = nextElement
    if (!element) return
    applyElementOptions()
    addElementListeners()
    if (trackIndex >= 0) {
      void loadTrack(options.autoplay === true).catch(() => undefined)
    }
  }

  function subscribe(listener: AudioSnapshotListener): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  function updateMediaSessionPlaybackState(
    state: MediaSessionPlaybackState,
  ): void {
    if (
      options.mediaSession &&
      typeof navigator !== 'undefined' &&
      'mediaSession' in navigator
    ) {
      navigator.mediaSession.playbackState = state
    }
  }

  function activateMediaSession(): void {
    if (
      !options.mediaSession ||
      typeof navigator === 'undefined' ||
      !('mediaSession' in navigator)
    ) {
      return
    }
    updateMediaSessionMetadata()
    const handlers: Partial<Record<MediaSessionAction, MediaSessionActionHandler>> = {
      nexttrack: () => void next(),
      pause,
      play: () => void play(),
      previoustrack: () => void previous(),
      seekbackward: (details) => skipBy(-(details.seekOffset ?? 10)),
      seekforward: (details) => skipBy(details.seekOffset ?? 10),
      seekto: (details) => {
        if (details.seekTime !== undefined) seekTo(details.seekTime)
      },
      stop,
    }
    for (const [action, handler] of Object.entries(handlers)) {
      try {
        navigator.mediaSession.setActionHandler(
          action as MediaSessionAction,
          handler,
        )
      } catch {
        // Browsers expose different subsets of Media Session actions.
      }
    }
    activeMediaSessionOwner = id
    updateMediaSessionPlaybackState('playing')
  }

  function releaseMediaSession(): void {
    if (
      activeMediaSessionOwner !== id ||
      typeof navigator === 'undefined' ||
      !('mediaSession' in navigator)
    ) {
      return
    }

    for (const action of MEDIA_SESSION_ACTIONS) {
      try {
        navigator.mediaSession.setActionHandler(action, null)
      } catch {
        // Browsers expose different subsets of Media Session actions.
      }
    }
    navigator.mediaSession.metadata = null
    navigator.mediaSession.playbackState = 'none'
    activeMediaSessionOwner = null
  }

  function destroy(): void {
    if (destroyed) return
    destroyed = true
    stopProgressLoop()
    removeElementListeners()
    releaseMediaSession()
    unregisterCoordinator()
    listeners.clear()
    element = null
  }

  const coordinatorClient = {
    getGroup: () => options.group?.trim() || DEFAULT_GROUP,
    id,
    isExclusive: () => options.exclusive === true,
    pauseFromCoordinator: pause,
  }
  const unregisterCoordinator = registerCoordinatorClient(coordinatorClient)

  if (snapshot.track) {
    emitBridge({
      snapshot,
      track: snapshot.track,
      trackIndex: snapshot.trackIndex,
      type: 'trackchange',
    })
  }

  return {
    attach,
    destroy,
    getElement: () => element,
    getSnapshot: () => snapshot,
    next,
    pause,
    play,
    previous,
    seekTo,
    selectTrack,
    setInput,
    setMuted,
    setPlaybackRate,
    setRepeatMode,
    setVolume,
    skipBy,
    stop,
    subscribe,
    toggle,
    updateOptions,
  }
}
