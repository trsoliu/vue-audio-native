# vue-audio-native
> 重写原生audio标签UI，并使之成为适合vue组件（目前更适合PC使用）,使用了flex布局请注意兼容性IE10+,iOS 6.1+,Android 2.3+（如有新的需要可在issues中提）
 
 
 ![trsoliu README.md](https://user-gold-cdn.xitu.io/2019/4/8/169fbcd3b0ed8425)


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

``` js
// main.js
import Vue from 'vue'
import vueAudioNative from 'vue-audio-native'
Vue.use(vueAudioNative)
```

``` html
<template>
	<div class="home" style="margin-top: 150px;">
		<!--<div class="t">-->
			<vue-audio-native 
				:url=url 
				:showCurrentTime=showCurrentTime 
				:showControls=showControls 
				:showDownload=showDownload 
				:autoplay=autoplay 
				:hint=hint 
				:waitBuffer=waitBuffer
				:downloadName=downloadName
				@on-change="change" 
				@on-timeupdate="timeupdate" 
				@on-metadata="metadata">
			</vue-audio-native>
			<button @click="swtichSrc(0)">音频1</button>
			<button @click="swtichSrc(1)">音频2</button>
		<!--</div>-->
	</div>
</template>
<script>
	import Vue from 'vue'
	export default {
		name: "home",
		data() {
			return {
				urlArray: ["http://mp3.9ku.com/m4a/183203.m4a", "http://www.170mv.com/kw/other.web.rh01.sycdn.kuwo.cn/resource/n3/21/19/3413654131.mp3"], //演示路径
				url: 'http://mp3.9ku.com/m4a/183203.m4a',
				showCurrentTime: true, //默认true，是否显示当前播放时间
				showControls: false, //默认false，true:展示原生音频播放控制条，false：展示模拟播放控制条
				showDownload: true, //默认true，默认显示下载按钮
				autoplay: true, //默认false，自动播放有效音频(由于高版本浏览器协议限制，初始化页面时无法自动播放，可以在点击页面后手动触发)
				waitBuffer:true,//默认true，拖拽到未加载的时间，是否需要等待加载，true:滑块位置不动，等待加载音频资源后播放，false：当滑动位置大于当前缓冲的最大位置，则重置到当前最大缓冲位置
				hint: "音频正在上传中，请稍等…", //无音频情况下提示文案
				downloadName: "重命名1.m4a", //自定义下载后文件名
			}
		},
		methods: {
			change(event) {
				console.log("当前播放状态：", event)
			},
			timeupdate(event) {
				console.log("当前播放时间：", event)
			},
			metadata(event) {
				console.log(event, "音频长度：", event.target.duration)
			},
			//切换音频地址
			swtichSrc(index) {
				let t = this;
				t.url = t.urlArray[index];
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
| showDownload | 是否展示下载按钮 | Boolean | true |
| downloadName | 自定义下载文件名（仅支持Chrome新版本，跨域则会使用服务器下发默认名称） | String | url文件名 |
| autoplay | 自动播放有效音频(由于高版本浏览器协议限制，初始化页面时无法自动播放，可以在点击页面后手动触发) | Boolean | false |
| waitBuffer | 拖拽到未加载的时间，是否需要等待加载，true:滑块位置不动，等待加载音频资源后播放，false：当滑动位置大于当前缓冲的最大位置，则重置到当前最大缓冲位置 | Boolean | true |
| hint | 无有效播放音频时提示语 | String | "暂无有效音频..." |

## <span id="events">events</span>

| 事件名 | 说明 | 类型 | 返回值 |
| :------ | :--------- | :-----| :-----|
| on-change | 显示播放状态发生变化时触发，true：开始播放，false：停止播放 | Boolean | true / false |
| on-timeupdate | 显示播放进行的currentTime（单位:s）,返回值未进行parseInt，如需可手动处理 | Number | 当前值 |
| on-metadata | 返回音频元数据的所以信息 | Object | event |


如有新的需要可在issues中提,或者加QQ群`535798405`找我.