<template>
  <div class="detcilBtn">
    <div>
      <el-button type="primary" :class="selectType == 'lcgz'?'selectBtn':''" @click="changeProjectBtnFun('lcgz')">全流程跟踪</el-button>
      <el-button type="primary" :class="selectType == 'lsdb'?'selectBtn':''" @click="changeProjectBtnFun('lsdb')">历史进度对比</el-button>
      <el-button type="primary" :class="selectType == 'analysis'?'selectBtn':''" @click="changeProjectBtnFun('analysis')">专题分析</el-button>
    </div>
    <project-word v-if="projectBtnInfoShow.wordShow" :projectObjProp="projectData" @changeProjectBtnFun="changeProjectBtnFun"></project-word>
    <project-history-info v-if="projectBtnInfoShow.oldInfoShow" :projectObjProp="projectData" @changeProjectBtnFun="changeProjectBtnFun"></project-history-info>
    <project-analysis v-if="projectBtnInfoShow.analysisShow" :projectObjProp="projectData" @changeProjectBtnFun="changeProjectBtnFun"></project-analysis>

  </div>
</template>

<script>
// 导入组件
import projectWord from './projectWord';
import projectHistoryInfo from "./projectHistoryInfo";
import projectAnalysis from "./projectAnalysis";
export default {
  components: {     
    projectWord,
    projectHistoryInfo,
    projectAnalysis,},
  data() {
    return {
      projectBtnInfoShow:{
        wordShow:false,
        oldInfoShow:false,
        analysisShow:false
      },
      selectType:"",
      projectData:{},
    };
  },
  props: {
  },
  methods: {
    /**进行项目事件的切换 */
    changeProjectBtnFun(val){
      this.selectType = val;
      if(val==='lcgz'){
        this.projectBtnInfoShow = {
          wordShow:true,
          oldInfoShow:false,
          analysisShow:false
        }
      } else if(val==='lsdb'){
        this.projectBtnInfoShow = {
          wordShow:false,
          oldInfoShow:true,
          analysisShow:false
        }
      } else if(val==='analysis'){
        this.projectBtnInfoShow = {
          wordShow:false,
          oldInfoShow:false,
          analysisShow:true
        }
      } else {
        this.projectBtnInfoShow = {
          wordShow:false,
          oldInfoShow:false,
          analysisShow:false
        }
      }
    },
    setProjectData(data){
      this.projectData = data;
    }
  },
};
</script>

<style lang="scss">
.detcilBtn{
  position: absolute;
  float: left;
  left: 404px;
  top: 47px;
  .el-button--primary {
    color: #FFF;
    margin: 5px 10px;
    padding: 0px;
    width: 130px;
    height: 40px;
    background: rgba(0,13,22,0.7);
    border: 1px solid #00D2FF;
    border-radius: 6px;
    font-size: 18px;
    font-family: ShiShangZhongHeiJianTi;
    font-weight: 400;
    color: #E5F9FF;
    // line-height: 42px;
  }
  .selectBtn{ 
    background: linear-gradient(0deg, rgba(0,198,255,0.6), rgba(0,210,255,0.6));
  }
}
</style>
