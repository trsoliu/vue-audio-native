# @trsoliu/audio-core

Typed, framework-independent control for the browser `HTMLAudioElement`. The package creates no
DOM or media elements during import, so it is safe to import from SSR code.

```ts
import { createAudioController } from '@trsoliu/audio-core'

const controller = createAudioController({ src: '/audio/example.mp3' })
controller.attach(document.querySelector('audio'))
await controller.play()
```

The controller is event-driven, SSR-safe, and includes playlists, repeat modes,
source fallback, buffered seeking, Media Session integration, and optional
cross-instance playback coordination.

## Playlist and source fallback

```ts
const controller = createAudioController({
  tracks: [
    {
      id: 'episode-1',
      sources: [
        { src: '/episode-1.ogg', type: 'audio/ogg' },
        { src: '/episode-1.mp3', type: 'audio/mpeg' },
      ],
    },
  ],
  repeatMode: 'all',
})
```

Sources are selected with `HTMLMediaElement.canPlayType()` and retried on media failure. Native HLS
URLs may be passed through; the package does not bundle `hls.js`, decode media or use Web Audio.

## WebView host adapter

The optional bridge is a protocol-neutral callback. It does not assume Android JavascriptInterface,
WKWebView message handlers or an ArkWeb protocol.

```ts
const controller = createAudioController({
  bridge: {
    emit(event) {
      hostTransport.send(JSON.stringify(event))
    },
  },
  src: '/audio/example.mp3',
})
```

Host exceptions are isolated from playback. `detectAudioCapabilities()` reports custom-control,
download, Media Session, native HLS, Pointer Events and touch capabilities without parsing the user
agent.
