---
title: 稳定版真机验证门禁
description: Vue Audio Native 1.0 稳定版发布前必须完成的 iOS、Android 与鸿蒙 WebView 真机证据。
---

# 稳定版真机验证门禁

`vue-audio-native@1.0.0` 稳定版仍被本页门禁阻断。发布稳定 1.0 前，必须取得 iOS
WKWebView、Android WebView、HarmonyOS WebView 与 HarmonyOS NEXT ArkWeb 的带日期真机证据。浏览器自动化不能替代宿主 WebView 的生命周期、音频路由和 Bridge 行为。

| 环境                   | 必须检查                                                     | 状态   |
| ---------------------- | ------------------------------------------------------------ | ------ |
| iOS 15.6+ WKWebView    | 用户手势播放、暂停、跳转、音频路由切换、前后台切换、销毁清理 | 待验证 |
| Android 8+ WebView 96+ | 用户手势播放、格式回退、蓝牙路由、宿主生命周期、销毁清理     | 待验证 |
| HarmonyOS 3/4 WebView  | 播放、跳转、原生 controls 降级、宿主 Bridge 回调             | 待验证 |
| HarmonyOS NEXT ArkWeb  | 播放、跳转、能力探测、宿主 Bridge 回调、销毁清理             | 待验证 |

每次验证必须记录设备与系统版本、浏览器或 WebView 引擎版本、宿主版本、commit SHA、结果和证据文件位置。任何必需环境无法取得时，只能发布 npm `next` 预发行标签，不能发布稳定版。

发布工作流会解析上表；只有四个状态单元格都精确写为 `通过` 时，Trusted Publishing
步骤才会执行。填写 `通过` 的同时必须在本页追加对应的日期、版本、commit SHA 与证据位置。
