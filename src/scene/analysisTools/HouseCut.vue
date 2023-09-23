<template>
  <section>
    <el-form :inline="true">
      <el-form-item label="房屋揭盖">
        <el-switch class="choose-btn"
          v-model="showCutBuild"
          active-color="#13ce66"
          inactive-color="#57616b"
          @change="cShowHideCutBuild"
          style="user-select:none">
        </el-switch>
      </el-form-item>
      <el-form-item>
        <el-button plain type="info" size="small" @click="clearHouseCut">清除</el-button>
      </el-form-item>
    </el-form>
  </section>
</template>
<script>
  let sightline,
      sgPointHandler,
      viewPointFlag = false; //是否已经添加了
  import {
    mapState,
    mapMutations
  } from 'vuex'

  export default {
    data() {
      return {
        showCutBuild:false,
        configs:APPCONFIG.cutFloorConfig
      }
    },
    computed: {
      ...mapState({
        cShowCutBuild: state => state.scene.cShowCutBuild
      })
    },
    watch:{
      cShowCutBuild(){
        this.showCutBuild = this.cShowCutBuild;
      }
    },
    mounted() {
      EventBus.$on('clearAll',this.clearHouseCut);
    },
    destroyed() {
      EventBus.$off('clearAll',this.clearHouseCut);
    },
    methods: {
      ...mapMutations([
        'cShowHideCutBuild'
      ]),
      showHideCutBuild(flag){
        this.cShowHideCutBuild(flag);
      },
      clearHouseCut() {
        let layers = Viewer.scene.layers._layerQueue;
        let mylay = layers.find((item)=>{
          return item.name.indexOf(this.configs.dataSetName) > -1
        })
        mylay && mylay.setObjsVisible([],false)
      }
    }
  }
</script>
<style type="text/css">
</style>
