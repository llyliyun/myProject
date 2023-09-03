import axios from "axios"

axios.defaults.headers.post["Content-Type"] =
  "application/json"
//axios.defaults.withCredentials = true;


const ip = "https://api.smartshenmu.com";

//项目流程列表
export const apiFlowList = params => {
  return axios.get(`${ip}/pms/pro/flow/bind`, {
    params: params
  })
};

//获取某流程的具体内容的title
export const apiFlowTitleInfo = params => {
  return axios.get(`${ip}/pms/flow/tpl/list`, {
    params: params
  })
};
//获取项目流程的具体内容
export const apiFlowInfoById = params => {
  return axios.get(`${ip}/pms/pro/flow/list`, {
    params: params
  })
};
//按照日期进行项目的进度
export const apiProjectScheduleByYears = params => {
  return axios.get(`${ip}/pms/pro/declare/info`, {
    params: params
  })
};
//获取时间
export const apiProjectYears = () => {
  return axios.get(`./static/data/timeJson.json`)
};