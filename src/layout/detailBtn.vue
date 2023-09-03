<template>
  <div class="detcilBtn">
    <div>
      <el-button type="primary" @click="changeBtn('lcgz')">全流程跟踪</el-button>
      <el-button type="primary" @click="changeBtn('lsdb')">历史进度对比</el-button>
      <el-button type="primary" @click="changeBtn('analysis')">专题分析</el-button>
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
    background-color: #0c293bd1;
    border-color: #01ccf9b0;
    width: 120px;
    margin: 0;
    margin: 5px 10px;
  }
}
</style>
