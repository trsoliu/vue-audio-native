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
</style>
<template>
	<div class="home" style="margin-top: 150px;">
		<!--<div class="t">-->
			<vue-audio-native 
				size="large"
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
				url: require('../assets/test.mp4'),
				showCurrentTime: true, //默认true，是否显示当前播放时间
				showControls: false, //默认false，true:展示原生音频播放控制条，false：展示模拟播放控制条
				showDownload: true, //默认true，默认显示下载按钮
				autoplay: true, //默认false，自动播放有效音频(由于高版本浏览器协议限制，初始化页面时无法自动播放，可以在点击页面后手动触发)
				waitBuffer:true,//默认true，拖拽到未加载的时间，是否需要等待加载，true:滑块位置不动，等待加载音频资源后播放，false：当滑动位置大于当前缓冲的最大位置，则重置到当前最大缓冲位置
				downloadName:"下载音频",//默认“下载音频”，在Chrome和火狐、同域名下，修改下载文件名称，其它保持原文件服务器名称
				hint: "音频正在上传中，请稍等…", //无音频情况下提示文案
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
			//			play(e){
			//				console.log(123,e)
			//			},
			//			pause(e){
			//				console.log(333,e)
			//			}
			//切换音频地址
			swtichSrc(index) {
				let t = this;
				t.url = t.urlArray[index];
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