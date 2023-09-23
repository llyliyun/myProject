<template>
  <div class="mvt-query-popup" v-show="showPopup">
    <map-popup :objData="objData"></map-popup>
    <span class="query-popup-close" @click="closePopupHander">
      <i class="el-icon-close"></i>
    </span>
  </div>
</template>

<script>
  import MapPopup from '@/components/common/MapPopup'
  export default {
    data() {
      return {
        objData: {},
        showPopup: false,
        layerName: '',
      }
    },
    mounted() {
      EventBus.$once('ViewerChanged', this.initMvtQuery);
      EventBus.$on('show-popdata', this.showPopData);
      EventBus.$on('close-popdata', this.closePopData);
    },
    beforeDestroy() {
      EventBus.$off('show-popdata', this.showPopData);
      EventBus.$off('close-popdata', this.closePopData);
    },
    components: {
      MapPopup
    },
    methods: {
      initMvtQuery() {
        Viewer.selectedEntityChanged.addEventListener((entity) => {
          if (!Cesium.defined(entity) || !Cesium.defined(entity.pickResult)) {
            return;
          }
          this.layerName = Object.keys(entity.pickResult)[0];
          let pickResult = entity.pickResult[this.layerName];
          if (!pickResult || !pickResult[0]) {return}
          let pickFeature = pickResult[0].feature;
          if (!pickFeature || !pickFeature.properties) {
            this.showPopup = false;
            return;
          }
          this.objData = pickFeature.properties;
          this.showPopup = true;          
        })
      },
      showPopData(data){
        this.objData = data
        this.showPopup = true;
      },
      closePopData() {
        this.showPopup = false;
        /*errorTips:全局清除调用toolbar-clearAll运行到此处使用remove可以正常清除，但是控制台标红。
        *执行到ScencMap.vue的clearAll方法里的remove方法又不会报错（前面执行的报错）
        *原使用的removeAll方法都报错且造成界面卡死。
        *目前功能正常，但暂未发现控制台问题
        */
        // for(let i=0; i < Viewer.dataSources.length; i++) {
        //    Viewer.dataSources.remove(Viewer.dataSources.get(i))
        // }
      },
      closePopupHander() {
        EventBus.$emit('chooseBox-clearAll');
        // this.showPopup = false;
        this.closePopData();
      }
    }
  }
</script>

<style lang="scss">
  .mvt-query-popup {
    position: absolute;
    top: 67px;
    right: 100px;

    .query-popup-close {
      position: absolute;
      top: 5px;
      right: 5px;
      color: #fff;
      cursor: pointer;
      z-index: 800;
    }
  }
</style>
