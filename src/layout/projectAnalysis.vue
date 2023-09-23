<template>
  <div class="projectAnalysis">
    <div class="Analysis-info">
      <div class="title">专题分析
        <i class="el-icon-close" @click="showAnalysis"></i>
      </div>
      <div class="cont">
        <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane v-for="(item,index) in analysisConfig" :label="item.title" :name="item.name" :key="index">
                <div>
                    <div class="analyze">分析图层</div>
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
                        <el-button @click="beginAnalysis(index)">分析</el-button>
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
import ConflictMixin from "./mixin/ConflictMixin";
import EventBus from "../js/event";
const operateRegions = [{
    "type": "FeatureCollection",
    "features": [{
    "type": "Feature",
    "geometry": {
        "type": "Polygon",
        "coordinates": [[[116.7176485079,36.5601657959],
            [116.7234849947,36.5457748513],
            [116.7109251031,36.5454029175],
            [116.7176485079,36.5601657959]]]
    }
  }]
}];
export default {
    mixins: [ConflictMixin],
  components: { },
  data() {
    return {
      activeName:"kzxjc",
      analysisConfig: APPCONFIG.SpecialToolConfig,
      resutlArr:[]
    };
  },
  mounted(){
    // for(let i=0;i<this.analysisConfig.length;i++){
    //   this.analysisConfig[i].checkLayers = [];
    // }
    this.$bus.$on("query-finish-geo", this.queryFinish);
  },
  beforeDestroy(){
    this.$bus.$off("query-finish-geo", this.queryFinish)
  },
  methods: {
      handleClick(){

      },
      beginAnalysis(index) {
        this.resutlArr = [];
        for(let i=0;i<2;i++){
          this.analysis(this.analysisConfig[index].checkLayers,L.geoJSON(operateRegions));          
        }
      },
      async queryFinish(recode){
        const that = this;
        if(recode && recode.length){
          const result = await this.geometryAnalysisThreeLine(recode,L.geoJSON(operateRegions));
          this.resutlArr.push(result);
          if(this.resutlArr.length == 2){
            for(let i=0;i<this.resutlArr.length;i++){
              that.resutlArr[0].map((item,index)=>{
                that.resutlArr[i][index].features.features.map(item=>{
                  item.properties.地块名称 = '地块-' + (i+1)
                });
                if(i !== 0){
                  that.resutlArr[0][index].features.features = that.resutlArr[0][index].features.features.concat(that.resutlArr[i][index].features.features);
                  that.resutlArr[0][index].fieldCaptions = that.resutlArr[0][index].fieldCaptions ? that.resutlArr[0][index].fieldCaptions:that.resutlArr[i][index].fieldCaptions;
                  that.resutlArr[0][index].fieldTypes = that.resutlArr[0][index].fieldTypes ? that.resutlArr[0][index].fieldTypes:that.resutlArr[i][index].fieldTypes;
                  that.resutlArr[0][index].fields = that.resutlArr[0][index].fields ? that.resutlArr[0][index].fields:that.resutlArr[i][index].fields;                
                }

              })
            }
            this.$bus.$emit("query-geo", result)
          }
        }
      },
      showAnalysis(){
        EventBus.$emit("show-analysis", false);
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
      text-align: center;
      line-height: 40px;
      padding-bottom: 3px;
      margin-top: -7px;
      margin-left: -8px;
      margin-right: -8px;
      background: rgba(251,253,255,.1);
      .el-icon-close{
        position: relative;
        right: -106px;
        top: -4px;
        cursor: pointer;
      }
    }
    .cont{
      padding:15px 15px 0 15px;
        .el-tabs__nav-next, .el-tabs__nav-prev {
            color: #0dccf1;
        }
        .el-tabs__item {
            color:#0dccf1;
        }
        .el-tabs .el-tabs__nav-wrap:after {
          height: 1px;
          background-color: #084e5f;
        }
        .el-tabs .el-tabs__item.is-active {
          color: #fff;
        }
        // .el-tabs__nav.is-top {
        //   transform: translateX(16px) !important;
        // }
        .analyze{
          color: #0dccf1;
          line-height: 46px;
        }
        .el-checkbox__label {
          color: #fff;
          line-height: 30px;
        }
        .el-checkbox-group {
          margin-bottom: 26px;
        }
        .el-button{
          background-color: #0babd1;
          border-color: #0babd1;
          color: #fff;
          margin-left: 100px;
          margin-bottom: 10px;
        }
        .el-button:hover{
          background-color: #0babd1;
          border-color: #0babd1;
          color: #fff;
        }
    }
  }
}
</style>