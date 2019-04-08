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
//				console.log(222,event)
			}
//			play(e){
//				console.log(123,e)
//			},
//			pause(e){
//				console.log(333,e)
//			}
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