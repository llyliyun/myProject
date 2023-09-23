<template>
  <article class="tools">
    <el-menu class="scene-tool" mode="horizontal">
      <el-menu-item index="1" @click="roundCircle()">
        <i class="fa fa-hand-paper-o"></i>
        <template v-if="!isRoundCircle">
          <span slot="title" class="title">漫游</span>
        </template>
        <template v-else>
          <span slot="title" class="title">关闭漫游</span>
        </template>
      </el-menu-item>
      <el-menu-item index="2" @click="analysisFlagd">
        <i class="fa fa-area-chart"></i>
        <span>三维分析</span>
      </el-menu-item>
      <el-menu-item index="3"
        @mouseover.native="isShowToolbarChildren = true"
        @mouseout.native="isShowToolbarChildren = false">
        <i class="icon-toolbox"></i>
        <span class="title toolbox-title">工具</span>
        <i class="el-icon-arrow-down"></i>
      </el-menu-item>
     <!--  <el-menu-item index="9"
        @mouseover.native="showWeather = true"
        @mouseout.native="showWeather = false">
        <i class="fa fa-snowflake-o"></i>
        <span class="title toolbox-title">天气</span>
      </el-menu-item> -->
      <el-collapse-transition>
        <ul class="toolbox-childrens" v-show="isShowToolbarChildren"
            :class="isShowToolBox"
            @mouseenter="isShowToolbarChildren = true"
            @mouseleave="isShowToolbarChildren = false"
            @click="isShowToolbarChildren = false"
        >
          <!--<li class="childrens-item" @click="polylineSearch"><i class="fa fa-square-o"></i> 查询</li>-->
          <li class="childrens-item" @click="measure('polyline',false)"><i class="icon-measure"></i>量面</li>
          <li class="childrens-item" @click="measure('height', false)"><i class="icon-area"></i>量高</li>
          <!--<li class="childrens-item" @click="measure('polyline', true)"><i class="entity-stick-measure"></i>贴地量面</li>-->
          <!-- <li class="childrens-item" @click="measure('height', true)"><i class="entity-stick-area"></i>贴地量高</li> -->
          <li class="childrens-item" @click="showMapPrint = true"><i class="fa fa-print"></i>场景打印</li>
          <!-- <li class="childrens-item" @click="showFlyT"><i class="entity-fight"></i>沿线飞行</li> -->
          <!-- <li class="childrens-item" @click="uploadData()"><i class="fa fa-cloud-upload"></i>上传数据集</li> -->
        </ul>
      </el-collapse-transition>
      <!-- <el-collapse-transition>
        <ul class="weather-box-ul" v-show="showWeather"
            @mouseenter="showWeather = true"
            @mouseleave="showWeather = false"
            @click="showWeather = false">
          <li @click="preSetSunday">晴天</li>
          <li @click="preSetParticle('rain',500)">小雨</li>
          <li @click="preSetParticle('rain',2000)">中雨</li>
          <li @click="preSetParticle('rain',5000)">大雨</li>
          <li @click="preSetParticle('snow',100)">小雪</li>
          <li @click="preSetParticle('snow',400)">中雪</li>
          <li @click="preSetParticle('snow',1000)">大雪</li>
        </ul>
      </el-collapse-transition> -->
      <el-menu-item index="4" @click="showSceneLegend">
        <i class="fa fa-road"></i>
        <span>图例</span>
      </el-menu-item>
      <el-menu-item index="5"
                    @click="clearAll()"
                    @mouseover.native="showClearChild = true"
                    @mouseout.native="showClearChild = false"
      >
        <i class="fa fa-trash"></i>
        <span>清除</span>
        <i class="el-icon-arrow-down" v-if="showClearChildren"></i>
      </el-menu-item>
      <el-collapse-transition v-if="showClearChildren">
        <ul class="toolbox-childrens clear-childrens"
            :class="isShowClearChildrens"
            v-show="showClearChild"
            @mouseenter="showClearChild = true"
            @mouseleave="showClearChild = false"
            @click="showClearChild = false"
        >
          <li class="childrens-item"
              @click="clearAll(2)">
            清除绘制</li>
          <li class="childrens-item" @click="clearAll(1)">
            清除图层</li>
        </ul>
      </el-collapse-transition>
      <el-menu-item index="6" @click="saveView">
        <i class="fa fa-save" title="保存视图"></i>
      </el-menu-item>
      <el-menu-item index="7" @click="preView">
        <i class="fa fa-mail-reply" title="前视图"></i>
      </el-menu-item>
      <el-menu-item index="8" @click="nextView">
        <i class="fa fa-mail-forward" title="后视图"></i>
      </el-menu-item>
    </el-menu>
    <el-collapse-transition>
      <analysis-tool v-if="cShowAnalysisTool" @analysis-close="analysisClose"></analysis-tool>
    </el-collapse-transition>
    <el-collapse-transition>
      <fly-tool v-if="showFlyTool" @flyClose="flyClose"></fly-tool>
    </el-collapse-transition>
    <el-dialog
      title="地图打印"
      :visible.sync="showMapPrint"
      class="print-dialog"
      :close-on-click-modal="false"
      append-to-body>
      <map-print v-if="showMapPrint" :showMapPrint="showMapPrint" @close-dialog="showMapPrint=false"></map-print>
    </el-dialog>
  </article>
</template>

<script>
  import analysisTool from './AnalysisTool';
  import flyTool from "./FlyTool"
  import QueryMixin from  './../mixin/QueryMixin'
  import ViewExchangeMixin from  './../mixin/ViewExchangeMixin'
  import {mapState, mapMutations} from 'vuex'
  import MapPrint from "@/components/map/childrens/MapPrint"
  import ParticleSystem from "@/components/scene/analysisTools/ParticleSystem"
  export default {
    mixins:[QueryMixin,ViewExchangeMixin,ParticleSystem],
    components: {
      analysisTool,flyTool,MapPrint
    },
    data() {
      return {
        analysisFlag: false,
        showFlyTool:false,
        isShowToolbarChildren:false,
        isRoundCircle:false,
        showMapPrint: false,
        showWeather: false,
        showClearChildren:true,
        showClearChild:false,
        toolboxChild:'toolbox-child',
        showToolboxChild:'add-toolbox-child',
        showBoxChild:'add-clear-childrens',
        clearChildren:'clear-childrens',
      }
    },
    mounted() {},
    destroyed() {},
    computed: {
      ...mapState({
        cShowLegend: state => state.scene.cShowLegend,
        cShowAnalysisTool: state => state.scene.cShowAnalysisTool,
      }),
      isShowToolBox:function () {
        if(this.isRoundCircle){
          return this.showToolboxChild
        }else{
          return this.toolboxChild
        }
      },
      isShowClearChildrens:function () {
        if(this.isRoundCircle){
          return this.showBoxChild
        }else{
          return this.clearChildren
        }
      }
    },
    methods: {
      ...mapMutations([
        'cShowHideLegend',
        'toggleAnalysisTool',
        'cChangeSpecialLayer',
        'toggleFlag'
      ]),
      analysisFlagd(){
        this.toggleAnalysisTool(!this.cShowAnalysisTool);
      },
      analysisClose() {
        this.toggleAnalysisTool(false);
      },
      measure(command,isCloseToGround) {
        if(!isCloseToGround){
          EventBus.$emit('toolbar-measured',command,isCloseToGround);
        }else{
          EventBus.$emit('toolbar-measured',command,isCloseToGround);
        }
      },
      showFlyT(){
        this.showFlyTool = !this.showFlyTool;
        if(!this.showFlyTool){
          this.$refs.fly.hideFly();
        }
      },
      flyClose(){
        this.showFlyTool =false;
      },
      /**
       *
       * @param clearGrade  清除级别
       * null清除所有
       * 1清除掉专题图层
       * 2清除除了专题图层外其它的
       */
      clearAll(clearGrade) {
        console.log(clearGrade);
        this.closeAll();
        Viewer.dataSources.removeAll();
        this.toggleAnalysisTool(false);
        if (!clearGrade || clearGrade == 1) {
          this.cChangeSpecialLayer({specialLayers:[], noClearFlag: true});
          EventBus.$emit("pritree-removeAll");
          if (this.cShowLegend) {
            this.cShowHideLegend(false);
          }
        }
        if (!clearGrade || clearGrade == 2) {
          EventBus.$emit("toolbar-clearAll");
          EventBus.$emit("clearAll");
        }
        EventBus.$emit("show-query-list", []);
      },
      closeAll(){
        this.toggleAnalysisTool(false);
        this.showFlyTool = false;
      },
      showSceneLegend() {
        this.cShowHideLegend(!this.cShowLegend)
      },
      printScene(){
        EventBus.$emit('printScene')
      },
      roundCircle(){
        this.isRoundCircle = !this.isRoundCircle
        EventBus.$emit('tool-round-circle',this.isRoundCircle)
      },
      uploadData() {
        this.toggleFlag({name:'showUploadMenu',flag:true});
      },
    }
  };
</script>
<style lang="scss">
  .el-dropdown-menu{
      .el-switch{
          padding: 20% !important;
              width: 100%;
        }
      .el-switch:active{
        border:none
      }
    }
  .el-switch__core {
    margin: 0 auto !important;
    outline: none !important;
  }
</style>
<style lang="scss" scoped>
  .el-dropdown-menu__item{
    padding: 0 30px !important;
  }
  .scene-tool {
    position: absolute;
    right: 10px;
    height: 33px;
    line-height: 33px;
    top: 14px;
    -webkit-box-shadow: 1px 1px 14px 0 #aaa;
    box-shadow: 1px 1px 14px 0 #aaa;
    background: #fff;
    border: none;
    border-radius: 5px;
    i {
      font-size: 20px;
      width: 13px;
      margin-right: 5px;
    }
    i.el-submenu__icon-arrow {
      display: none;
    }
    .el-menu-item {
      border-bottom: none !important;
      height: 33px ;
      line-height: 33px;
      padding: 0 7px;
      border-radius: 5px;
    }
    .weather-box-ul{
      position: absolute;
      top: 33px;
      left: 257px;
      cursor: pointer;
      background: #fff;
      font-size: 14px;
      color: #909399;
      outline: none;
      li{
        padding: 0px 13px;
        &:hover{
          background-color: #ecf5ff;
          color: #1569b2;
        }
      }
    }
    .toolbox-child {
      position: absolute;
      left: 155px!important;
    }
    .add-toolbox-child {
      position: absolute;
      left: 183px!important;
    }
    .clear-childrens{
      position: absolute;
      left: 320px!important;
    }
    .add-clear-childrens{
      position: absolute;
      left: 348px!important;
    }
    .toolbox-childrens {
      position: absolute;
      top: 33px;
      text-align: left;
      background: #fff;
      padding: 3px 2px;
      border: 1px solid #ebeef5;
      z-index:1999;
      box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
      outline: none;
      .childrens-item {
        font-size: 14px;
        line-height: 30px;
        color: #7c8196;
        padding: 0 10px;
        cursor: pointer;
        i {
          font-size: 18px;
          margin-right: 5px;
        }
        &:hover {
          background-color: #ecf5ff;
          color: #1569b2;
        }
      }
    }
  }
  .fa-print{
    margin-right: 10px !important;
  }
</style>
<style type="text/css">
  .tools > .scene-tool > .el-menu--horizontal > .el-menu-item {
    height: 41px !important;
    line-height: 41px !important;
  }
  .queryInput .el-input-group__prepend {
    width: 115px !important;
  }
  .queryInput .el-input .el-input__inner {
    height:42px !important;
  }
  .queryInput .el-select .el-input.is-focus .el-input__inner {
    border-color: none !important;
  }
</style>
