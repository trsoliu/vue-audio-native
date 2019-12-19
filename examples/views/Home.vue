<style lang="scss" scoped="">
	/*.home {
		padding: 100px 0 0 100px;
		margin-left: 100px;
		height: 500px;
		width: 500px;
		overflow: auto;
		.t{
			width: 1000px;
		}
	}*/
	.home{
		>div{
			width: 300px;
			display: inline-block;
			vertical-align: text-top;
		}
	}
</style>
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
<!--<script lang="ts">
//import { Component, Vue } from "vue-property-decorator";
//import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src
//
//@Component({
//components: {
//  HelloWorld
//}
//})
//export default class Home extends Vue {}
</script>-->