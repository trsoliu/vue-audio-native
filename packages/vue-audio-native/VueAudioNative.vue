<style lang="scss" scoped>
	@import "font/iconfont.css";
	@import "./vueAudioNative.scss";
</style>
<template lang="html">
	<div class="vueAudioNative">
		<template v-if="!!url">
			<template v-if="!showControls">
				<!--音频标签-->
				<audio :ref="audioRef" :id="audioRef" muted :autoplay="autoplay" preload="preload" @ended="onEnd" @loadstart="onLoadstart" @loadeddata="onLoadeddata" @loadedmetadata="onLoadedmetadata" @timeupdate="onTimeupdate">
					<source :src="url" />
					<!--<source src="http://mp3.9ku.com/m4a/183203.m4a" />-->
				</audio>
				<template v-if="!!readyState">
					<!--播放/暂停按钮-->
					<div class="audio-left">
						<b class="iconfont played" @click="startPlayOrPause">{{ playedStauts ? "&#xe670;" : "&#xe65d;"}}</b>
						<span>{{ showCurrentTime?processFormatTime(currentTime)+"/":"" }}{{ processFormatTime(duration) }}</span>
					</div>
					<!--播放进度条-->
					<div class="audio-right">
						<div class="slider" id="slider" ref="slider" @mousedown="drag($event,0)">
							<div class="slider-btn" :style="{left:100*sliderTime/duration+'%'}">
								<div class="tip-hover" :class="{'tip-on':dragStatus}" v-show="dragStatus">
									{{processFormatTime(sliderTime)}}
									<div class="arrow"></div>
								</div>

							</div>
							<div class="slider-bar" :style="{width:100*sliderTime/duration+'%'}"></div>
							<div class="slider-buffer" :style="{width:100*maxBuffer/duration+'%'}"></div>
						</div>
					</div>
					<!--音频下载-->
					<div class="audio-download">
						<a :href="url" target="_blank" download class="iconfont">&#xe671;</a>
					</div>
				</template>
			</template>
			<template v-else-if="showControls">
				<audio v-show="!!readyState" controls muted :autoplay="autoplay" preload="preload" :ref="audioRef" :id="audioRef" @ended="onEnd" @loadstart="onLoadstart" @loadeddata="onLoadeddata" @loadedmetadata="onLoadedmetadata" @timeupdate="onTimeupdate">
					<source :src="url" />
					<!--<source src="http://mp3.9ku.com/m4a/183203.m4a" />-->
				</audio>
			</template>
		</template>
		<!--无音频时文字提示-->
		<div class="hint" v-if="!url || !readyState">
			<slot name="slotTip">{{hint}}</slot>
		</div>
	</div>
	</div>
</template>
<script>
	import Vue from 'vue'
	//	export default Vue.extend({
	export default {
		name: "vue-audio-native",
		props: {
			url: {
				type: String,
				default: "", //音频地址
			},
			showCurrentTime: {
				type: Boolean,
				default: true //默认不当前正在播放的时间
			},
			showControls: {
				type: Boolean,
				default: false //默认显示自写组件 true显示原生组件
			},
			autoplay: {
				type: Boolean,
				default: false //默认不自动播放
			},
			hint: {
				type: String,
				default: "暂无有效音频...", //无音频情况下提示文案
			}
		},
		data() {
			return {
				audioRef: "audio123131", //默认audio组件的唯一识别码
				readyStateInterval: null, //循环检查音频加载状态
				readyState: 0, //当前音频状态
				interval: null, //循环检查音频缓冲位置
				maxBuffer: 0, //拖动滑动的最大值 当前缓冲的最大位置
				duration: 0, //音频总长度
				playedStauts: false, //播放状态，true播放，false暂停
				sliderTime: 0, //进度条时间
				currentTime: 0, //当前播放时间长度
				dragStatus: false, //true:可以拖拽，false：拖拽结束
				dragFlag: 2, //0:滑块按钮被选中（mousedown）,1:滑块按钮被拖动（mousemove），2:滑块按钮被释放（mouseup）
				startX: 0, //初始鼠标mousedown的位置值
			}
		},
		methods: {
			/**
			 * @description 播放状态 切换播放/暂停
			 */
			startPlayOrPause() {
				let t = this;
				!!t.playedStauts ? t.onPause() : t.onPlay();
				t.$emit('on-change', t.playedStauts);
			},
			/**
			 * @description 当音频播放
			 */
			onPlay() {
				let t = this;
				t.$refs[t.audioRef].play();
				t.playedStauts = true;
				//				t.$emit('on-play',t.playedStauts);
			},
			/**
			 * @description 当音频暂停
			 */
			onPause() {
				let t = this;
				!!t.$refs[t.audioRef] ? t.$refs[t.audioRef].pause() : "";
				window.clearInterval(t.interval);
				t.playedStauts = false;
				//				t.$emit('on-pause',t.playedStauts);
			},
			/**
			 * @description 当音频结束
			 */
			onEnd() {
				//音频播放是否结束
				let t = this;
				t.$refs[t.audioRef].pause();
				t.sliderTime = 0;
			},
			/**
			 *  @description 进度条ToolTip 转换音频时间格式 duration秒单位 转换为 mm:ss
			 *  */
			processFormatTime(time) {
				var minute = Math.floor(time / 60);
				var second = Math.ceil(time % 60);
				if(minute < 10 || minute == 0) {
					minute = '0' + minute;
				}
				if(second < 10) {
					second = '0' + second;
				}
				return minute + ":" + second
			},
			/** @description 拖动进度条，改变当前时间
			 * @param {event} 拖动的位置值
			 *  */
			changeCurrentTime(event) {
				let t = this,
					ct = 0;
				//当滑动位置大于当前缓冲的最大位置，则重置到当前最大缓冲位置
				event > t.maxBuffer ? ct = t.maxBuffer : ct = event;
				if('fastSeek' in t.$refs[t.audioRef]) {
					t.$refs[t.audioRef].fastSeek(ct); //改变audio.currentTime的值
					t.onPlay();
				} else {
					t.onPlay();
					t.$refs[t.audioRef].currentTime = ct;
				};
				t.onTimeupdate();
			},
			/** @description 当音频当前时间改变后，进度条也要改变
			 *  */
			onTimeupdate() {
				// debugger
				let t = this;
				//获取音频当前播放时间长度
				if(!!t.$refs[t.audioRef]) {
					t.currentTime = parseInt(t.$refs[t.audioRef].currentTime);
					t.dragStatus ? "" : t.sliderTime = (t.currentTime / t.duration) * t.duration;
					t.$emit('on-timeupdate', t.$refs[t.audioRef].currentTime);
				}
			},
			/** @description 当前音频初始化加载状态检查,当前音频加载状态readyState===4时显示播放控件，否则显示“音频正在上传中，请稍等...”
			 *  */
			onLoadstart(event) {
				let t = this,
					readyState = 0,
					loadstartTime = new Date().getTime();
				//				console.log(event, t.$refs[t.audioRef].readyState, 666);
				t.readyStateInterval = window.setInterval(function() {
					//										console.log(t.$refs[t.audioRef].readyState, new Date().getTime() - loadstartTime, 55);
					try {
						readyState = t.$refs[t.audioRef].readyState;
						if(readyState === 4 || (new Date().getTime() - loadstartTime > 90000)) {
							t.readyState = readyState;
							window.clearInterval(t.readyStateInterval);
							t.readyStateInterval = null;
							t.showControls ? "" : t.$nextTick(function() {
								let d = document.getElementById('slider');
								t.startX = d.getBoundingClientRect().left;
								//								readyState === 4 && t.autoplay && !!t.$refs[t.audioRef]? t.onPlay() : "";
							})
						}
					} catch(err) {
						window.clearInterval(t.readyStateInterval);
						t.readyStateInterval = null;
					}
				}, 1000);
			},
			/** @description 音频更新数据,获取缓冲位置
			 *  */
			onLoadeddata(event) {
				//				console.log(event, 777)
				let t = this;
				if(!!t.$refs[t.audioRef]) {
					t.interval = window.setInterval(function() {
						if(!t.$refs[t.audioRef] || t.$refs[t.audioRef].buffered.length < 1) return true;
						//获取当前缓冲的最大位置
						t.maxBuffer = parseInt(t.$refs[t.audioRef].buffered.end(0));
						//当缓存的时间大于等于音频的总时间，则停止
						if(Math.floor(t.$refs[t.audioRef].buffered.end(0)) >= Math.floor(t.$refs[t.audioRef].duration)) {
							window.clearInterval(t.interval);
							t.interval = null;
						};
					}, 300);
				}
			},
			/** @description 语音元数据主要是语音的长度之类的数据
			 *  */
			onLoadedmetadata(event) {
				let t = this;
				t.duration = parseInt(event.target.duration);
			},
			/** @description 音频进度条拖拽条
			 *  */
			drag(event, flag) {
				let t = this;
				if(event.type === "mousedown") {
					t.dragStatus = true;
				};
				if(t.dragStatus) {
					if(flag == 0 || flag == 1) {
						t.sliderTime = t.duration * (event.clientX > t.startX + 5 ? (event.clientX - t.startX > t.$refs.slider.offsetWidth ? t.$refs.slider.offsetWidth : event.clientX - t.startX - 5) : 0) / t.$refs.slider.offsetWidth;
					} else if(flag == 2) {
						//拖拽修改播放时间
						t.changeCurrentTime(t.sliderTime);
						t.dragStatus = false;
					}
				}
			},
			addHandler(element, type, handler) {
				if(element.addEventListener) {
					element.addEventListener(type, handler, false);
				} else if(element.attachEvent) {
					element.attachEvent("on" + type, handler);
				} else {
					element["on" + type] = handler;
				}
			},
			removeHandler(element, type, handler) {
				if(element.removeEventListener)
					element.removeEventListener(type, handler, false);
				else if(element.deattachEvent) { /*IE*/
					element.deattachEvent('on' + type, handler);
				} else {
					element["on" + type] = null;
				}
			},
			//移除鼠标监听
			remove() {
				t.removeHandler(document, "mousemove", function(event) {
					t.drag(event, 1)
				});　
				t.removeHandler(document, "mouseup", function(event) {
					t.drag(event, 2)
				});　
			}
		},
		mounted() {
			let t = this;
			t.audioRef = "audio" + new Date().getTime() + Math.ceil(Math.random() * 10);
			window.clearInterval(t.interval);
			t.interval = null;
			window.clearInterval(t.readyStateInterval);
			t.readyStateInterval = null;
		},
		created() {
			let t = this;
			t.addHandler(document, "mousemove", function(event) {
				t.drag(event, 1)
			});　
			t.addHandler(document, "mouseup", function(event) {
				t.drag(event, 2)
			});　　
		},
//		activated() {
//
//		},
//		deactivated() {
//
//		},
		destroyed() {
			this.remove();
		},
		watch: {
			url: function(nv, ov) {
				let t = this;
				if(nv != ov && !!nv) {
					window.clearInterval(t.interval);
					t.interval = null;
					window.clearInterval(t.readyStateInterval);
					t.readyStateInterval = null;
					t.playedStauts = false;
					t.sliderTime = 0;
					t.currentTime = 0;
					t.audioRef = "audio" + new Date().getTime() + Math.ceil(Math.random() * 10);
				}
			}
		}
	}
</script>