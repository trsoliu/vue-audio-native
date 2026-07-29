# Vue Audio Native

面向 Vue 3、现代浏览器与 WebView 的轻量音频播放器。1.0 采用共享的 TypeScript
音频内核，提供事件驱动状态、播放列表、多格式回退、Media Session、互斥播放、
键盘与触控操作，并继续兼容 0.x 已公开的 Vue 接入方式。

> 当前仓库正在开发 1.0。Vue 2 用户请继续使用
> `vue-audio-native@0.1.41`；正式发布时会同步设置 `legacy` 标签。

## Workspace

```text
apps/demo-vue              Vue 3 / shadcn-vue 交互演示
apps/compatibility-lab     浏览器与 WebView 能力检测
packages/audio-core        零框架依赖的音频状态内核
packages/vue-audio-native  Vue 3 组件、插件与 composable
fixtures/vite-vue          Vite 消费者构建验证
fixtures/nuxt              Nuxt SSR 消费者构建验证
```

## Development

要求 Node.js 22.22.2 及以上、Corepack 和 pnpm 11.17.0。

```bash
corepack enable
pnpm install
pnpm lint
pnpm typecheck
pnpm test:coverage
pnpm build
pnpm test:pack
pnpm test:e2e
```

架构决策见 [`docs/adr`](docs/adr)，浏览器支持边界见
[`docs/compatibility.md`](docs/compatibility.md)。

## License

[MIT](LICENSE)
