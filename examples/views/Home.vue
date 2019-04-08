<template>
	<div class="home" style="margin-top: 150px;">
		<vue-audio-native 
			:url=url
			:showCurrentTime=showCurrentTime
			:showControls=showControls
			:autoplay=autoplay
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
				showCurrentTime:false,
				showControls:false,//true:展示原生音频播放控制条，false：展示模拟播放控制条
				autoplay:false,//自动播放有效音频
				
			}
		},
		methods: {},
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