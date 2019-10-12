/**
 * 音频音量和静音调节
 * @author hauk0101、trsoliu
 * @date 2019-10-10
 * **/

export default {
	props: {
		showVolume: {
			type: Boolean,
			default: true //默认true，默认显示音量调节和静音按钮 true显示音量调节和静音按钮
		}
	},
	data() {
		return {
			mutedStatus: false, //静音状态在showMuted==true 即显示静音按钮，此时true表示当前静音，false表示当前是未静音状态
			isOnVolumeBar: false, //鼠标是否在音量调节调节条或者按钮上
			isShowVolumeBar: false, //是否显示音量控制条
			volume: 1, //默认是1,音量0是静音，1是最大
		}
	},
	methods: {
		/**
		 *  @description 静音状态切换
		 */
		switchMuted() {
			let t = this,
				flag = t.mutedStatus;
			if(t.$refs[t.audioRef]) {
				t.$refs[t.audioRef].muted = !flag;
				t.mutedStatus = !flag;
			}
		},
		/**
		 * @description 正在调节音量大小
		 * @param{flag} //0:滑块按钮被选中（mousedown）,1:滑块按钮被拖动（mousemove），2:滑块按钮被释放（mouseup）
		 * */
		changeVolume(flag) {
			let t = this;
			if(flag == 0 || flag == 1) {
				let startY = document.getElementById('vertical-slider').getBoundingClientRect().top; //初始进度条最顶边的位置y坐标值
				let clientY = event.clientY; //鼠标当前位置y坐标
				let offseHeight = t.$refs['vertical-slider'].offsetHeight; //进度条高度
				t.volume = 1 - (clientY > startY + 1 ? (clientY - startY > offseHeight ? offseHeight : clientY - startY - 1) : 0) / offseHeight;
				t.$refs[t.audioRef].volume = t.volume;//调节音量
			} else if(flag == 2) {
				t.dragStatus = false;
				//表面鼠标已经离开音量调节条和按钮
				t.isVolumeSlider = false;
				//当鼠标up的时候，若鼠标不在音量调节上，则关闭调节音量的滑块
				t.isOnVolumeBar ? "" : t.isShowVolumeBar = false;
			}
		},
	},
	watch: {
		/*
		 * @description 监听音量大小变化
		 * */
		volume: function(nv, ov) {
			let t = this;
			if(nv == 0) { 
				t.mutedStatus = true;//音量为0的时候显示静音
			} else {
				t.$refs[t.audioRef].muted=false;
				t.mutedStatus = false;//取消静音
			}
		}
	}
}