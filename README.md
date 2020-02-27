# vue-audio-native
> 重写原生audio标签UI，并使之成为适合vue组件（目前更适合PC使用）,使用了flex布局请注意兼容性IE10+,iOS 6.1+,Android 2.3+（如有新的需要可在issues中提）由于需要vue-loader需要大于15.7，需要建议大家使用vue-cli3+
 
 
 ![trsoliu README.md](https://user-gold-cdn.xitu.io/2019/9/29/16d7bfa8fc4f1a79)


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
		<div v-for="(item,index) in urlArray" :class="'demo-'+index">
			<vue-audio-native 
				size="default"
				:url="index==0?url:item"
				:showCurrentTime=showCurrentTime 
				:showControls=showControls 
                :showVolume=showVolume
				:showDownload=showDownload
				:autoplay=autoplay 
				:hint=hint 
				:waitBuffer=waitBuffer
				:downloadName=downloadName
				@on-change="change" 
				@on-timeupdate="timeupdate" 
				@on-metadata="metadata"
				@on-audioId="audioId"
				>
			</vue-audio-native>
			<!--只允许第一个组件可以切换音频-->
			<template v-if="index==0">
				<button @click="swtichSrc(0)">音频1</button>
				<button @click="swtichSrc(1)">音频2</button>
				<button @click="swtichSrc(2)">音频3</button>
			 </template>
			 <!--所有音频组件均可以单独通过按钮播放和暂停-->
				<button @click="play(index)">开始播放</button>
				<button @click="pause(index)">暂停播放</button>
		</div>
	</div>
</template>
<script>
	import Vue from 'vue'
	export default {
		name: "home",
		data() {
			return {
//				urlArray: ["http://mp3.9ku.com/m4a/183203.m4a", "http://www.170mv.com/kw/other.web.rh01.sycdn.kuwo.cn/resource/n3/21/19/3413654131.mp3",require('../assets/test.mp3')], //演示路径
				urlArray: ["http://mp3.9ku.com/m4a/183203.m4a", require('../assets/hsym.mp3'),require('../assets/test.mp3')], //演示路径
				url: require('../assets/test.mp3'),
				showCurrentTime: true, //默认true，是否显示当前播放时间
				showControls: false, //默认false，true:展示原生音频播放控制条，false：展示模拟播放控制条
                showVolume: true, //默认true，默认显示音量调节和静音按钮 true显示音量调节和静音按钮
				showDownload: true, //默认true，默认显示下载按钮
				autoplay: false, //默认false，自动播放有效音频(由于高版本浏览器协议限制，初始化页面时无法自动播放，可以在点击页面后手动触发)
				waitBuffer:true,//默认true，拖拽到未加载的时间，是否需要等待加载，true:滑块位置不动，等待加载音频资源后播放，false：当滑动位置大于当前缓冲的最大位置，则重置到当前最大缓冲位置
				downloadName:"下载音频",//默认“下载音频”，在Chrome和火狐、同域名下，修改下载文件名称，其它保持原文件服务器名称
				hint: "音频正在上传中，请稍等…", //无音频情况下提示文案
				currentAudioId:[],//当前正在播放的audio id数组
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
			},
			//获取渲染能够播放音频currentAudioId，可存全局，用以播放和暂停音频
			audioId(event){
				console.log(event,9999999)
				this.currentAudioId.push(event);
			},
			//通过音频列表的下标获取渲染能够播放音频currentAudioId即组件的id，并使用组件的id，用来开始播放录音
			play(index){
				document.getElementById(this.currentAudioId[index]).play();
			},
			//通过音频列表的下标获取渲染能够播放音频currentAudioId即组件的id，并使用组件的id，，用来暂停播放录音
			pause(index){
				document.getElementById(this.currentAudioId[index]).pause();
			}
		},
	}
</script>
```

## <span id="API">API</span>

| 属性 | 说明 | 类型 | 默认值 |
| :------ | :---------  | :--------- | :-----|
| size | 样式大小，可选值为large、small、default或者不设置 | String | default |
| url | 音频地址 | String | "" |
| showCurrentTime | 是否显示当前播放时间 | Boolean | true |
| showControls | 是否展示原生音频播放控制条 | Boolean | false |
| showVolume | 是否展示音量调节和静音按钮 | Boolean | true |
| showDownload | 是否展示下载按钮 | Boolean | true |
| autoplay | 自动播放有效音频(由于高版本浏览器协议限制，初始化页面时无法自动播放，可以在点击页面后手动触发) | Boolean | false |
| waitBuffer | 拖拽到未加载的时间，是否需要等待加载，true:滑块位置不动，等待加载音频资源后播放，false：当滑动位置大于当前缓冲的最大位置，则重置到当前最大缓冲位置 | Boolean | true |
| downloadName | 在Chrome和火狐、同域名下，修改下载文件名称，其它保持原文件服务器名称 | String | "下载音频" |
| hint | 无有效播放音频时提示语 | String | "暂无有效音频..." |

## <span id="events">events</span>

| 事件名 | 说明 | 类型 | 返回值 |
| :------ | :--------- | :-----| :-----|
| on-change | 显示播放状态发生变化时触发，true：开始播放，false：停止播放 | Boolean | true / false |
| on-timeupdate | 显示播放进行的currentTime（单位:s）,返回值未进行parseInt，如需可手动处理 | Number | 当前值 |
| on-metadata | 返回音频元数据的所以信息 | Object | event |
| on-audioId | 返回audio标签的id，用以播放和暂停音频等 | String | event |


如有新的需要可在issues中提,或者加QQ群`535798405`找我.

## 版本修复记录
>0.1.40 修复针对与类似webm格式的音频，在初始化无法从metadata中获取到音频时间长度duration，故使用durationchange监听音频长度变化，捕捉后更新音频长度（ps:在未获取音频长度的时候，页面组件不显示音频总长度，且滑块不移动）

>0.1.39 修复横向情况下多音频拖动失败问题，添加多音频演示用例

>0.1.37 修复纵向情况下多音量拖动失败问题
