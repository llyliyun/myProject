<template>
  <div class="detcilBtn">
    <div>
      <el-button type="primary" :class="selectType == 'lcgz'?'selectBtn':''" @click="changeBtn('lcgz')">全流程跟踪</el-button>
      <el-button type="primary" :class="selectType == 'lsdb'?'selectBtn':''" @click="changeBtn('lsdb')">历史进度对比</el-button>
      <el-button type="primary" :class="selectType == 'analysis'?'selectBtn':''" @click="changeBtn('analysis')">专题分析</el-button>
    </div>
  </div>
</template>

<script>
// 导入组件

export default {
  components: { },
  data() {
    return {
    };
  },
  props: {
    selectType: {
      type: String,
      default: ''
    },
  },
  methods: {
    changeBtn(val){
      this.$emit("changeProjectBtnFun",val);
    }
  },
};
</script>

<style lang="scss">
.detcilBtn{
  position: absolute;
  float: left;
  left: 400px;
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
    line-height: 42px;
  }
  .selectBtn{ 
    background: linear-gradient(0deg, rgba(0,198,255,0.6), rgba(0,210,255,0.6));
  }
}
</style>
