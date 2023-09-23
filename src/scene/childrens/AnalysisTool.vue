<template>
  <div>
    <section class="analysisTools" id="analysisToolContent">
      <div id="threeDimensionalAnalysisTitle" class="tool-bar-top">
        <span>三维分析</span>
        <button class="el-dialog__headerbtn setting-btn" @click="analysisClose">
          <i class="el-dialog__close el-icon el-icon-circle-close"></i>
        </button>
      </div>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!--<el-tab-pane  name="房屋建设模拟" v-if="!cShowPlaneAna">
        <span slot="label" title="房屋建设模拟">建设模拟</span>
        <building-simulate></building-simulate>
      </el-tab-pane>-->
        <el-tab-pane name="可视域分析" v-if="cShowPlaneAna || plane">
          <span slot="label" title="可视域分析">可视域分析</span>
          <viewshed3d></viewshed3d>
        </el-tab-pane>
        <el-tab-pane name="阴影分析" v-if="!cShowPlaneAna">
          <span slot="label" title="阴影分析">阴影分析</span>
          <shadows></shadows>
        </el-tab-pane>
        <el-tab-pane name="通视分析" v-if="cShowPlaneAna || plane">
          <span slot="label" title="通视分析">通视分析</span>
          <sight-line></sight-line>
        </el-tab-pane>
        <el-tab-pane name="天际线分析" v-if="cShowPlaneAna || plane">
          <span slot="label" title="天际线分析">天际线分析</span>
          <sky-line></sky-line>
        </el-tab-pane>
        <!-- <el-tab-pane name="三维特效">
        <span slot="label" title="三维特效"><i class="el-icon-date"></i></span>
        <particle-analysis></particle-analysis>
      </el-tab-pane> -->
        <el-tab-pane name="控高分析" v-if="!cShowPlaneAna">
          <span slot="label" title="控高分析">控高分析</span>
          <height-control></height-control>
        </el-tab-pane>
        <!--<el-tab-pane name="土方量分析" v-if="!cShowPlaneAna">
          <span slot="label" title="土方量分析">土方量分析</span>
          <excavation></excavation>
        </el-tab-pane> -->
        <!--<el-tab-pane name="挖方分析" v-if="!cShowPlaneAna">
          <span slot="label" title="挖方分析">挖方分析</span>
          <excavation-analysis></excavation-analysis>
        </el-tab-pane> -->
        <!--<el-tab-pane name="房屋揭盖" v-if="!cShowPlaneAna">
        <span slot="label" title="房屋揭盖">房屋揭盖</span>
        <house-cut></house-cut>
      </el-tab-pane>
      <el-tab-pane name="淹没分析" v-if="!cShowPlaneAna">
        <span slot="label" title="淹没分析">淹没分析</span>
        <flood-analysis></flood-analysis>
      </el-tab-pane>-->
      </el-tabs>
    </section>
  </div>
</template>

<script>
import viewshed3d from "./../analysisTools/viewshed3D.vue";
import shadows from "./../analysisTools/Shadows.vue";
import skyLine from "./../analysisTools/SkyLine.vue";
import SightLine from "./../analysisTools/SightLine";
import HeightControl from "./../analysisTools/HeightControl.vue";
import Excavation from "./../analysisTools/Excavation";
import HouseCut from "./../analysisTools/HouseCut";
import FloodAnalysis from "./../analysisTools/FloodAnalysis";
import BuildingSimulate from "./../analysisTools/BuildingSimulate";
import ExcavationAnalysis from "./../analysisTools/ExcavationAnalysis";
import { dragFunc } from "@/components/common/utils";
import { mapState, mapMutations, mapActions } from "vuex";
export default {
  components: {
    viewshed3d,
    shadows,
    skyLine,
    SightLine,
    HeightControl,
    Excavation,
    HouseCut,
    FloodAnalysis,
    BuildingSimulate,
    ExcavationAnalysis
  },
  mounted() {
    dragFunc("analysisToolContent", "threeDimensionalAnalysisTitle");
  },
  destroyed() {},
  data() {
    return {
      activeName: "可视域分析",
      plane: true
    };
  },
  methods: {
    init() {},
    handleClick(tab, event) {
      EventBus.$emit("clearAll", true);
      if (tab.name === "阴影分析") {
        EventBus.$emit("shadows", tab.name);
      }
      if (tab.name === "天际线分析") {
        EventBus.$emit("skyLine", tab.name);
      }
      if (tab.name === "通视分析") {
        EventBus.$emit("sightLine", tab.name);
      }
      if (tab.name === "土方量分析") {
        EventBus.$emit("excavation", tab.name);
      }
    },
    analysisClose() {
      EventBus.$emit("clearAll", true);
      this.$emit("analysis-close");
    }
  },
  computed: {
    ...mapState({
      cShowPlaneAna: state => state.scene.cShowPlaneAna
    })
  },
  watch: {
    cShowPlaneAna: function(val) {
      if (val) {
        this.activeName = "可视域分析";
      }
    }
  }
};
</script>

<style lang="scss">
$bgColor-none: rgba(255, 255, 255, 0);
$border-color: #909399;
$border: 1px solid $border-color;
$font-size: 14px;
$font-color: #ffffff;
.analysisTools {
  position: absolute;
  right: 10px;
  top: 70px;
  z-index: 0;
  cursor: auto;
  width: 588px;
  border-radius: 5px;
  border: none;
  font-size: 10pt;
  padding: 1em;
  background-color: #f5f7fa;
  box-shadow: 0 0 8px #ddd;

  .tool-bar-top {
    line-height: 50px;
    position: relative;
    font-weight: bold;

    .setting-btn {
      top: 15px;
      right: 0;
      z-index: 999999;

      i {
        font-size: 20px;
        color: rgb(175, 179, 187);

        &:hover {
          color: #fff;
        }
      }
    }
  }

  .el-slider {
    .el-slider__runway {
      height: 3px;
    }

    .el-slider__bar {
      height: 3px;
    }

    .el-slider__button-wrapper {
      height: 32px;
      width: 32px;
    }

    .el-slider__button {
      width: 10px;
      height: 10px;
    }
  }

  .row-title {
    height: 65px;

    .row-title-text {
      width: 100%;
      font-weight: bold;
      display: inline-block;
      line-height: 40px;
      border-bottom: 1px dashed $border-color;
    }
  }

  .row-block {
    line-height: 32px;
    margin-bottom: 16px;

    .block-content {
      padding-right: 16px;
    }

    .block-content-txt {
      text-align: right;
      padding-right: 10px;
      // .label-bg {
      //   display: inline-block;
      //   width: 15px;
      //   height: 15px;
      //   vertical-align: text-bottom;
      // }
      // .label-bg-red {
      //   background-color: red;
      // }
      // .label-bg-green {
      //   background-color: #86c73b;
      // }
    }

    .block-content-slider {
      padding-left: 5px;
      padding-right: 5px;
      //border: $border;
      border-radius: 2px;
    }

    .block-content-input {
      padding-left: 5px;
      border: $border;
      border-radius: 2px;
      .el-input {
        .el-input__inner {
          background-color: $bgColor-none;
          border: none;
        }
        .el-input__suffix {
          right: 0;
        }
      }
      .el-color-picker__trigger {
        border: none;
      }
    }
  }
}

.elTabs {
  margin-top: 10px;
}
</style>
<style type="text/css">
.analysisTools .el-tabs__nav-scroll .el-tabs__item {
  padding: 0 18px;
}
.analysisTools .el-tabs__nav-scroll .el-tabs__item i {
  font-size: 16px;
}

.analysisTools #content1 {
  margin-left: 10px;
}
</style>
