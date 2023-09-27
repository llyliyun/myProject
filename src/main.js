// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Bus from './js/EventBus';
import Router from 'vue-router';
import locale from 'element-ui/lib/locale/lang/zh-CN';
import 'animate.css';
import 'element-ui/lib/theme-chalk/index.css';
import './icons/hn-font/hn-font/hn.css'
import ElementUI, {
  Loading, Message
} from 'element-ui';
import store from './store'



import moment from "moment"
Vue.prototype.$moment = moment;
const echarts = require('echarts')
Vue.prototype.$echarts = echarts
import apiFun from "../src/request/api.js";
Vue.prototype.$apiFun = apiFun; //请求接口api
Vue.config.productionTip = false

Vue.use(ElementUI, {
  locale
});
Vue.use(Bus);
//全局事件总线
window.EventBus = new Vue();

Vue.prototype.$L = L

Vue.prototype.Loading = Loading;
Vue.prototype.openLoading = function () {
  const loading = this.$loading({ // 声明一个loading对象
    lock: true, // 是否锁屏
    text: '加载中...', // 加载动画的文字
    spinner: 'el-icon-loading', // 引入的loading图标
    background: 'rgba(5,39,62,0.2)', // 背景颜色
    body: true,
  })
  return loading;
}
// //路由跳转错误处理
const originalPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err);
}
//原型配置区域
Vue.prototype.$message = Message;
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: {
    App,
  },
  template: '<App/>'
})


const bus = new Vue()
window.EventBus = bus;
