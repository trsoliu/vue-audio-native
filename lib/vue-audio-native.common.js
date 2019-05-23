module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "f0eb");
/******/ })
/************************************************************************/
/******/ ({

/***/ "09d2":
/***/ (function(module, exports) {

module.exports = "data:font/woff;base64,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"

/***/ }),

/***/ "24e8":
/***/ (function(module, exports) {

module.exports = "data:font/ttf;base64,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"

/***/ }),

/***/ "447d":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_vue_style_loader_4_1_2_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_css_loader_1_0_1_css_loader_index_js_ref_8_oneOf_1_1_node_modules_vue_loader_15_7_0_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_3_0_0_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_postcss_loader_3_0_0_postcss_loader_src_index_js_ref_8_oneOf_1_3_node_modules_sass_loader_7_1_0_sass_loader_lib_loader_js_ref_8_oneOf_1_4_node_modules_cache_loader_2_0_1_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_15_7_0_vue_loader_lib_index_js_vue_loader_options_VueAudioNative_vue_vue_type_style_index_0_id_c5135bb8_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("5393");
/* harmony import */ var _node_modules_vue_style_loader_4_1_2_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_css_loader_1_0_1_css_loader_index_js_ref_8_oneOf_1_1_node_modules_vue_loader_15_7_0_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_3_0_0_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_postcss_loader_3_0_0_postcss_loader_src_index_js_ref_8_oneOf_1_3_node_modules_sass_loader_7_1_0_sass_loader_lib_loader_js_ref_8_oneOf_1_4_node_modules_cache_loader_2_0_1_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_15_7_0_vue_loader_lib_index_js_vue_loader_options_VueAudioNative_vue_vue_type_style_index_0_id_c5135bb8_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_vue_style_loader_4_1_2_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_css_loader_1_0_1_css_loader_index_js_ref_8_oneOf_1_1_node_modules_vue_loader_15_7_0_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_3_0_0_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_postcss_loader_3_0_0_postcss_loader_src_index_js_ref_8_oneOf_1_3_node_modules_sass_loader_7_1_0_sass_loader_lib_loader_js_ref_8_oneOf_1_4_node_modules_cache_loader_2_0_1_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_15_7_0_vue_loader_lib_index_js_vue_loader_options_VueAudioNative_vue_vue_type_style_index_0_id_c5135bb8_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_vue_style_loader_4_1_2_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_css_loader_1_0_1_css_loader_index_js_ref_8_oneOf_1_1_node_modules_vue_loader_15_7_0_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_3_0_0_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_postcss_loader_3_0_0_postcss_loader_src_index_js_ref_8_oneOf_1_3_node_modules_sass_loader_7_1_0_sass_loader_lib_loader_js_ref_8_oneOf_1_4_node_modules_cache_loader_2_0_1_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_15_7_0_vue_loader_lib_index_js_vue_loader_options_VueAudioNative_vue_vue_type_style_index_0_id_c5135bb8_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "5393":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("eb93");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__("8560").default
var update = add("64dde870", content, true, {"sourceMap":false,"shadowMode":false});

/***/ }),

/***/ "8560":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./node_modules/._vue-style-loader@4.1.2@vue-style-loader/lib/listToStyles.js
/**
 * Translates the list format produced by css-loader into something
 * easier to manipulate.
 */
function listToStyles (parentId, list) {
  var styles = []
  var newStyles = {}
  for (var i = 0; i < list.length; i++) {
    var item = list[i]
    var id = item[0]
    var css = item[1]
    var media = item[2]
    var sourceMap = item[3]
    var part = {
      id: parentId + ':' + i,
      css: css,
      media: media,
      sourceMap: sourceMap
    }
    if (!newStyles[id]) {
      styles.push(newStyles[id] = { id: id, parts: [part] })
    } else {
      newStyles[id].parts.push(part)
    }
  }
  return styles
}

// CONCATENATED MODULE: ./node_modules/._vue-style-loader@4.1.2@vue-style-loader/lib/addStylesClient.js
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return addStylesClient; });
/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
  Modified by Evan You @yyx990803
*/



var hasDocument = typeof document !== 'undefined'

if (typeof DEBUG !== 'undefined' && DEBUG) {
  if (!hasDocument) {
    throw new Error(
    'vue-style-loader cannot be used in a non-browser environment. ' +
    "Use { target: 'node' } in your Webpack config to indicate a server-rendering environment."
  ) }
}

/*
type StyleObject = {
  id: number;
  parts: Array<StyleObjectPart>
}

type StyleObjectPart = {
  css: string;
  media: string;
  sourceMap: ?string
}
*/

var stylesInDom = {/*
  [id: number]: {
    id: number,
    refs: number,
    parts: Array<(obj?: StyleObjectPart) => void>
  }
*/}

var head = hasDocument && (document.head || document.getElementsByTagName('head')[0])
var singletonElement = null
var singletonCounter = 0
var isProduction = false
var noop = function () {}
var options = null
var ssrIdKey = 'data-vue-ssr-id'

// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
// tags it will allow on a page
var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\b/.test(navigator.userAgent.toLowerCase())

function addStylesClient (parentId, list, _isProduction, _options) {
  isProduction = _isProduction

  options = _options || {}

  var styles = listToStyles(parentId, list)
  addStylesToDom(styles)

  return function update (newList) {
    var mayRemove = []
    for (var i = 0; i < styles.length; i++) {
      var item = styles[i]
      var domStyle = stylesInDom[item.id]
      domStyle.refs--
      mayRemove.push(domStyle)
    }
    if (newList) {
      styles = listToStyles(parentId, newList)
      addStylesToDom(styles)
    } else {
      styles = []
    }
    for (var i = 0; i < mayRemove.length; i++) {
      var domStyle = mayRemove[i]
      if (domStyle.refs === 0) {
        for (var j = 0; j < domStyle.parts.length; j++) {
          domStyle.parts[j]()
        }
        delete stylesInDom[domStyle.id]
      }
    }
  }
}

function addStylesToDom (styles /* Array<StyleObject> */) {
  for (var i = 0; i < styles.length; i++) {
    var item = styles[i]
    var domStyle = stylesInDom[item.id]
    if (domStyle) {
      domStyle.refs++
      for (var j = 0; j < domStyle.parts.length; j++) {
        domStyle.parts[j](item.parts[j])
      }
      for (; j < item.parts.length; j++) {
        domStyle.parts.push(addStyle(item.parts[j]))
      }
      if (domStyle.parts.length > item.parts.length) {
        domStyle.parts.length = item.parts.length
      }
    } else {
      var parts = []
      for (var j = 0; j < item.parts.length; j++) {
        parts.push(addStyle(item.parts[j]))
      }
      stylesInDom[item.id] = { id: item.id, refs: 1, parts: parts }
    }
  }
}

function createStyleElement () {
  var styleElement = document.createElement('style')
  styleElement.type = 'text/css'
  head.appendChild(styleElement)
  return styleElement
}

function addStyle (obj /* StyleObjectPart */) {
  var update, remove
  var styleElement = document.querySelector('style[' + ssrIdKey + '~="' + obj.id + '"]')

  if (styleElement) {
    if (isProduction) {
      // has SSR styles and in production mode.
      // simply do nothing.
      return noop
    } else {
      // has SSR styles but in dev mode.
      // for some reason Chrome can't handle source map in server-rendered
      // style tags - source maps in <style> only works if the style tag is
      // created and inserted dynamically. So we remove the server rendered
      // styles and inject new ones.
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  if (isOldIE) {
    // use singleton mode for IE9.
    var styleIndex = singletonCounter++
    styleElement = singletonElement || (singletonElement = createStyleElement())
    update = applyToSingletonTag.bind(null, styleElement, styleIndex, false)
    remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true)
  } else {
    // use multi-style-tag mode in all other cases
    styleElement = createStyleElement()
    update = applyToTag.bind(null, styleElement)
    remove = function () {
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  update(obj)

  return function updateStyle (newObj /* StyleObjectPart */) {
    if (newObj) {
      if (newObj.css === obj.css &&
          newObj.media === obj.media &&
          newObj.sourceMap === obj.sourceMap) {
        return
      }
      update(obj = newObj)
    } else {
      remove()
    }
  }
}

var replaceText = (function () {
  var textStore = []

  return function (index, replacement) {
    textStore[index] = replacement
    return textStore.filter(Boolean).join('\n')
  }
})()

function applyToSingletonTag (styleElement, index, remove, obj) {
  var css = remove ? '' : obj.css

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = replaceText(index, css)
  } else {
    var cssNode = document.createTextNode(css)
    var childNodes = styleElement.childNodes
    if (childNodes[index]) styleElement.removeChild(childNodes[index])
    if (childNodes.length) {
      styleElement.insertBefore(cssNode, childNodes[index])
    } else {
      styleElement.appendChild(cssNode)
    }
  }
}

function applyToTag (styleElement, obj) {
  var css = obj.css
  var media = obj.media
  var sourceMap = obj.sourceMap

  if (media) {
    styleElement.setAttribute('media', media)
  }
  if (options.ssrId) {
    styleElement.setAttribute(ssrIdKey, obj.id)
  }

  if (sourceMap) {
    // https://developer.chrome.com/devtools/docs/javascript-debugging
    // this makes source maps inside style tags work properly in Chrome
    css += '\n/*# sourceURL=' + sourceMap.sources[0] + ' */'
    // http://stackoverflow.com/a/26603875
    css += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + ' */'
  }

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild)
    }
    styleElement.appendChild(document.createTextNode(css))
  }
}


/***/ }),

/***/ "8bbf":
/***/ (function(module, exports) {

module.exports = require("vue");

/***/ }),

/***/ "bf9f":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "img/iconfont.e0f9a4cd.svg";

/***/ }),

/***/ "cddc":
/***/ (function(module, exports) {

module.exports = "data:application/vnd.ms-fontobject;base64,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"

/***/ }),

/***/ "eb93":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("f511")(false);
// imports
exports.i(__webpack_require__("fa03"), "");

// module
exports.push([module.i, ".vueAudioNative[data-v-c5135bb8]{width:100%;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;padding:5px 10px;-webkit-box-sizing:border-box;box-sizing:border-box}.vueAudioNative[data-v-c5135bb8],.vueAudioNative .audio-left[data-v-c5135bb8]{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center}.vueAudioNative .audio-left .iconfont[data-v-c5135bb8]{font-size:20px;color:#2c8ef6;cursor:pointer;-moz-user-select:none;-webkit-user-select:none;-ms-user-select:none;user-select:none}.vueAudioNative .audio-left span[data-v-c5135bb8]{font-size:16px;padding:7px 5px 5px}.vueAudioNative .audio-right[data-v-c5135bb8]{-webkit-box-flex:1;-ms-flex:auto;flex:auto;margin-left:6px;position:relative;-moz-user-select:none;-webkit-user-select:none;-ms-user-select:none;user-select:none}.vueAudioNative .audio-right .slider[data-v-c5135bb8]{width:100%;height:6px;border-radius:4px;background-color:#e8eaec;cursor:pointer}@-webkit-keyframes anim-name-data-v-c5135bb8{0%{-webkit-transform:rotate(0);transform:rotate(0)}25%{-webkit-transform:rotate(90deg);transform:rotate(90deg)}50%{-webkit-transform:rotate(180deg);transform:rotate(180deg)}75%{-webkit-transform:rotate(270deg);transform:rotate(270deg)}to{-webkit-transform:rotate(1turn);transform:rotate(1turn)}}.vueAudioNative .audio-right .slider .slider-btn[data-v-c5135bb8]{width:10px;height:10px;margin-left:-5px;position:absolute;top:-4px;left:0;z-index:3;border:2px solid #2c8ef6;-webkit-box-sizing:content-box;box-sizing:content-box;border-radius:20px;background-color:#fff}.vueAudioNative .audio-right .slider .slider-btn .anim[data-v-c5135bb8]{position:absolute;top:-2px;left:-1px;font-size:12px!important;color:#2c8ef6;-webkit-animation:anim-name-data-v-c5135bb8 1s linear infinite;animation:anim-name-data-v-c5135bb8 1s linear infinite;-webkit-transform-origin:center center;transform-origin:center center}.vueAudioNative .audio-right .slider .slider-btn .tip-on[data-v-c5135bb8],.vueAudioNative .audio-right .slider .slider-btn:hover .tip-hover[data-v-c5135bb8]{display:block!important;padding:5px 5px;position:absolute;top:-35px;left:-150%;font-size:12px;color:#fff;border-radius:4px;background-color:#2c8ef6}.vueAudioNative .audio-right .slider .slider-btn .tip-on .arrow[data-v-c5135bb8],.vueAudioNative .audio-right .slider .slider-btn:hover .tip-hover .arrow[data-v-c5135bb8]{left:50%;margin-left:-5px;position:absolute;width:0;height:0;border-color:transparent;border-style:solid;bottom:-5px;border-width:5px 5px 0;border-top-color:#2c8ef6}.vueAudioNative .audio-right .slider .slider-btn[data-v-c5135bb8]:hover{width:14px;height:14px;margin-left:-7px;top:-6px;border:3px solid #2c8ef6}.vueAudioNative .audio-right .slider .slider-btn:hover .tip-hover[data-v-c5135bb8]{left:-100%}.vueAudioNative .audio-right .slider .slider-btn:hover .anim[data-v-c5135bb8]{top:-1px;font-size:16px!important}.vueAudioNative .audio-right .slider .slider-bar[data-v-c5135bb8]{height:6px;position:absolute;top:0;left:0;z-index:2;border-radius:4px;background-color:#2c8ef6}.vueAudioNative .audio-right .slider .slider-buffer[data-v-c5135bb8]{height:6px;position:absolute;top:0;left:0;z-index:1;border-radius:4px;background-color:#dcdee2}.vueAudioNative .audio-download[data-v-c5135bb8]{margin-left:10px;color:#2c8ef6!important;-moz-user-select:none;-webkit-user-select:none;-ms-user-select:none;user-select:none}.vueAudioNative a[data-v-c5135bb8]:-webkit-any-link{color:#2c8ef6!important}.vueAudioNative .hint[data-v-c5135bb8]{-webkit-box-flex:1;-ms-flex:auto;flex:auto;text-align:center;padding:15px 0}", ""]);

// exports


/***/ }),

/***/ "f0eb":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./node_modules/._@vue_cli-service@3.5.3@@vue/cli-service/lib/commands/build/setPublicPath.js
// This file is imported into lib/wc client bundles.

if (typeof window !== 'undefined') {
  var i
  if ((i = window.document.currentScript) && (i = i.src.match(/(.+\/)[^/]+\.js(\?.*)?$/))) {
    __webpack_require__.p = i[1] // eslint-disable-line
  }
}

// Indicate to webpack that this file can be concatenated
/* harmony default export */ var setPublicPath = (null);

// CONCATENATED MODULE: ./node_modules/._cache-loader@2.0.1@cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"020210a0-vue-loader-template"}!./node_modules/._vue-loader@15.7.0@vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/._cache-loader@2.0.1@cache-loader/dist/cjs.js??ref--0-0!./node_modules/._vue-loader@15.7.0@vue-loader/lib??vue-loader-options!./packages/vue-audio-native/VueAudioNative.vue?vue&type=template&id=c5135bb8&scoped=true&lang=html&
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"vueAudioNative"},[(!!_vm.url)?[(!_vm.showControls)?[_c('audio',{ref:_vm.audioRef,attrs:{"src":_vm.url,"id":_vm.audioRef,"autoplay":_vm.autoplay,"preload":"preload"},on:{"play":_vm.onPlay,"pause":_vm.onPause,"ended":_vm.onEnd,"loadstart":_vm.onLoadstart,"loadeddata":_vm.onLoadeddata,"loadedmetadata":_vm.onLoadedmetadata,"timeupdate":_vm.onTimeupdate,"waiting":_vm.onWaiting}}),(!!_vm.readyState)?[_c('div',{staticClass:"audio-left"},[_c('b',{staticClass:"iconfont played",on:{"click":_vm.startPlayOrPause}},[_vm._v(_vm._s(_vm.playedStauts ? "" : ""))]),_c('span',[_vm._v(_vm._s(_vm.showCurrentTime?_vm.processFormatTime(_vm.currentTime)+"/":"")+_vm._s(_vm.processFormatTime(_vm.duration)))])]),_c('div',{staticClass:"audio-right"},[_c('div',{ref:"slider",staticClass:"slider",attrs:{"id":"slider"},on:{"mousedown":function($event){return _vm.drag($event,0)}}},[_c('div',{staticClass:"slider-btn",style:({left:100*_vm.sliderTime/_vm.duration+'%'})},[(_vm.isWaitBuffer && _vm.waitBuffer)?_c('b',{staticClass:"anim iconfont iconjiazai"}):_vm._e(),_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.dragStatus),expression:"dragStatus"}],staticClass:"tip-hover",class:{'tip-on':_vm.dragStatus}},[_vm._v("\n\t\t\t\t\t\t\t\t"+_vm._s(_vm.processFormatTime(_vm.sliderTime))+"\n\t\t\t\t\t\t\t\t"),_c('div',{staticClass:"arrow"})])]),_c('div',{staticClass:"slider-bar",style:({width:100*_vm.sliderTime/_vm.duration+'%'})}),_c('div',{staticClass:"slider-buffer",style:({width:100*_vm.maxBuffer/_vm.duration+'%'})})])]),(_vm.showDownload)?_c('div',{staticClass:"audio-download"},[_c('a',{staticClass:"iconfont",attrs:{"href":_vm.url,"target":"_blank","download":""}},[_vm._v("")])]):_vm._e()]:_vm._e()]:(_vm.showControls)?[_c('audio',{directives:[{name:"show",rawName:"v-show",value:(!!_vm.readyState),expression:"!!readyState"}],ref:_vm.audioRef,attrs:{"controls":"","autoplay":_vm.autoplay,"preload":"preload","id":_vm.audioRef},on:{"play":_vm.onPlay,"pause":_vm.onPause,"ended":_vm.onEnd,"loadstart":_vm.onLoadstart,"loadeddata":_vm.onLoadeddata,"loadedmetadata":_vm.onLoadedmetadata,"timeupdate":_vm.onTimeupdate}},[_c('source',{attrs:{"src":_vm.url}})])]:_vm._e()]:_vm._e(),(!_vm.url || !_vm.readyState)?_c('div',{staticClass:"hint"},[_vm._t("slotTip",[_vm._v(_vm._s(_vm.hint))])],2):_vm._e()],2)}
var staticRenderFns = []


// CONCATENATED MODULE: ./packages/vue-audio-native/VueAudioNative.vue?vue&type=template&id=c5135bb8&scoped=true&lang=html&

// EXTERNAL MODULE: external {"commonjs":"vue","commonjs2":"vue","root":"Vue"}
var external_commonjs_vue_commonjs2_vue_root_Vue_ = __webpack_require__("8bbf");

// CONCATENATED MODULE: ./node_modules/._cache-loader@2.0.1@cache-loader/dist/cjs.js??ref--0-0!./node_modules/._vue-loader@15.7.0@vue-loader/lib??vue-loader-options!./packages/vue-audio-native/VueAudioNative.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


//	export default Vue.extend({
/* harmony default export */ var VueAudioNativevue_type_script_lang_js_ = ({
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
		showDownload: {
			type: Boolean,
			default: true //默认显示下载按钮
		},
		autoplay: {
			type: Boolean,
			default: false //默认不自动播放
		},
		hint: {
			type: String,
			default: "暂无有效音频...", //无音频情况下提示文案
		},
		waitBuffer: {
			type: Boolean,
			default: true //拖拽到未加载的时间，是否需要等待加载，true:滑块位置不动，等待加载音频资源后播放，false：当滑动位置大于当前缓冲的最大位置，则重置到当前最大缓冲位置
		}
	},
	data() {
		return {
			audioRef: "audio123131", //默认audio组件的唯一识别码
			readyStateInterval: null, //循环检查音频加载状态
			readyState: 0, //当前音频状态
			interval: null, //循环检查音频缓冲位置
			maxBuffer: 0, //当前缓冲的最大位置
			isWaitBuffer: false, //true:当前音频正在加载中，false：加载完成
			waitingST:null,
			duration: 0, //音频总长度
			playedStauts: false, //播放状态，true播放，false暂停
			sliderTime: 0, //进度条时间
			currentTime: 0, //当前播放时间长度
			dragStatus: false, //true:可以拖拽，false：拖拽结束
			dragFlag: 2, //0:滑块按钮被选中（mousedown）,1:滑块按钮被拖动（mousemove），2:滑块按钮被释放（mouseup）
			//				startX: 0, //初始进度条最左边的位置值
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
			//				window.clearInterval(t.interval);
			t.playedStauts = false;
			//				t.$emit('on-pause',t.playedStauts);
		},
		/**
		 * @description 当音频结束
		 */
		onEnd() {
			//音频播放是否结束
			let t = this;
			//				t.$refs[t.audioRef].pause();
			t.sliderTime = 0;
		},
		/**
		 *  @description 进度条、Tip等 转换音频时间格式 duration秒单位 
		 * 转换为 mm:ss
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
				ct = 0; //current time  拖拽设置的时间
			if(!t.waitBuffer) {
				//当滑动位置大于当前缓冲的最大位置，则重置到当前最大缓冲位置
				event > t.maxBuffer ? ct = t.maxBuffer : ct = event;
			} else {
				ct = event;
			}

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
				//console.log(t.$refs[t.audioRef].currentTime,99991)
				if(t.waitBuffer){
					window.clearTimeout(t.waitingST);
					t.isWaitBuffer = false;
				}
			}
		},
		/** @description 当前音频初始化加载状态检查,当前音频加载状态readyState===4时显示播放控件，否则显示“音频正在上传中，请稍等...”
		 *  */
		onLoadstart(event) {
			let t = this,
				readyState = 0,
				loadstartTime = new Date().getTime();
			//console.log(event, t.$refs[t.audioRef].readyState, 666);
			t.readyStateInterval = window.setInterval(function() {
				//console.log(t.$refs[t.audioRef].readyState, new Date().getTime() - loadstartTime, 55);
				try {
					readyState = t.$refs[t.audioRef].readyState;
					if(readyState === 4 || (new Date().getTime() - loadstartTime > 90000)) {
						t.readyState = readyState;
						window.clearInterval(t.readyStateInterval);
						t.readyStateInterval = null;
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
					let buffered = t.$refs[t.audioRef].buffered;
					//当音频不存在||还没有缓冲
					if(!t.$refs[t.audioRef] || buffered.length < 1) return true;
					//获取当前缓冲的最大位置
					t.maxBuffer = parseInt(buffered.end(buffered.length - 1));
					//console.log(t.maxBuffer,99999,buffered.end(buffered.length-1))
					//当缓存的时间大于等于音频的总时间，则停止
					if(Math.floor(buffered.end(buffered.length - 1)) >= Math.floor(t.$refs[t.audioRef].duration)) {
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
			t.$emit('on-metadata', event);
		},
		/** @description 当媒介已停止播放但打算继续播放时（比如当媒介暂停已缓冲更多数据）运行脚本
		 *  */
		onWaiting(event) {
			let t=this;
			t.waitingST = setTimeout(() => {
				t.waitBuffer ? t.isWaitBuffer = true : '';
				window.clearTimeout(t.waitingST);
			},50)
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
					let startX = document.getElementById('slider').getBoundingClientRect().left; //初始进度条最左边的位置x坐标值
					let clientX = event.clientX; //鼠标当前位置x坐标
					let offsetWidth = t.$refs.slider.offsetWidth; //进度条长度
					t.sliderTime = t.duration * (clientX > startX + 5 ? (clientX - startX > offsetWidth ? offsetWidth : clientX - startX - 5) : 0) / offsetWidth;
				} else if(flag == 2) { //拖拽修改播放时间
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
			let t = this;
			t.removeHandler(document, "mousemove", function(event) {
				t.drag(event, 1)
			});　
			t.removeHandler(document, "mouseup", function(event) {
				t.drag(event, 2)
			});　
		}
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
	destroyed() {
		let t = this;
		window.clearInterval(t.interval);
		t.interval = null;
		window.clearInterval(t.readyStateInterval);
		t.readyStateInterval = null;
		t.remove();
	},
	mounted() {
		let t = this;
		t.audioRef = "audio" + new Date().getTime() + Math.ceil(Math.random() * 10);
		window.clearInterval(t.interval);
		t.interval = null;
		window.clearInterval(t.readyStateInterval);
		t.readyStateInterval = null;
		window.clearTimeout(t.waitingST);
		t.waitingST=null;
	},
	watch: {
		/**
		 * 监听音频路径的变化，及时重置音频
		 * **/
		url: function(nv, ov) {
			let t = this;
			if(nv != ov && !!nv) {
				window.clearTimeout(t.waitingST);
				window.clearInterval(t.interval);
				window.clearInterval(t.readyStateInterval);
				t.onPause();
				//重置页面布局 重置页面数据 请求接口数据
				Object.assign(t.$data, t.$options.data());
				t.audioRef = "audio" + new Date().getTime() + Math.ceil(Math.random() * 10);
			}
		}
	}
});

// CONCATENATED MODULE: ./packages/vue-audio-native/VueAudioNative.vue?vue&type=script&lang=js&
 /* harmony default export */ var vue_audio_native_VueAudioNativevue_type_script_lang_js_ = (VueAudioNativevue_type_script_lang_js_); 
// EXTERNAL MODULE: ./packages/vue-audio-native/VueAudioNative.vue?vue&type=style&index=0&id=c5135bb8&lang=scss&scoped=true&
var VueAudioNativevue_type_style_index_0_id_c5135bb8_lang_scss_scoped_true_ = __webpack_require__("447d");

// CONCATENATED MODULE: ./node_modules/._vue-loader@15.7.0@vue-loader/lib/runtime/componentNormalizer.js
/* globals __VUE_SSR_CONTEXT__ */

// IMPORTANT: Do NOT use ES2015 features in this file (except for modules).
// This module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle.

function normalizeComponent (
  scriptExports,
  render,
  staticRenderFns,
  functionalTemplate,
  injectStyles,
  scopeId,
  moduleIdentifier, /* server only */
  shadowMode /* vue-cli only */
) {
  // Vue.extend constructor export interop
  var options = typeof scriptExports === 'function'
    ? scriptExports.options
    : scriptExports

  // render functions
  if (render) {
    options.render = render
    options.staticRenderFns = staticRenderFns
    options._compiled = true
  }

  // functional template
  if (functionalTemplate) {
    options.functional = true
  }

  // scopedId
  if (scopeId) {
    options._scopeId = 'data-v-' + scopeId
  }

  var hook
  if (moduleIdentifier) { // server build
    hook = function (context) {
      // 2.3 injection
      context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
      // 2.2 with runInNewContext: true
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__
      }
      // inject component styles
      if (injectStyles) {
        injectStyles.call(this, context)
      }
      // register component module identifier for async chunk inferrence
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier)
      }
    }
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook
  } else if (injectStyles) {
    hook = shadowMode
      ? function () { injectStyles.call(this, this.$root.$options.shadowRoot) }
      : injectStyles
  }

  if (hook) {
    if (options.functional) {
      // for template-only hot-reload because in that case the render fn doesn't
      // go through the normalizer
      options._injectStyles = hook
      // register for functioal component in vue file
      var originalRender = options.render
      options.render = function renderWithStyleInjection (h, context) {
        hook.call(context)
        return originalRender(h, context)
      }
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate
      options.beforeCreate = existing
        ? [].concat(existing, hook)
        : [hook]
    }
  }

  return {
    exports: scriptExports,
    options: options
  }
}

// CONCATENATED MODULE: ./packages/vue-audio-native/VueAudioNative.vue






/* normalize component */

var component = normalizeComponent(
  vue_audio_native_VueAudioNativevue_type_script_lang_js_,
  render,
  staticRenderFns,
  false,
  null,
  "c5135bb8",
  null
  
)

/* harmony default export */ var VueAudioNative = (component.exports);
// CONCATENATED MODULE: ./packages/vue-audio-native/index.js

//const component = {
//	install: function(Vue, options) {
////		console.log(options, 7878)
//		Vue.component('vue-audio-native', vueAudioNative)
////		Vue.component('sys-msg',{
////			template:"<div class='systemMessage'>{{msg}}</div>",
////			props:['msg'],
////			data() {
////				return {
////					msg1:options
////				}
////			},
////			created(){
////				
////			}
////		})
////		Vue.extend({
////			props: {
////				msg: options
////			}
////		})
//	} //'component-name'这就是后面可以使用的组件的名字，install是默认的一个方法
//
//}
//// 导出该组件
//export default component

// 为组件提供 install 安装方法，供按需引入
VueAudioNative.install = function(Vue) {
//	console.log(vueAudioNative)
	Vue.component(VueAudioNative.name, VueAudioNative)
}
// 默认导出组件
/* harmony default export */ var vue_audio_native = (VueAudioNative);
// CONCATENATED MODULE: ./packages/index.js
// 导入颜色选择器组件


// 存储组件列表
const components = [
  vue_audio_native
]

// 定义 install 方法，接收 Vue 作为参数。如果使用 use 注册插件，则所有的组件都将被注册
const install = function (Vue) {
  // 判断是否可以安装
  if (install.installed) return
  // 遍历注册全局组件
  components.map(component => Vue.component(component.name, component))
}

// 判断是否是直接引入文件
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

/* harmony default export */ var packages_0 = ({
  // 导出的对象必须具有 install，才能被 Vue.use() 方法安装
  install,
  // 以下是具体的组件列表
  ...components
});
// CONCATENATED MODULE: ./node_modules/._@vue_cli-service@3.5.3@@vue/cli-service/lib/commands/build/entry-lib.js


/* harmony default export */ var entry_lib = __webpack_exports__["default"] = (packages_0);



/***/ }),

/***/ "f511":
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),

/***/ "f705":
/***/ (function(module, exports) {

module.exports = function escape(url) {
    if (typeof url !== 'string') {
        return url
    }
    // If url is already wrapped in quotes, remove them
    if (/^['"].*['"]$/.test(url)) {
        url = url.slice(1, -1);
    }
    // Should url be wrapped?
    // See https://drafts.csswg.org/css-values-3/#urls
    if (/["'() \t\n]/.test(url)) {
        return '"' + url.replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"'
    }

    return url
}


/***/ }),

/***/ "fa03":
/***/ (function(module, exports, __webpack_require__) {

var escape = __webpack_require__("f705");
exports = module.exports = __webpack_require__("f511")(false);
// imports


// module
exports.push([module.i, "@font-face{font-family:iconfont;src:url(" + escape(__webpack_require__("cddc")) + ");src:url(" + escape(__webpack_require__("cddc")) + "#iefix) format(\"embedded-opentype\"),url(\"data:application/x-font-woff2;charset=utf-8;base64,d09GMgABAAAAAAR8AAsAAAAACYQAAAQuAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHEIGVgCDKgqGKIUPATYCJAMUCwwABCAFhG0HTBsXCFGULkqV7A9QQS7dD6QEC86BhcMAAAAAAO5jUXg/O0H/Fm5YWO4IEEH9HO/ee0l+mnwCVQQFgAqQXSWwKgtdIzs1kiXr6uy316VjGpXnu2XVmmrhb+Su17/zw/Q4jcUYhAThSHRz5nZ5gTHTgYuKm6fscjfx3QegSgDV+/BEFbhOldYVOb0c42SCgWl9le9E+fssGqGfH5f1wMYGv3bnXoR/oGbGhbjMvJBgpbYlsNS8h3ityzyZQGOKnsrWzekKbQV9rUDcCF5BO+FXVHQPtVAV7FiMxiulOr1IAS+9149/JlGTlJm+4Z5LawuznydFvt/dd8LBMA4XBbsbGYuAgrhWGL+gFtQXqWnktnUrgdpYLvHz5HdF1yHhjmkr+sp/eQ2SrBBERUe9hLjRXhyZ0ZKS+HlHSubnXSkFv8N0HajE1RtMAB2xAoijqD3uWNn26fYBkxa9vYKBgegdvMztL95jEhlByqUWsDxmGGssGNjrTHAIMoraWvmxP0hx85iuOmKVxxZtGC60xpplo23MGQYCNlbL3hYVTByTWFZBb0WpnLSsZMkkmAWsGgQZ0H84CConHhR6y2O41KqKTRIyc1gRw6BmyL+/3H/2WHHxXHX+VHn6MFAuOYTZkUcFcyb3TS3rSpDuY5I1GQHz1Qbxx6MeR2GguI/EYKmhi73DNW9n7Fp2svh7Fh39qMm6uI8Mrq3zeKqV7DQbd+FmX/ds8BpovlsWMXVUMX1H3G3Kqp0OUVqzkgYeoW5etFuYJdy32DHYiG0xpHCREMyT1IjF/UHuouELgzKrLlR72KbmAMZ9VK/UwZaFYtWmGsttgAsxi/uE7gsXYwZYxtLXmh8WRYaa9wZdis/OvLLnaDk7a11Fn/H4+yf6i81LzEORH7/NqnWCPlPTYbMKiijOMk9EOZiG15ppVKs4La4App+f8QRz5rR5Osf3ks/z+iKU11vSTkK1LvFfrfzH+d3zVQaSsBPoq+Zt6Rjoxu4880v9jk8sz+wmo3j5/+u2AJ97D357/u5+M4f/wtjY+AONKM4BUOzmzHqgLKRRluNcl0FKr7W8loJGc/9NmB72N4x7jGoKtbEIkh6TIavNwhbERVBqLYVKbQM0Ftru3hrBaqKYhAU+AcKgL0j6fYRs0A+2IP5Cadw/VAYjQ+NQjBywNSeudrcwKSGL+h2DyVJnhqTrdz+Tf44Vx82e4Im4DCUcU7p5SynxEJuUL34i4tBxluAGTkdxnGHO2YOMDO4i+XToRc80MFkCXVswoghiIe0dCoxMyjmTi27m5c+I9yymcMW4suYTwkph/mhsYNQAu0Vpo3GXcpvSC29CCAc5LJNAG4iS2KhnUF683AMxxMC9QzU3NcSJXFM0mN6Z3OMp0NAvUkaKHEWUUamuBfWhQvNc5lTqW6HufPKpb94r8AEAAAA=\") format(\"woff2\"),url(" + escape(__webpack_require__("09d2")) + ") format(\"woff\"),url(" + escape(__webpack_require__("24e8")) + ") format(\"truetype\"),url(" + escape(__webpack_require__("bf9f")) + "#iconfont) format(\"svg\")}.iconfont{font-family:iconfont!important;font-size:16px;font-style:normal;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.iconjiazai:before{content:\"\\E801\"}.iconbofang:before{content:\"\\E65D\"}.iconzanting:before{content:\"\\E670\"}.iconxiazai:before{content:\"\\E671\"}", ""]);

// exports


/***/ })

/******/ });
//# sourceMappingURL=vue-audio-native.common.js.map