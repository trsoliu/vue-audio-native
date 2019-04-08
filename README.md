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
| ------ | ---------  | --------- | -----:|
| url | 说明 | String | "" |
| showCurrentTime | 是否显示当前播放时间 | Boolean | true |
| showControls | 说明 | Boolean | false |
| autoplay | 自动播放有效音频 | Boolean | false |
| hint | 无有效播放音频时提示语 | String | "暂无有效音频..." |
