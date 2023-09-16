<template>
  <div class="project-history-info">
    <div class="project-line">
      <div class="project-title">项目历史进度<i class="el-icon-close" title="关闭" @click="close"></i></div>
      
      <time-line style="height: 80px;width: 100%" :timeline="timeline" @l-timelinechanged="historylineChanged"></time-line>
    </div>
    <div v-if="historyInfoShow" class="history-info">
      <div class="title">{{findData.year}}年{{findData.month}}月项目进度<i class="el-icon-close" title="关闭" @click="()=>{historyInfoShow=false}"></i></div>
      <div class="cont">
        <div class="cont-title">360全景</div>
        <div class="cont-item">
          暂无          
        </div>
      </div>
      <div class="cont">
        <div class="cont-title">遥感影像</div>
        <div class="cont-item">
          暂无          
        </div>
      </div>
      <div class="cont">
        <div class="cont-title">现场照片</div>
        <div v-if="scheduleVal.picture && scheduleVal.picture.length > 0" class="cont-item cont-img">
          <div class="cont-img">
            <el-image 
              v-for="(img,index) in scheduleVal.picture"
              :key="index"
              :src="img.url" 
              :preview-src-list="[img.url]">
            </el-image>
          </div>
        </div>
        <div v-else class="cont-item">
          暂无
        </div>
      </div>
      <div class="cont">
        <div class="cont-title">投资进度</div>
        <div class="cont-item">
          <div class="cont-span">当月完成投资：{{scheduleVal&&scheduleVal.constDepOver ? scheduleVal.constDepOver:'暂无'}}</div>
        </div>
      </div>
      <div class="cont">
        <div class="cont-title">形象进度描述</div>
        <div class="cont-item">
          <div class="cont-span">{{scheduleVal&&scheduleVal.description ? scheduleVal.description:"暂无"}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 导入组件

import {apiProjectScheduleByYears,apiProjectYears} from '@/js/project-api.js'

import timeLine from './timeLine'
export default {
  components: { timeLine},
  data() {
    return {
      historyInfoShow:false,
      timeline:{
        data:APPCONFIG.projectScheduleDate
      },
      findData:{
        year: '',
        month: ''
      },
      scheduleVal:{
        "id":0,
        "projectId":0,
        "fyear":0,
        "fmonth":0,
        "yearmonth":0,
        "constDepOver":0,
        "fiscalAppropr":0,
        "buildDepPay":0,
        "fixedInvestSystem":0,
        "picture":[],
        "description":"",
        "issue":null,
        "monthName":null,
        "createTime":"",
        "modifyTime":"",
        "employee":0,
        "weekOffset":0
      },
      yearsArr:[]
    };
  },
  props: {
    projectObjProp: { 
      type: Object,
      default: {
        id:2293
      }
    },
  },
  mounted(){
    if(this.projectObjProp)
      this.getYears()
  },
  methods: {
    async historylineChanged(val){
      this.findData = this.yearsArr[val.currentIndex];
      if(this.findData){
        await this.getProjectScheduleByYears({
          projectId: this.projectObjProp.id,
          year: this.findData.year,
          month: this.findData.month
        })
      }
      this.historyInfoShow = true;
    },
    async getYears(){
      const data = [];
      const years = await apiProjectYears();
      if(years.status === 200){
        years.data.map(item=>{
          data.push(item.name);
        })
        this.yearsArr = years.data;
      } else {
        this.$message.error('获取进度年份失败');
      }
      this.timeline.data = data;
    },
    async getProjectScheduleByYears(params){
      const schRes =  await apiProjectScheduleByYears(params);
      if(schRes.data.code == 200){
        if(schRes.data.data.proDeclare&&schRes.data.data.proDeclare.picture){
          schRes.data.data.proDeclare.picture = JSON.parse(schRes.data.data.proDeclare.picture);
        } else {
          schRes.data.data.proDeclare.picture = [];
        }
        this.scheduleVal = schRes.data.data.proDeclare
      } else {
        this.$message.error('获取进度失败');
        this.clearVal();
      }
    },
    clearVal(){
      this.scheduleVal={
        "projectId":0,
        "fyear":0,
        "fmonth":0,
        "yearmonth":0,
        "constDepOver":0,
        "fiscalAppropr":0,
        "buildDepPay":0,
        "fixedInvestSystem":0,
        "picture":[],
        "description":"",
        "issue":null,
        "monthName":null,
        "createTime":"",
        "modifyTime":"",
        "employee":0,
        "weekOffset":0
      }    
    },
    close(){
      this.clearVal();
      this.$emit("changeProjectBtnFun")
    }
  },
};
</script>

<style lang="scss">
.project-history-info{
  .el-icon-close{
    /* color: black; */
    float: right;
    /* z-index: 9999999999; */
    /* position: relative; */
    margin-right: 10px;
    cursor: -webkit-grab;
  }
  .project-line{
    width: 600px;
    min-width: 200px;
    height: 110px;
    z-index: 99;
    background: #0c293bba;
    border-radius: 5px;
    border: #62b4d8 solid 1px;
    position: fixed;
    float: right;
    right: 40px;
    top: 120px;
    .project-title{
      padding: 10px 0 0 10px;
    }
  }
  .history-info{
    width: 400px;
    /* height: 110px; */
    /* z-index: 99; */
    background: #0c293bba;
    border-radius: 5px;
    border: #62b4d8 solid 1px;
    padding: 10px;
    font-family: auto;
    font-size: 14px;
    color: #f9f9f9;
    margin: 50x;
    top: 10px;
    position: fixed;
    float: right;
    right: 40px;
    top: 240px;
    .title{
      font-size: 16px;
    }
    .cont{
      padding:8px 8px 0 8px;;
      .cont-title{
        padding-bottom: 5px;
      }
      .cont-img{
        max-height: 85px;
        overflow-x: auto;
        position: relative;
        overflow-y: hidden;
      }
      .demo-image__preview{
        overflow: auto;
      }
      .el-image {
        width: 100px;
        height: 80px;
        padding: 2px;
      }
      .cont-item{
        padding: 5px;
        background: #a0a0a085;
        border-radius: 5px;
      }
      .cont-span{
        padding: 5px
      }
    }
  }
}
</style>

