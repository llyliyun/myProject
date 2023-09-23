<template>
<section class="scene-wrapper">
  <el-aside width="350px" class="map-sidebar layout-left"  v-bind:class="[{ 'layout-left-hide': !isShowMenu }]">
    <upload-dataset v-show="showUploadMenu"></upload-dataset>
    <map-left-panel v-show="!showUploadMenu"></map-left-panel>
  </el-aside>
  <el-main class="main layout-right" v-bind:class="[{ 'layout-right-hide': !isShowMenu }]">
    <section class="scene-map-wrapper">
      <scene-map>
        <base-map-control></base-map-control>
        <scene-tool></scene-tool>
        <map-legend></map-legend>
        <cesium-popup></cesium-popup>
        <scene-attribute-query></scene-attribute-query>
        <floor-show></floor-show>
        <map-query></map-query>
        <tab-list></tab-list>
      </scene-map>
    </section>
  </el-main>
</section>
</template>

<script>
  import MapLegend from '@/components/scene/childrens/MapLegend'
  import SceneMap from '@/components/scene/SceneMap'
  import SceneTool from '@/components/scene/childrens/SceneTool'
  import CesiumPopup from '@/components/common/CesiumPopup'
  import SceneAttributeQuery from '@/components/scene/childrens/SceneAttributeQuery'
  import FloorShow from '@/components/scene/childrens/FloorShow'
  import BaseMapControl from '@/components/map/BaseMapControl'
  import MapQuery from '@/components/map/MapQuery'
  import MapLeftPanel from '@/components/map/childrens/MapLeftPanel'
  import TabList from './childrens/TabList'
  import TwoThreeLinkage from './childrens/TwoThreeLinkage'
  import UploadDataset from './../map/upload/UploadDataset'

  import {
    mapState,
    mapActions
  } from 'vuex'

  export default {
    components: {
      MapLegend,
      SceneMap,
      SceneTool,
      CesiumPopup,
      BaseMapControl,
      SceneAttributeQuery,
      FloorShow,
      MapQuery,
      MapLeftPanel,
      TabList,
      TwoThreeLinkage,
      UploadDataset
    },
    computed: {
      ...mapState({
        isShowMenu: state => state.map.isShowMenu,
        showUploadMenu: state => state.map.showUploadMenu
      })
    },
    watch:{
      '$route.query.type':{
        handler(val){
          this.changeType(val)
        },deep:true
      }
    },
    data(){
      return {
        treeType: APPCONFIG.TreeType,
      }
    },
    mounted(){
      this.changeType(this.$route.query.type)
    },
    methods:{
      changeFlag(showBaseMap, showUploadMenu, showMarkerEdit){
        this.showBaseMap = showBaseMap;
        this.showUploadMenu = showUploadMenu;
        this.showMarkerEdit = showMarkerEdit;
        if(!showMarkerEdit){
          this.beginMarkerEdit = false
        }
      },
      changeType(type){
        if(!type){
          this.changeFlag(true, false, false);
        } else if(type == 'upload'){
          this.changeFlag(false, true, false);
        } else if(type == 'mark'){
          this.changeFlag(false, false, true);
        }
      },
    }
  }

</script>

<style lang="scss">
.scene-map-wrapper{
  width:100%;
  height:100%;
}
</style>
