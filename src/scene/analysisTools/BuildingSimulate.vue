<template>
  <section>
    <el-form :inline="true">
      <el-form-item label="建设模拟">
        <el-switch
          class="choose-btn"
          v-model="showBuilding"
          active-color="#13ce66"
          inactive-color="#57616b"
          @change="cShowBuilding"
          style="user-select:none"
        ></el-switch>
      </el-form-item>
      <el-form-item>
        <p>
          <span>建筑物高度：</span>
          <span class="badge">{{buildingHeight}}</span>
          <span>m</span>
        </p>
        <!-- <span>建筑物高度：
        <el-tag type="success" v-model="buildingHeight"></el-tag>
        m
        </span> -->
      </el-form-item>
      <!-- <el-form-item>  
        <el-progress :text-inside="true" :stroke-width="18" :percentage="simulatePer" status="success"></el-progress>
      </el-form-item> -->
      <el-form-item label="规划控高">
        <el-switch
          class="choose-btn"
          v-model="showHeightControl"
          active-color="#13ce66"
          inactive-color="#57616b"
          @change="cShowHeightControl"
          style="user-select:none"
        ></el-switch>
      </el-form-item>
      <el-form-item>  
        <p>
          <span>规划控高：</span>
          <span class="badge">{{controlHeight}}</span>
          <span>m</span>
        </p>
      </el-form-item>
      <!-- <el-form-item label="退线分析">
        <el-switch
          class="choose-btn"
          v-model="showBuilding"
          active-color="#13ce66"
          inactive-color="#57616b"
          @change="cShowBuilding"
          style="user-select:none"
        ></el-switch>
      </el-form-item> -->
    </el-form>
  </section>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import { Progress } from "element-ui";
export default {
  data() {
    return {
      simulatePer: 0,
      showBuilding: false,
      showHeightControl: false,
      buildingHeight: 0,
      controlHeight: 0
    };
  },
  computed: {
    ...mapState({
    })
  },
  watch: {
  
  },
  mounted() {
    this.initEvent();
  },
  destroyed() {
  },
  methods: {
    ...mapMutations(["cShowHideBuilding"]),
    initEvent() {
      EventBus.$on("showBuildigHeightValue", this.showBuildingHeightValue);
      EventBus.$on("showHeightControlValue", this.showHeightControlValue);
    },
    destroyed() {
			EventBus.$off("showBuildigHeightValue", this.showBuildingHeightValue);
      EventBus.$off("showHeightControlValue", this.showHeightControlValue);
		},
    cShowBuilding(flag) {
      this.cShowHideBuilding(flag);
      if(flag==true){
         EventBus.$emit("startBuildSimulate", flag);
         //this.simulatePer = 100;
        //  debugger;
        //  var intervalId = window.setInterval(function() {
        //  this.simulatePer = this.simulatePer + 40;
        //  if(this.simulatePer >=100){
        //     window.clearInterval(intervalId);
        //  }
        // },2000);
      }else{
        EventBus.$emit("cancelBuildSimulate", flag);
        //self.simulatePer = 0;
      }
    },
    cShowHeightControl(flag){
       this.controlHeight = 0;
       EventBus.$emit("showHeightControl", flag);
    },
    showBuildingHeightValue(val){
      this.buildingHeight = val;
    },
    showHeightControlValue(val){
      this.controlHeight = val;
    }
  }
};
</script>
<style type="text/css" scoped>
.el-form-item{
  min-width: 200px;
  margin-bottom:0px;
}
.badge {
  font-size: 18px !important;
  border-radius: 5px !important;
  padding: 5px;
  display: inline-block;
  padding: 2px 4px;
  font-weight: bold;
  line-height: 23px !important;
  color: #fff;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
  white-space: nowrap;
  vertical-align: baseline;
  background-color: #999;
}
.el-progress{
  min-width: 200px;
  margin-bottom:0px;
  height: 40px;
}
.el-progress {
  position: relative;
  line-height: none
}
</style>