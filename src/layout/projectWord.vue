<template>
  <div class="projectWord">
    <div class="project-line">
      <div class="project-title">项目全流程跟踪<i class="el-icon-close" title="关闭"  @click="close"></i></div>
      <time-line style="height: 80px;width: 756px;position: relative;top:-12px;" :timeline="timeline" @l-timelinechanged="wordlineChanged"></time-line>
    </div>
    <div v-if="wordInfoShow" class="word-info">
      <div class="title">{{titleText}}<i class="el-icon-close" title="关闭" @click="()=>{wordInfoShow=false}"></i></div>
      <div class="cont" v-for="(obj,index) in infoObjArr" :key="index">
        <div class="cont-title">{{obj.createTime.substr(0,10)}}</div>
        <div class="cont-item">
          <div class="cont-span" v-for="(item,index) in titleObjArr" :key="index">
            <div  v-if="!obj['tab_'+item.tplKey]" style="display: flex;">
              {{item.tplName}}:<div class="cont-value">--</div></div>
            <div v-else-if="!obj['tab_'+item.tplKey].indexOf || obj['tab_'+item.tplKey].indexOf('url') === -1"  style="display: flex;">{{item.tplName}}:<div class="cont-value">{{obj['tab_'+item.tplKey]}}</div></div>
            <div v-else>
              {{item.tplName}}:
              <div class="demo-image__preview">
                <div class="cont-img">
                    <el-image 
                    v-for="(img,index) in JSON.parse(obj['tab_'+item.tplKey])" :key="index"
                      :src="imageIp + img.path" 
                      :preview-src-list="[imageIp + img.path]">
                    </el-image>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 导入组件
import {apiFlowList,apiFlowTitleInfo,apiFlowInfoById} from '@/js/project-api.js'
import timeLine from './projectTimeLine.vue'
export default {
  components: { timeLine},
  data() {
    return {
      wordInfoShow:false,
      titleText:"",
      timeline:{},
      projectInfo:[],
      titleObjArr:[],//流程的具体内容属性
      infoObjArr:[],//流程的具体值
      imageIp:"https://pms-app-1256720271.cos.ap-beijing.myqcloud.com"
    };
  },
  props: {
    projectObjProp: { 
      type: Object,
      default: ()=>{
        return {id:2293}
      }
    },
  },
  mounted(){
    if(this.projectObjProp){
      this.getFlowList();
    }
  },
  watch: {
    projectObjProp() {
      if(this.projectObjProp){
        this.getFlowList();
      }
    }
  },
  methods: {
    async wordlineChanged(val){
      this.wordInfoShow = true;
      this.titleObjArr = [];
      const findData = this.projectInfo[val.currentIndex];
      if(findData){
        this.titleText = findData.fname
        const titleRes = await apiFlowTitleInfo({
          flowCode: findData.flowCode
        });
        if(titleRes.data.code === 200){
          this.titleObjArr = titleRes.data.data;
        }
        const infoRes = await apiFlowInfoById({
          projectId: this.projectObjProp.proDeclareTotal.projectId,
          flowCode: findData.flowCode,
          pageIndex: 1,
          pageSize: 0
        });
        if(infoRes.data.code === 200){
          this.infoObjArr = infoRes.data.data;
        }
      }
    },
    /**获取项目流程的列表 */
    async getFlowList(){
      this.timeline.data = [];
      const dataList = [];
      const resList = await apiFlowList({
        projectId: this.projectObjProp.proDeclareTotal.projectId,
        flowCode: ''
      });
      if(resList.data && resList.data.code == 200){
        resList.data.data.map(item=>{
          dataList.push(item.fname)
        })
        this.timeline = {data:dataList};
        this.projectInfo = resList.data.data;
      } else {
        this.$message.error('获取项目流程失败');
        this.projectInfo = [];
      }
    },
    /**关闭窗体 */
    close(){
      this.$emit("changeProjectBtnFun")
    }
  },
};
</script>

<style lang="scss">
.projectWord{
  .el-icon-close{
    /* color: black; */
    float: right;
    /* z-index: 9999999999; */
    /* position: relative; */
    margin-right: 10px;
    cursor: -webkit-grab;
  }
  .project-line{
    min-width: 200px;
    // height: 110px;
    z-index: 99;
    position: fixed;
    float: right;
    right: 40px;
    top: 120px;
    
    background: rgba(0,13,22,0.6);
    border: 1px solid #42555E;
    border-radius: 6px;
    .project-title{
      background-image: url("./../../static/img/project/xiaobiao1.png");
      padding-left: 30px;
      font-size: 18px;
      font-family: ShiShangZhongHeiJianTi;
      font-weight: 400;
      line-height: 29px;
      color: rgba(255, 255, 255, 0.8);
      background-repeat: no-repeat;
      margin: 5px;
    }
  }
  .word-info{
    width: 300px;
    /* height: 110px; */
    /* z-index: 99; */
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
    background: rgba(0,13,22,0.6);
    border: 1px solid #42555E;
    border-radius: 6px;
    .title{
      padding-left: 30px;
      font-size: 18px;
      font-family: ShiShangZhongHeiJianTi;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.8);
      height: 29px;
      line-height: 29px;
      background-repeat: no-repeat;
      background-image: url("./../../static/img/project/xiaobiao1.png");
    }
    .cont{
      padding:15px 15px 0 15px;
      max-height: 500px;
      overflow: auto;
      .cont-item{
        padding: 5px;
      }
      .cont-span{
        padding: 5px
      }
      .cont-value{
        margin-left: 10px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 72%;;
      }
      .cont-img{
        padding: 5px;
        background: #a0a0a085;
        border-radius: 5px;
        max-height: 85px;
        overflow-y: hidden;
        display: table;
        display: inline-flex;
        overflow-x: auto;
        position: relative;
      }
      .demo-image__preview{
        overflow: auto;
      }
      .el-image {
        width: 100px;
        height: 80px;
        padding: 2px;
        .el-image__preview{
          width: 100px;
        }
      }
    }
  }
}
</style>

