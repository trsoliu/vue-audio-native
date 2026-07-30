# @trsoliu/audio-core

Typed, framework-independent control for the browser `HTMLAudioElement`. It provides the shared
playback contract used by `vue-audio-native` and `react-audio-native`: event-driven snapshots,
playlists, ordered source fallback, structured errors, repeat modes, Media Session, exclusive
groups, and a protocol-neutral WebView Bridge.

The package creates no DOM or media objects during import, so it is safe to import from SSR code.

## Install

<!-- release-install:start -->

```bash
pnpm add @trsoliu/audio-core@1.0.0
```

Use `@trsoliu/audio-core@next` only when intentionally validating a prerelease.

<!-- release-install:end -->

## Exports

Runtime values:

- `createAudioController()`
- `detectAudioCapabilities()`
- `formatMediaTime()`
- `normalizeInput()` and `normalizeSources()`
- `AudioControllerError`

Type-only exports:

```ts
import type {
  AudioController,
  AudioControllerOptions,
  AudioBridgeEvent,
  AudioArtwork,
  AudioInput,
  AudioPlayerBridge,
  AudioPlayerError,
  AudioPlayerErrorCode,
  AudioPlayerHandle,
  AudioRuntimeCapabilities,
  AudioSnapshot,
  AudioSnapshotListener,
  AudioSource,
  AudioSourceInput,
  AudioTrack,
  BufferedRange,
  PlaybackState,
  PreloadMode,
  RepeatMode,
} from '@trsoliu/audio-core'
```

## Quick start

```ts
import { createAudioController } from '@trsoliu/audio-core'

const audio = document.querySelector<HTMLAudioElement>('#player')
const controller = createAudioController({
  src: '/audio/example.mp3',
  preload: 'metadata',
})

const unsubscribe = controller.subscribe((snapshot) => {
  console.log(snapshot.state, snapshot.currentTime)
})

controller.attach(audio)

document.querySelector('#play')?.addEventListener('click', () => {
  void controller.play().catch((error) => {
    console.error(error.code, error.message)
  })
})

// On teardown:
unsubscribe()
controller.destroy()
```

`subscribe()` reports published snapshot changes but does not immediately replay the current
value. Call `controller.getSnapshot()` when you also need the initial state.

## Inputs

### Sources

```ts
interface AudioSource {
  src: string
  type?: string
}

type AudioSourceInput = string | AudioSource
```

`src` accepts one URL, one typed source, or an ordered array of either form. Empty URLs are ignored
and duplicate URLs keep their first position. A MIME `type` lets the controller prefer a source
supported by `HTMLMediaElement.canPlayType()`.

### Tracks

```ts
interface AudioTrack {
  id: string
  title?: string
  artist?: string
  album?: string
  artwork?: MediaImage[]
  sources: AudioSource | readonly AudioSource[]
  downloadName?: string
  peaks?: readonly number[]
}
```

Non-empty `tracks` take precedence over `src`. Tracks with no usable source are removed. A lone
`src` becomes a synthetic track with `id: 'audio-source'`.

Sources are attempted in order. A media failure advances to the next source without publishing a
fatal error; `error` is reported after the final source fails. Native HLS URLs may be passed
through, but the package does not bundle `hls.js`, fetch or decode audio, use Web Audio, or derive
waveform peaks.

```ts
const controller = createAudioController({
  tracks: [
    {
      id: 'episode-1',
      title: 'Episode 1',
      artist: 'Audio Native',
      sources: [
        { src: '/episode-1.ogg', type: 'audio/ogg' },
        { src: '/episode-1.mp3', type: 'audio/mpeg' },
      ],
    },
  ],
  repeatMode: 'all',
})
```

## Controller options

| Option         | Type                                              | Default      | Behavior                                                          |
| -------------- | ------------------------------------------------- | ------------ | ----------------------------------------------------------------- |
| `src`          | `AudioSourceInput \| readonly AudioSourceInput[]` | —            | Single-track input and ordered format fallback                    |
| `tracks`       | `readonly AudioTrack[]`                           | —            | Playlist; non-empty values override `src`                         |
| `autoplay`     | `boolean`                                         | `false`      | Attempts playback after attach or an input change                 |
| `preload`      | `'none' \| 'metadata' \| 'auto'`                  | `'metadata'` | Native audio preload value                                        |
| `volume`       | `number`                                          | `1`          | Finite values clamp to `0`–`1`; non-finite input uses `1`         |
| `muted`        | `boolean`                                         | `false`      | Native muted state                                                |
| `playbackRate` | `number`                                          | `1`          | Finite values clamp to `0.25`–`4`; non-finite input uses `1`      |
| `repeatMode`   | `'off' \| 'one' \| 'all'`                         | `'off'`      | End-of-track behavior                                             |
| `waitBuffer`   | `boolean`                                         | `true`       | When `false`, seeking is capped at the greatest buffered end time |
| `exclusive`    | `boolean`                                         | `false`      | Enables cross-instance pause coordination                         |
| `group`        | `string`                                          | `'default'`  | Coordination group; blank values resolve to `default`             |
| `mediaSession` | `boolean`                                         | `false`      | Opts into Media Session metadata, actions, and playback state     |
| `bridge`       | `AudioPlayerBridge \| null`                       | `null`       | Optional protocol-neutral host event sink                         |

Autoplay rejection is published as the recoverable `AUTOPLAY_BLOCKED` error. It leaves the
controller usable, so a later user gesture can call `play()` again.

## `AudioController`

`createAudioController(options?)` returns an `AudioController` with these methods:

| Method                   | Return                     | Behavior                                                                                                                  |
| ------------------------ | -------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `attach(element)`        | `void`                     | Attaches, replaces, or detaches (`null`) a real `HTMLAudioElement`                                                        |
| `destroy()`              | `void`                     | Removes media listeners, animation frames, coordinator registration, Media Session ownership, and subscribers; idempotent |
| `getSnapshot()`          | `AudioSnapshot`            | Reads the current immutable snapshot synchronously                                                                        |
| `subscribe(listener)`    | `() => void`               | Subscribes to future snapshot publications and returns an unsubscribe function                                            |
| `setInput(input)`        | `void`                     | Replaces the input and resets selection to the first valid track                                                          |
| `updateOptions(partial)` | `void`                     | Merges runtime options; pass `bridge: null` to detach a host                                                              |
| `play()`                 | `Promise<void>`            | Requests playback and rejects with `AudioControllerError` on failure                                                      |
| `pause()`                | `void`                     | Pauses the attached element                                                                                               |
| `toggle()`               | `Promise<void>`            | Plays or pauses according to the element's native `paused` state                                                          |
| `stop()`                 | `void`                     | Pauses and seeks to `0`                                                                                                   |
| `seekTo(seconds)`        | `void`                     | Ignores non-finite values and clamps to duration/buffer policy                                                            |
| `skipBy(seconds)`        | `void`                     | Seeks relative to the current time                                                                                        |
| `selectTrack(index)`     | `Promise<void>`            | Selects an integer playlist index; rejects with `RangeError` when out of range                                            |
| `previous()`             | `Promise<void>`            | Restarts the current track after 3 seconds; otherwise selects the previous track or wraps in `all` mode                   |
| `next()`                 | `Promise<void>`            | Selects the next track, wraps in `all` mode, or enters `ended` at the boundary                                            |
| `setVolume(value)`       | `void`                     | Clamps finite values to `0`–`1` and ignores non-finite values                                                             |
| `setMuted(value)`        | `void`                     | Updates muted state                                                                                                       |
| `setPlaybackRate(value)` | `void`                     | Clamps finite values to `0.25`–`4` and ignores non-finite values                                                          |
| `setRepeatMode(mode)`    | `void`                     | Sets `off`, `one`, or `all`                                                                                               |
| `getElement()`           | `HTMLAudioElement \| null` | Returns the current native element                                                                                        |

Calling `play()` without both an attached element and a valid track rejects with
`SOURCE_NOT_SUPPORTED`. `selectTrack()` preserves playback when the player was already playing or
when `autoplay` is enabled.

## Snapshots and playback events

Media state is driven by standard media events. While playback is active, requestAnimationFrame is
used only to keep time and buffered data smooth; there is no ready-state polling or persistent
background timer.

```ts
interface AudioSnapshot {
  state: PlaybackState
  track: AudioTrack | null
  trackIndex: number
  currentTime: number
  duration: number | null
  buffered: readonly { start: number; end: number }[]
  volume: number
  muted: boolean
  playbackRate: number
  repeatMode: RepeatMode
  error: AudioPlayerError | null
}
```

Each publication is a new, top-level frozen object. A listener can receive updates without a state
transition—for example, time, duration, buffering, volume, or rate changes.

| State       | Meaning                                                                                            |
| ----------- | -------------------------------------------------------------------------------------------------- |
| `idle`      | No attached media element yet, or no valid input                                                   |
| `loading`   | A source has been selected and loading has started                                                 |
| `ready`     | Paused/retryable; normally entered by `canplay`, or after a play request is rejected while loading |
| `playing`   | Playback is active                                                                                 |
| `paused`    | Playback is paused                                                                                 |
| `buffering` | `waiting` or `stalled` occurred during active playback                                             |
| `ended`     | The playlist reached its boundary without another repeat/track transition                          |
| `error`     | All usable sources failed or another fatal media error occurred                                    |

`ready` is not an alias for `loadedmetadata`. A transition from `buffering` back to `playing` is a
new state transition even though the user did not issue another play command.

### Native media event mapping

| Native event                       | Published behavior                                                                                                            |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `loadstart`                        | Clears the previous error and enters `loading`                                                                                |
| `loadedmetadata`, `durationchange` | Synchronizes time, duration, buffered ranges, volume, mute, and rate without treating metadata as `ready`                     |
| `canplay`                          | Enters `ready`/`playing` from `loading`, or returns active `buffering` to `playing`; a late event does not overwrite `paused` |
| `play`                             | Clears the error, enters `playing`, coordinates exclusive peers, and activates Media Session                                  |
| `playing`                          | Confirms `playing`, updates Media Session, and starts smooth progress synchronization                                         |
| `pause`                            | Enters `paused` unless the snapshot is already terminal `ended`/`error`                                                       |
| `waiting`, `stalled`               | Enters `buffering` only while the element is actively playing                                                                 |
| `timeupdate`, `progress`           | Synchronizes time, duration, and buffered ranges                                                                              |
| `volumechange`                     | Synchronizes `volume` and `muted`                                                                                             |
| `ratechange`                       | Synchronizes `playbackRate`                                                                                                   |
| `ended`                            | Repeats, advances the playlist, wraps, or enters terminal `ended` according to the current mode                               |
| `error`                            | Loads the next ordered source, or publishes a structured fatal error when no fallback remains                                 |

## Structured errors

```ts
interface AudioPlayerError {
  code:
    | 'AUTOPLAY_BLOCKED'
    | 'SOURCE_NOT_SUPPORTED'
    | 'MEDIA_ABORTED'
    | 'NETWORK'
    | 'DECODE'
    | 'UNKNOWN'
  message: string
  mediaErrorCode?: number
  cause?: unknown
}
```

| Code                   | Typical source                                                                | Recovery                                              |
| ---------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------- |
| `AUTOPLAY_BLOCKED`     | `NotAllowedError` from browser gesture policy                                 | Let the user call `play()` from a gesture             |
| `SOURCE_NOT_SUPPORTED` | Missing input/element, native media error 4, or exhausted unsupported sources | Attach an element or provide another format           |
| `MEDIA_ABORTED`        | Native media error 1                                                          | Reload or replace the source                          |
| `NETWORK`              | Native media error 2                                                          | Retry and inspect URL, CORS, and connectivity         |
| `DECODE`               | Native media error 3                                                          | Use a compatible encoding or fallback source          |
| `UNKNOWN`              | Other play/media failures                                                     | Inspect `cause`, log safely, and offer retry/fallback |

`AudioControllerError` extends `Error` and implements this public shape. A recoverable play error
can coexist with `state: 'ready'` or `state: 'paused'`; do not treat every error as fatal.

## WebView Bridge events

The optional bridge receives state, track, and error transitions without assuming a host protocol:

```ts
import type { AudioPlayerBridge } from '@trsoliu/audio-core'

const bridge: AudioPlayerBridge = {
  emit(event) {
    hostTransport.send(JSON.stringify(event))
  },
}

const controller = createAudioController({ bridge, src: '/episode.mp3' })
```

```ts
type AudioBridgeEvent =
  | { type: 'statechange'; snapshot: AudioSnapshot }
  | {
      type: 'trackchange'
      snapshot: AudioSnapshot
      track: AudioTrack | null
      trackIndex: number
    }
  | { type: 'error'; snapshot: AudioSnapshot; error: AudioPlayerError }
```

- `statechange` is emitted only when `snapshot.state` changes.
- `trackchange` is emitted when the track/index changes and once on attach when a track is already
  selected.
- `error` is emitted when a new public error object appears.
- Exceptions thrown by `bridge.emit()` are isolated from playback.
- `controller.updateOptions({ bridge: null })` detaches the old host before any simultaneous input
  update is delivered.

Map these events to `WKScriptMessageHandler`, Android `JavascriptInterface`, ArkWeb, or another
transport in host code. The package intentionally defines no message channel, authentication, or
serialization protocol.

## Exclusive groups

Instances remain independent by default. A player pauses a peer only when both have
`exclusive: true` and their trimmed `group` values match:

```ts
const narration = createAudioController({
  src: '/narration.mp3',
  exclusive: true,
  group: 'content',
})
```

## Media Session

Media Session is opt-in with `mediaSession: true`. When supported, the active owner publishes track
metadata and handles play, pause, stop, previous/next, seek backward/forward, and seek-to actions.
Unsupported actions are ignored. Disabling the option or destroying the owner clears handlers,
metadata, and playback state.

## Capability and normalization helpers

| Export                              | Behavior                                                                                                                                           |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `detectAudioCapabilities(element?)` | Reports custom controls, download, Media Session, native HLS, Pointer Events, and touch without user-agent parsing; returns all `false` during SSR |
| `formatMediaTime(seconds)`          | Returns `mm:ss`/`hh:mm:ss`; invalid, negative, infinite, or unknown values become `--:--`                                                          |
| `normalizeSources(input)`           | Trims URLs, removes empties and duplicate URLs, preserves order                                                                                    |
| `normalizeInput(input)`             | Normalizes tracks or creates the synthetic single-source track                                                                                     |
| `AudioControllerError`              | Public structured `Error` class                                                                                                                    |

## Runtime boundaries

- Browser-first and SSR-import safe; Node.js 18+ is required for the package toolchain/runtime
  distribution.
- Capability detection replaces user-agent branching.
- Native HLS is passed through when supported; no streaming engine is bundled.
- React Native native SDKs, recording, DRM, transcoding, audio analysis, and automatic waveform
  generation are outside scope.

The package publishes ESM, CommonJS, and declarations. The generated `.d.ts` files are the final
machine-readable API contract.
