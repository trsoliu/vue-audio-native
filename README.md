# vue-audio-native
> 重写原生audio标签UI，并使之成为适合vue组件

## 安装

``` bash
$ npm i vue-audio-native -S
```
## 使用

在 `main.js` 文件中引入插件并注册

``` bash
# main.js
import vueAudioNative from 'vue-audio-native'
Vue.use(vueAudioNative)
```

``` js
<vue-audio-native><vue-audio-native/>
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| :------ | :---------  | :--------- | :-----|
| url | 音频地址 | String | "" |
| showCurrentTime | 是否显示当前播放时间 | Boolean | true |
| showControls | 是否展示原生音频播放控制条 | Boolean | false |
//| autoplay | 自动播放有效音频(由于高版本浏览器协议限制，初始化页面时无法自动播放，可以在点击页面后手动触发`on-play`) | Boolean | false |
| hint | 无有效播放音频时提示语 | String | "暂无有效音频..." |

## events

| 事件名 | 说明 | 返回值 |
| :------ | :--------- | :-----|
| on-change | 显示播放状态发生变化时触发，true：开始播放，false：停止播放 | Boolean | true / false |
