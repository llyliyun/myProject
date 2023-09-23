import axios from 'axios' //引入
import { message } from 'element-ui'
let baseURL = 'http://1.13.3.116:9000/'
// let baseURL = 'http://222.143.35.109:2014'
let config = {
  baseURL: baseURL,
  timeout: 30000, //设置最大请求时间
  headers:{
    'Content-Type': 'application/json;charset=utf-8'
  }
}
const _axios = axios.create(config)

/* 请求拦截器（请求之前的操作） */
// _axios.interceptors.request.use(
//   config => {
//     //如果有需要在这里开启请求时的loading动画效果
//     config.headers.Authorization = getToken; //添加token,需要结合自己的实际情况添加，
//     return config;
//   },
//   err => Promise.reject(err)
// );

/* 请求之后的操作 */
_axios.interceptors.response.use(
  res => {
    //在这里关闭请求时的loading动画效果
    //这里用于处理返回的结果，比如如果是返回401无权限，可能会是跳回到登录页的操作，结合自己的业务逻辑写
    if (res.data.code === 401) {
      err.message = "无权限操作";
    }
    if (res.data.code === 400) {
      err.message = "请求网络失败";
    }
    if (res.data.code === 404) {
      err.message = "请求网络失败";

    }
    return res;
  },
  err => {
    if (err) {
      //在这里关闭请求时的loading动画效果
      err.message = "请求网络失败";
    }
    return Promise.reject(err);
  }
);

//封装post,get方法
const http = {
  get(url = '', params = {}) {
    return new Promise((resolve, reject) => {
      _axios({
        url,
        params,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        method: 'GET'
      }).then((res) => {
        resolve(res.data)
        return res
      }).catch((error) => {
        reject(error)
      })
    })
  },
  post(url = '', params = {}) {
    return new Promise((resolve, reject) => {
      _axios({
        url,
        data: params,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        method: 'POST'
      }).then((res) => {
        resolve(res.data)
        return res
      }).catch((error) => {
        console.log(error);
        reject(error)
      })
    })
  }
}


export default http
