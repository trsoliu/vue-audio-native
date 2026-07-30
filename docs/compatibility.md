# Compatibility baseline

Vue Audio Native 1.x 使用能力检测，不依赖 User-Agent 分支。低于基线或缺少自定义
控件所需能力时，组件应降级为浏览器原生 `<audio controls>`。

| Platform                        | Baseline                                                            |
| ------------------------------- | ------------------------------------------------------------------- |
| Chrome / Edge                   | Latest two major versions; Chromium 96 minimum                      |
| Firefox                         | Current and ESR; Firefox 115 minimum                                |
| Safari / iOS Safari / WKWebView | 15.6 minimum                                                        |
| Android                         | Android 8+ with Chrome or WebView 96+                               |
| HarmonyOS                       | HarmonyOS 3/4 WebView and NEXT/ArkWeb via capability detection      |
| Embedded WebView                | Same engine baselines; autoplay and download may be host-restricted |

IE11 is not supported. Media Session, native HLS, download naming and autoplay are progressive
enhancements. The controller returns a structured error when a user gesture is required; it does
not treat autoplay blocking as a terminal media failure.

`detectAudioCapabilities()` reports the following independently:

- custom-controls prerequisites, including a functional range input;
- download attribute support;
- Media Session availability;
- native HLS MIME support;
- Pointer Events and touch input availability.

No User-Agent branch is used. The Vue adapter checks the real mounted media element and switches to
native controls if the custom-control prerequisite set is missing. The compatibility lab exposes the
same probe for device-cloud and embedded-host testing.

Stable publication normally uses smoke evidence from iOS WKWebView, Android WebView and HarmonyOS
ArkWeb. When those environments are unavailable, the maintainer may instead authorize an exact
version after the full automated assessment and explicitly accept the remaining host-specific risk;
the machine-readable decision is recorded in `docs/device-smoke.md`.
