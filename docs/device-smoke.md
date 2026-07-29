# Device smoke record

Stable 1.0 remains blocked until every required row has dated evidence. Browser automation is useful
but is not a substitute for host WebView behavior.

| Environment | Required checks | Status |
| --- | --- | --- |
| iOS 15.6+ WKWebView | user-gesture play, pause, seek, route change, background/foreground, teardown | pending |
| Android 8+ WebView 96+ | user-gesture play, source fallback, Bluetooth route, lifecycle, teardown | pending |
| HarmonyOS 3/4 WebView | play, seek, native-control fallback, host bridge callback | pending |
| HarmonyOS NEXT ArkWeb | play, seek, capability probe, host bridge callback, teardown | pending |

For each run, record device/OS, engine version, host shell version, commit SHA, result and artifact
location. If any environment is unavailable, publish only the `next` prerelease tag.
