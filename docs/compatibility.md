# Compatibility baseline

Vue Audio Native 1.x 使用能力检测，不依赖 User-Agent 分支。低于基线或缺少自定义
控件所需能力时，组件应降级为浏览器原生 `<audio controls>`。

| Platform | Baseline |
| --- | --- |
| Chrome / Edge | Latest two major versions; Chromium 96 minimum |
| Firefox | Current and ESR; Firefox 115 minimum |
| Safari / iOS Safari / WKWebView | 15.6 minimum |
| Android | Android 8+ with Chrome or WebView 96+ |
| HarmonyOS | HarmonyOS 3/4 WebView and NEXT/ArkWeb via capability detection |
| Embedded WebView | Same engine baselines; autoplay and download may be host-restricted |

IE11 is not supported. Media Session, native HLS, download naming and autoplay are progressive
enhancements. The controller returns a structured error when a user gesture is required; it does
not treat autoplay blocking as a terminal media failure.

Stable 1.0 publication requires smoke evidence from iOS WKWebView, Android WebView and HarmonyOS
ArkWeb. If one of those environments is unavailable, only a prerelease may be published.
