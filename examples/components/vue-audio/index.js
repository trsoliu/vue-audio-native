import vueAudio from './vueAudio.vue'
const component = {
	install: function(Vue, options) {
//		console.log(options, 7878)
		Vue.component('vue-audio', vueAudio)
//		Vue.component('sys-msg',{
//			template:"<div class='systemMessage'>{{msg}}</div>",
//			props:['msg'],
//			data() {
//				return {
//					msg1:options
//				}
//			},
//			created(){
//				
//			}
//		})
//		Vue.extend({
//			props: {
//				msg: options
//			}
//		})
	} //'component-name'这就是后面可以使用的组件的名字，install是默认的一个方法

}
// 导出该组件
export default component