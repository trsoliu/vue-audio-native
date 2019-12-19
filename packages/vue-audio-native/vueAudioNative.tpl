<div :class="size" class="vueAudioNative">
	<template v-if="!!url">
		<template v-if="!showControls">
			<!--音频标签-->
			<audio :ref="audioRef" :src="url" :id="audioRef" :autoplay="autoplay" preload="preload" @play="onPlay" @pause="onPause" @ended="onEnd" @loadstart="onLoadstart" @loadeddata="onLoadeddata" @loadedmetadata="onLoadedmetadata" @timeupdate="onTimeupdate" @waiting="onWaiting">
				<!--<source :src="url" />-->
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
					<div class="slider"  :id="audioRef+'-slider'" ref="slider" @mousedown="drag($event,0),isTimeSlider=true">
						<div class="slider-btn" :style="{left:100*sliderTime/duration+'%'}">
							<b class="anim iconfont iconjiazai" v-if="isWaitBuffer && waitBuffer"></b>
							<div v-show="isTimeSlider">
								<div class="tip-hover" :class="{'tip-on':dragStatus}" v-show="dragStatus">
									{{processFormatTime(sliderTime)}}
									<div class="arrow"></div>
								</div>
							</div>

						</div>
						<div class="slider-bar" :style="{width:100*sliderTime/duration+'%'}"></div>
						<div class="slider-buffer" :style="{width:100*maxBuffer/duration+'%'}"></div>
					</div>
				</div>
				<!--静音开关和音量控制-->
				<div v-if="showVolume" class="audio-muted audio-volume" @mouseenter="isShowVolumeBar=true,isOnVolumeBar=true" @mouseleave="isOnVolumeBar=false,isVolumeSlider?'':isShowVolumeBar=false">
					<span @click="switchMuted" class="iconfont">{{volume==0 || mutedStatus?"&#xe60c;":"&#xe60d;"}}</span>
					<div v-show="isShowVolumeBar" class="vertical-slider-box">
						<div class="vertical-slider" :id="audioRef+'-vertical-slider'" ref="vertical-slider" @mousedown="drag($event,0),isVolumeSlider=true">
							<div class="slider-btn" :style="{bottom:100*volume+'%'}"></div>
							<div class="slider-bar" :style="{height:100*volume+'%'}"></div>
						</div>
					</div>
				</div>
				<!--音频下载-->
				<div class="audio-download" v-if="showDownload">
					<a :href="url" target="_blank" :download="!!downloadName?downloadName:url" class="iconfont">&#xe671;</a>
				</div>
			</template>
		</template>
		<template v-else-if="showControls">
			<audio v-show="!!readyState" controls :autoplay="autoplay" preload="preload" :ref="audioRef" :id="audioRef" @play="onPlay" @pause="onPause" @ended="onEnd" @loadstart="onLoadstart" @loadeddata="onLoadeddata" @loadedmetadata="onLoadedmetadata" @timeupdate="onTimeupdate">
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