# vue-audio-native
> 重写原生audio标签UI，并使之成为适合vue组件,使用了flex布局请注意兼容性IE10+,iOS 6.1+,Android 2.3+
 


- [安装](#install)
- [使用](#use)
- [API](#API)
- [events](#events)
## <span id="install">安装</span>

``` bash
$ npm install vue-audio-native --save
```
## <span id="use">使用</span>

在 `main.js` 文件中引入插件并注册

``` bash
# main.js
import Vue from 'vue'
import vueAudioNative from 'vue-audio-native'
Vue.use(vueAudioNative)
```

``` js
<template>
	<div class="home" style="margin-top: 150px;">
		<vue-audio-native 
			:url=url
			:showCurrentTime=showCurrentTime
			:showControls=showControls
			:autoplay=autoplay
			:hint=hint
			@on-change="change"
			@on-timeupdate="timeupdate"
			>
		</vue-audio-native>
	</div>
</template>
<script>
	import Vue from 'vue'
	export default {
		name: "home",
		data() {
			return {
				url: "http://mp3.9ku.com/m4a/183203.m4a", //演示路径
				showCurrentTime:true,//是否显示当前播放时间
				showControls:false,//true:展示原生音频播放控制条，false：展示模拟播放控制条
				autoplay:true,//自动播放有效音频(由于高版本浏览器协议限制，初始化页面时无法自动播放，可以在点击页面后手动触发)
				hint:"音频正在上传中，请稍等…",//无音频情况下提示文案
				
			}
		},
		methods: {
			change(event){
				console.log(111,event)
			},
			timeupdate(event){
				console.log(222,event)
			}
		},
	}
</script>
```

## <span id="API">API</span>

| 属性 | 说明 | 类型 | 默认值 |
| :------ | :---------  | :--------- | :-----|
| url | 音频地址 | String | "" |
| showCurrentTime | 是否显示当前播放时间 | Boolean | true |
| showControls | 是否展示原生音频播放控制条 | Boolean | false |
| autoplay | 自动播放有效音频(由于高版本浏览器协议限制，初始化页面时无法自动播放，可以在点击页面后手动触发) | Boolean | false |
| hint | 无有效播放音频时提示语 | String | "暂无有效音频..." |

## <span id="events">events</span>

| 事件名 | 说明 | 类型 | 返回值 |
| :------ | :--------- | :-----| :-----|
| on-change | 显示播放状态发生变化时触发，true：开始播放，false：停止播放 | Boolean | true / false |
| on-timeupdate | 显示播放进行的currentTime（单位:s）,返回值未进行parseInt，如需可手动处理 | Number | 当前值 |
