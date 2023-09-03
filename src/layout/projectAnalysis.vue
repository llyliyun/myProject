<template>
  <div class="projectAnalysis">
    <div class="Analysis-info">
      <div class="title">专题分析</div>
      <div class="cont">
        <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane v-for="(item,index) in analysisConfig" :label="item.title" :name="item.name" :key="index">
                <div>
                    <div>分析图层</div>
                    <el-checkbox-group v-model="item.checkLayers">
                      <el-checkbox
                        v-for="(layer, yzindex) in item.restLayer"
                        :key="yzindex"
                        :label="layer"
                        @change="checkLayer(layer)"
                        style="width: 100%;"
                        :disabled="layer.url ? false : true"
                      >{{layer.name}}</el-checkbox>
                    </el-checkbox-group>
                    <div>
                        <el-button>分析</el-button>
                    </div>
                </div>
            </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script>
// 导入组件
// import ConflictMixin from "./mixin/ConflictMixin";
export default {
    mixins: [],
  components: { },
  data() {
    return {
      activeName:"kzxjc",
      analysisConfig: APPCONFIG.SpecialToolConfig
    };
  },
  mounted(){
      this.analysisConfig.map(item=>{
          item.checkLayers = [];
          return item
      })
  },
  methods: {
      handleClick(){

      },
      checkLayer(){

      }
  },
};
</script>

<style lang="scss">
.projectAnalysis{
  .Analysis-info{
    width: 300px;
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
      padding:15px 15px 0 15px;
        .el-tabs__nav-next, .el-tabs__nav-prev {
            color: #f9f9f9;
        }
        .el-tabs__item {
            color:#f9f9f9;
        }
    }
  }
}
</style>