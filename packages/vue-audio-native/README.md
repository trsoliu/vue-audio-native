# vue-audio-native

An accessible, typed Vue 3 audio player for desktop/mobile browsers and embedded WebViews. It uses
the event-driven `@trsoliu/audio-core` contract for playlists, ordered source fallback, repeat
modes, buffered seeking, structured errors, Media Session, optional exclusive groups, and a
protocol-neutral host Bridge.

Version 1.x targets Vue `>=3.3 <4`. Vue 2 applications must stay on the legacy line.

## Install

```bash
# Vue 3 prerelease
pnpm add vue-audio-native@next

# Vue 2 compatibility line
pnpm add vue-audio-native@legacy
```

Import the standalone package CSS; consumers do not need Tailwind:

```ts
import { createApp } from 'vue'
import VueAudioNativePlugin from 'vue-audio-native'
import 'vue-audio-native/style.css'

createApp(App).use(VueAudioNativePlugin).mount('#app')
```

The plugin registers both `<VueAudioNative>` and `<AudioPlayer>`. Named component imports are also
supported.

## Quick start

```vue
<script setup lang="ts">
import { VueAudioNative, type AudioTrack } from 'vue-audio-native'
import 'vue-audio-native/style.css'

const tracks: readonly AudioTrack[] = [
  {
    id: 'episode-1',
    title: 'Episode 1',
    artist: 'Audio Native',
    artwork: [{ src: '/cover.webp', sizes: '512x512', type: 'image/webp' }],
    sources: [
      { src: '/episode-1.ogg', type: 'audio/ogg' },
      { src: '/episode-1.mp3', type: 'audio/mpeg' },
    ],
  },
]

function onError(error: { code: string; message: string }) {
  console.error(error.code, error.message)
}
</script>

<template>
  <VueAudioNative
    :tracks="tracks"
    repeat-mode="all"
    media-session
    @statechange="(snapshot) => console.log(snapshot.state)"
    @error="onError"
  />
</template>
```

Input priority is fixed: non-empty `tracks`, then `src`, then legacy `url`. The component warns in
development when more than one input is provided.

## Exports

Runtime exports from `vue-audio-native`:

- `VueAudioNative` and its `AudioPlayer` alias
- the default Vue plugin for `app.use()`
- `useAudioPlayer()`
- `detectAudioCapabilities()` and `formatMediaTime()`

Complete type-only exports:

```ts
import type {
  AudioPlayerSize,
  UseAudioPlayerOptions,
  UseAudioPlayerResult,
  VueAudioNativeProps,
  AudioArtwork,
  AudioBridgeEvent,
  AudioControllerOptions,
  AudioInput,
  AudioPlayerBridge,
  AudioPlayerError,
  AudioPlayerErrorCode,
  AudioPlayerHandle,
  AudioRuntimeCapabilities,
  AudioSnapshot,
  AudioSource,
  AudioSourceInput,
  AudioTrack,
  BufferedRange,
  PlaybackState,
  PreloadMode,
  RepeatMode,
} from 'vue-audio-native'
```

For the low-level controller, import directly from `@trsoliu/audio-core`. The Vue package does not
re-export the `createAudioController`, normalization helpers, or `AudioControllerError` runtime
values.

## Inputs

```ts
interface AudioSource {
  src: string
  type?: string
}

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

`src` accepts a URL, one typed source, or an ordered array of either. Empty URLs are removed and
duplicate URLs keep their first position. The core uses `canPlayType()` to prefer supported MIME
types, then tries later sources after media failure. A fatal error is reported only after the final
source fails.

Waveforms render only caller-provided `peaks`; the package never fetches or decodes audio to derive
them.

## Component props

### Input and playback

| Prop           | Type                                              | Default      | Behavior                                                                    |
| -------------- | ------------------------------------------------- | ------------ | --------------------------------------------------------------------------- |
| `tracks`       | `readonly AudioTrack[]`                           | —            | Playlist; non-empty values override `src` and `url`                         |
| `src`          | `AudioSourceInput \| readonly AudioSourceInput[]` | —            | Single item with ordered source fallback                                    |
| `url`          | `string`                                          | `''`         | Legacy single URL; used only when modern inputs are empty                   |
| `autoplay`     | `boolean`                                         | `false`      | Attempts playback after mount/input change; policy rejection is recoverable |
| `preload`      | `'none' \| 'metadata' \| 'auto'`                  | `'metadata'` | Native `<audio>` preload mode                                               |
| `volume`       | `number`                                          | `1`          | Finite values clamp to `0`–`1`; non-finite values are ignored               |
| `muted`        | `boolean`                                         | `false`      | Native muted state                                                          |
| `playbackRate` | `number`                                          | `1`          | Finite values clamp to `0.25`–`4`; non-finite values are ignored            |
| `repeatMode`   | `'off' \| 'one' \| 'all'`                         | `'off'`      | End-of-track behavior                                                       |
| `waitBuffer`   | `boolean`                                         | `true`       | When `false`, seeking cannot move beyond the greatest buffered end time     |

### Integration and presentation

| Prop              | Type                              | Default             | Behavior                                                                                  |
| ----------------- | --------------------------------- | ------------------- | ----------------------------------------------------------------------------------------- |
| `exclusive`       | `boolean`                         | `false`             | Pauses peers only when both players are exclusive and share a group                       |
| `group`           | `string`                          | `'default'`         | Exclusive coordination group; blank values become `default`                               |
| `mediaSession`    | `boolean`                         | `false`             | Opts into lock-screen metadata, playback state, and media actions                         |
| `nativeControls`  | `boolean`                         | see note            | Explicitly forces/hides native controls; when omitted, legacy `showControls` is used      |
| `showControls`    | `boolean`                         | `false`             | Legacy native-controls option, used only when `nativeControls` is not explicitly supplied |
| `showCurrentTime` | `boolean`                         | `true`              | Shows current time and duration in custom controls                                        |
| `showVolume`      | `boolean`                         | `true`              | Shows mute and volume controls                                                            |
| `showDownload`    | `boolean`                         | `true`              | Shows a link when a source exists; the browser decides `download`/cross-origin support    |
| `downloadName`    | `string`                          | `''`                | Fallback filename; `track.downloadName` wins                                              |
| `size`            | `'small' \| 'default' \| 'large'` | `'default'`         | Selects package sizing through `data-size`                                                |
| `hint`            | `string`                          | `'暂无有效音频...'` | Empty-state text when no tip slot is supplied                                             |

Unsupported custom-control environments always fall back to native `<audio controls>`, regardless
of the requested mode. The component does not expose a `bridge` prop; use the headless composable
for Bridge integration.

## Events

Component events describe `AudioSnapshot` transitions. They are not one-for-one proxies for native
media events.

| Event         | Payload                                           | When it fires                                                                                                                         |
| ------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `statechange` | `(snapshot: AudioSnapshot)`                       | Every actual `PlaybackState` transition, including `loading`, `buffering`, and fatal `error`                                          |
| `ready`       | `(snapshot: AudioSnapshot)`                       | State enters `ready`; normally after `canplay` while paused, or after a play request is rejected during loading; not a metadata alias |
| `play`        | `(snapshot: AudioSnapshot)`                       | State enters `playing`; buffering recovery can fire it again without a new user command                                               |
| `pause`       | `(snapshot: AudioSnapshot)`                       | State enters `paused`, including programmatic and exclusive-group pauses                                                              |
| `ended`       | `(snapshot: AudioSnapshot)`                       | State enters `ended`; repeat/automatic playlist advance continues without this terminal transition                                    |
| `timeupdate`  | `(currentTime: number, snapshot: AudioSnapshot)`  | Snapshot time changes; active playback updates can be more frequent than native `timeupdate`                                          |
| `trackchange` | `(track: AudioTrack \| null, trackIndex: number)` | Selected track/index changes; read the initial track from the snapshot instead of relying on a mount callback                         |
| `error`       | `(error: AudioPlayerError)`                       | A new public error appears; native media errors that advance to another source are not emitted                                        |

```vue
<VueAudioNative
  src="/episode.mp3"
  @ready="(snapshot) => console.log(snapshot.duration)"
  @timeupdate="(seconds, snapshot) => saveProgress(snapshot.track?.id, seconds)"
  @trackchange="(track, index) => console.log(index, track?.id)"
  @error="(error) => handlePlaybackError(error.code)"
/>
```

### Legacy events

Version 1.x preserves the documented 0.x events:

| Event           | Template listener | Payload                 | Mapping                                                                      |
| --------------- | ----------------- | ----------------------- | ---------------------------------------------------------------------------- |
| `on-change`     | `@on-change`      | `(playing: boolean)`    | `true` on entry to `playing`; `false` on entry to `paused` or `ended`        |
| `on-timeupdate` | `@on-timeupdate`  | `(currentTime: number)` | Same time change as modern `timeupdate`, without the snapshot                |
| `on-metadata`   | `@on-metadata`    | `(event: Event)`        | Raw `loadedmetadata` or `durationchange`; may fire more than once per source |
| `on-audioId`    | `@on-audio-id`    | `(id: string)`          | Once after mount, for example `vue-audio-native-1`                           |

Use `statechange` for loading/buffering/error UI; `on-change` only represents the legacy playing
boolean.

## Snapshot contract

```ts
interface AudioSnapshot {
  state:
    | 'idle'
    | 'loading'
    | 'ready'
    | 'playing'
    | 'paused'
    | 'buffering'
    | 'ended'
    | 'error'
  track: AudioTrack | null
  trackIndex: number
  currentTime: number
  duration: number | null
  buffered: readonly { start: number; end: number }[]
  volume: number
  muted: boolean
  playbackRate: number
  repeatMode: 'off' | 'one' | 'all'
  error: AudioPlayerError | null
}
```

Snapshots are new, top-level frozen objects. `duration` is `null` while unknown/invalid and
`trackIndex` is `-1` when no track exists.

`AUTOPLAY_BLOCKED` can coexist with `state: 'ready'` or `state: 'paused'`; it is not fatal. Let the
user retry from a gesture. Fatal source failures enter `error` after all ordered sources are
exhausted.

Other error codes are `SOURCE_NOT_SUPPORTED`, `MEDIA_ABORTED`, `NETWORK`, `DECODE`, and `UNKNOWN`.
Each error contains `code`, `message`, optional native `mediaErrorCode`, and optional `cause`.

## Imperative handle

The component exposes `AudioPlayerHandle` through a template ref:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VueAudioNative, type AudioPlayerHandle } from 'vue-audio-native'

const player = ref<AudioPlayerHandle | null>(null)
</script>

<template>
  <VueAudioNative ref="player" src="/episode.mp3" />
  <button type="button" @click="void player?.play()">Play</button>
</template>
```

| Method                                | Return                     | Behavior                                                                     |
| ------------------------------------- | -------------------------- | ---------------------------------------------------------------------------- |
| `play()`                              | `Promise<void>`            | Requests playback; rejects with a structured controller error                |
| `pause()`                             | `void`                     | Pauses playback                                                              |
| `toggle()`                            | `Promise<void>`            | Plays or pauses from the native paused state                                 |
| `stop()`                              | `void`                     | Pauses and seeks to zero                                                     |
| `seekTo(seconds)` / `skipBy(seconds)` | `void`                     | Absolute/relative seek under duration and buffer policy                      |
| `selectTrack(index)`                  | `Promise<void>`            | Selects a valid integer index; out-of-range values throw `RangeError`        |
| `previous()` / `next()`               | `Promise<void>`            | Playlist navigation; previous restarts the current track when past 3 seconds |
| `setVolume(value)`                    | `void`                     | Clamps to `0`–`1`                                                            |
| `setMuted(value)`                     | `void`                     | Updates mute state                                                           |
| `setPlaybackRate(value)`              | `void`                     | Clamps to `0.25`–`4`                                                         |
| `setRepeatMode(mode)`                 | `void`                     | Updates `off`, `one`, or `all`                                               |
| `getElement()`                        | `HTMLAudioElement \| null` | Returns the current native element                                           |

## Headless composable

`useAudioPlayer()` accepts an `AudioControllerOptions` object, ref, computed value, or getter. It
returns a shallow audio-element ref, a shallow immutable snapshot ref, and stable controls.

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useAudioPlayer } from 'vue-audio-native'

const source = computed(() => '/episode.mp3')
const { audioRef, controls, snapshot } = useAudioPlayer(() => ({
  src: source.value,
  exclusive: true,
  group: 'podcast',
}))
</script>

<template>
  <audio ref="audioRef" />
  <button type="button" @click="void controls.toggle()">
    {{ snapshot.state === 'playing' ? 'Pause' : 'Play' }}
  </button>
</template>
```

The composable reacts to input/options changes and destroys its controller with the current Vue
effect scope.

### WebView Bridge

The headless options accept a protocol-neutral `bridge`:

```ts
import { useAudioPlayer, type AudioPlayerBridge } from 'vue-audio-native'

const bridge: AudioPlayerBridge = {
  emit(event) {
    hostTransport.postMessage(JSON.stringify(event))
  },
}

const player = useAudioPlayer({ src: '/episode.mp3', bridge })
```

Bridge event types are:

- `{ type: 'statechange', snapshot }`
- `{ type: 'trackchange', snapshot, track, trackIndex }`
- `{ type: 'error', snapshot, error }`

Removing the bridge or passing `null` detaches the old host before a simultaneous input update.
Bridge exceptions are isolated from playback. Host code chooses its own WKWebView, Android
`JavascriptInterface`, ArkWeb, or other transport protocol.

## Slots

| Slot              | Props                    | Behavior                                 |
| ----------------- | ------------------------ | ---------------------------------------- |
| `artwork`         | `{ track }`              | Replaces the default first artwork image |
| `before-controls` | `{ controls, snapshot }` | Rendered before custom controls content  |
| `after-controls`  | `{ controls, snapshot }` | Rendered after custom controls content   |
| `tip`             | none                     | Preferred empty-state content            |
| `slotTip`         | none                     | Legacy empty-state fallback              |

The before/after control slots are not rendered while native controls are active.

## Styling

Import `vue-audio-native/style.css`. It contains no Tailwind Preflight, global utilities, shadcn,
Reka, OKLCH, or `color-mix()` output.

```css
.audio-native {
  --audio-native-background: #0b0f14;
  --audio-native-foreground: #f5f7fa;
  --audio-native-muted: #9aa4b2;
  --audio-native-border: #303846;
  --audio-native-accent: #70f37c;
  --audio-native-accent-foreground: #061008;
}
```

## SSR and browser boundary

Importing the package is SSR safe. Media and DOM objects are used only after Vue mounts a real
audio element. Capability detection—not user-agent parsing—selects custom versus native controls.
Media Session is opt-in, native HLS is passed through when available, and no HLS engine or audio
analysis runtime is bundled.

Full Chinese API documentation is available at
<https://trsoliu.github.io/vue-audio-native/api/>. The published `.d.ts` files remain the final
machine-readable contract.
