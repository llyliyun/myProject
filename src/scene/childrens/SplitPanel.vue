<template>
  <el-dialog
    :title="title"
    :visible.sync="showSplitPanel"
    width="700px"
    class="toolbar-dialog scene-query-statics"
    append-to-body>
      <el-form  class="statics-split-form" label-width="172px">
        <div class="statics-split-item">
          <div @click="changeBorderColor('left')" class="checkPanel" id="leftPanel" :style="{border: leftBorderColor}">1</div>
          <div @click="changeBorderColor('right')" class="checkPanel" id="rightPanel" :style="{border: rightBorderColor}">2</div>
        </div> 
        <div class="statics-query-item footeritem">
          <el-form-item style="margin: 0 auto;padding: 48px 64px 0 64px;width: 100%;">
            <el-button type="primary" size="small" class="btn-view" @click="submit(true)">确定</el-button>
            <el-button @click="cancel" size="small" class="btn-none">取消</el-button>
          </el-form-item>
        </div>
      </el-form>
  </el-dialog>
</template>
<script>
export default {
  components: {},
  computed: {},
  mounted(){},
  beforeDestroy(){},
  data() {
    return {
      showSplitPanel: false,
      title: "请选择要叠加的序号~",
      leftBorderColor: "3px solid #409EFF",
      rightBorderColor: "",
      layerType: ""
    }
  },
  watch:{
    
  },
  mounted() {
    EventBus.$on('splitPanel', this.openSplitPanel);
  },
  methods: {
    changeBorderColor(param){
      if(param == "left"){
        this.leftBorderColor = "3px solid #409EFF";
        this.rightBorderColor = ""; 
      }else{
        this.leftBorderColor = "";
        this.rightBorderColor = "3px solid #409EFF";
      }
    },
    openSplitPanel(layerType){
      this.showSplitPanel = true;
      this.layerType = layerType;
    },
    submit(){
      this.showSplitPanel = false;
      var layers,imagelayer;
      if(this.layerType == "SMS3MLAYERS"){
        layers = Viewer.scene.layers._layers.values.length;
        imagelayer = Viewer.scene.layers._layers.values[layers - 1];
      }else{
        layers = Viewer.imageryLayers.length;
        imagelayer = Viewer.imageryLayers.get(layers-1);
      }
      if(this.leftBorderColor){
        imagelayer.setVisibleInViewport(1, false);
      }else{
        imagelayer.setVisibleInViewport(0, false);
      }
      this.leftBorderColor = "3px solid #409EFF";
      this.rightBorderColor = "";
      //激活图例
       EventBus.$emit('active-legend')
    },
    cancel(){
      this.showSplitPanel = false;
    }
  }
}
</script>

<style lang="scss">
.statics-split-form{

  max-height: 700px;
  overflow: auto;
  .el-form-item{
    margin-bottom: 15px;
  }
  .footeritem{
    float: left;
  }
  .statics-split-item{
    .checkPanel{
      height: 170px;
      /*background: rgba(1, 25, 50, 0.6) !important;*/
      background: #e4e7ed !important;
      width: 170px;
      text-align: center;
      line-height: 161px;
      font-size: 17px;
      cursor: pointer;
      border: 1px solid #ccc;
    }
    #leftPanel{
      float: left;
      margin-left: 15%;
    }
    #rightPanel{
      float: right;
      margin-right: 15%;
    }
  }
  .el-button{
    width: 85px;
    height: 40px;
  }
}
.el-dialog__title{
  padding-left: 38%;
}
</style>
