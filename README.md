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
docs                       Silen 文档站、项目地图与 AI 知识库
```

## Public API

- Vue 组件的完整 props、现代/兼容事件 payload、状态、错误、句柄、composable 和插槽见
  [`docs/api`](docs/api/index.mdx)。
- npm 上的 Vue 接入材料来自
  [`packages/vue-audio-native/README.md`](packages/vue-audio-native/README.md)。
- `@trsoliu/audio-core` 的 controller、snapshot 订阅和 Bridge Events 见
  [`packages/audio-core/README.md`](packages/audio-core/README.md)。

组件事件描述的是 `AudioSnapshot` 状态变化，并非原生 `<audio>` 事件的逐条透传。需要直接
创建 controller 时请从 `@trsoliu/audio-core` 导入 `createAudioController()`；Vue 包只暴露
组件、composable、适配层工具和共享类型。

## Development

要求 Node.js 22.22.2 及以上、Corepack 和 pnpm 11.17.0。

```bash
corepack enable
pnpm install
pnpm security:audit
pnpm lint
pnpm typecheck
pnpm test:coverage
pnpm build
pnpm docs:build
pnpm docs:index
pnpm docs:audit
pnpm docs:eval
pnpm test:pack
pnpm test:e2e
```

文档站本地启动：`pnpm docs:dev --host 127.0.0.1 --port 5175`。设计边界见
[`DESIGN.md`](DESIGN.md)，项目地图见 [`docs/project-map`](docs/project-map/index.mdx)，
架构决策见 [`docs/adr`](docs/adr)，
浏览器支持边界见 [`docs/compatibility.md`](docs/compatibility.md)。合并到 `master` 后，
GitHub Pages 会发布到 <https://trsoliu.github.io/vue-audio-native/>。

AI 客户端先阅读 [`AGENTS.md`](AGENTS.md)。文档构建会同时生成 `llms.txt`、
`llms-full.txt`、结构化搜索索引和公开的 Silen Agent Contract；本地只读知识库可通过
`pnpm docs:mcp` 接入。

## License

[MIT](LICENSE)
