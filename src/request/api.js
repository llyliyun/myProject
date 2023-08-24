//引入刚才的http.js文件
// import https from './http.js';
import https from "../../src/request/http.js";

import baseUrl from "./baseUrl";
import projectUrl from "./projectUrl";

//设置个对象，就不用一个个暴露了，直接暴露对象
let apiFun = {};

/* 获取列表 */
//查询列表，详情就是get
/* /api/getlist是请求接口地址，有http.js里面的Ip加上，如：http:192.168.0.1:9090//api/getlist  */
apiFun.getlist = function (params) {
  return https.get("/api/getlist", params);
};

/* 新增保存检查计划 */
//保存都是post
apiFun.saveJcInfo = function (params) {
  return https.post("/api/saveJcInfo", params);
};

apiFun.csfMonitor = function (params) {
  return https.post(`${baseUrl}/shenmu/project/list`, params);
};

//获取验证码接口
apiFun.randomImage = function (params) {
  return https.get(`${baseUrl}/security/sys/randomImage/${params}`);
};

// 登录接口
apiFun.sysLogin = function (params) {
  // http://222.143.35.109:2004/csf/security/sys/login
  return https.post(`${baseUrl}/security/sys/login`, params);
};

// 详细信息-核查信息接口
apiFun.csfCheck = function (params) {
  return https.get("/form/csfCheck/csfCheck/list", params);
};
// 获取项目概况信息
apiFun.getProjectOverView = function (params) {
  return https.get(`${projectUrl}/bus/pro/baseInfo`, params);
};
// 获取项目进度信息
apiFun.getProjectProgress = function (params) {
  return https.get(`${projectUrl}/pro/declare/info`, params);
};
// 获取项目亩均收益信息
apiFun.getProjectProfit = function (params) {
  return https.get(`${projectUrl}/pro/mujun/getDetail`, params);
};
// 请求文件树
apiFun.getFiles = function (params) {
  return https.get(`${projectUrl}/libs/doc/list`, params);
}
//名称搜索文件列表
apiFun.getFileLikeList = function (params) {
  return https.get(`${projectUrl}/libs/doc/fileLikeList`, params);
}
//批复文件
apiFun.getShenpiList = function (params) {
  return https.get(`${projectUrl}/pro/shenpi/list`, params);
}
//名称搜索文件列表
apiFun.getOrganizationList = function (params) {
  return https.get(`${baseUrl}/shenmu/earlyWarning/busDep`, params);
}
//请求图片接口
apiFun.csfMonitorImg = function (params) {
  return https.post(`${baseUrl}/shenmu/project/img`, params);
};
//请求图片接口
apiFun.csfMonitorProState= function (params) {
  return https.get(`${projectUrl}/bus/pro/state`, params);
};

//暴露出这个对象
export default apiFun;
