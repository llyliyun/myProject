<template>
  <div class="cesium-location-tip">
    <span class="tip-item">经度： {{ lon }}</span>
    <span class="tip-item">纬度： {{ lat }}</span>
    <span class="tip-item">视角高度： {{ viewHeight }}</span>
    <div class="setting" @click="coordLocal"><i class="el-icon-location" title="定位"></i><div class="set-title"></div></div>
  </div>
</template>

<script>

  export default {
    data() {
      return {
        lon: 0,
        lat: 0,
        height: 0,
        viewHeight: 0,
        longitude: "",
        latitude: "",
        showDOM:true
      }
    },
    mounted() {
      EventBus.$on('ViewerChanged', this.initLocationTip)
    },
    watch:{
      viewHeight(val,newVal){
        if(this.viewHeight>APPCONFIG.viewHeight){
          if(this.showDOM){
            EventBus.$emit("showDOM",true);
            this.showDOM = false;
          }
        }else{
          if(!this.showDOM){
            EventBus.$emit("showDOM",false);
            this.showDOM = true;
          }
        }
      }
    },
    methods: {
      initLocationTip() {
        let camera = Viewer.scene.camera;
        Viewer.scene.postRender.addEventListener(() =>{
          let position = camera.positionCartographic;
          let _lon = Cesium.Math.toDegrees(position.longitude);
          let _lat = Cesium.Math.toDegrees(position.latitude);
          this.lon = _lon.toFixed(4);
          this.lat = _lat.toFixed(4);
          this.viewHeight = position.height.toFixed(0);
        })
      },
      coordLocal() {
        EventBus.$emit('localtionTip', this.lon, this.lat, this.viewHeight);
      }
    }
  }
</script>

<style lang="scss">
  .cesium-location-tip {
    position: absolute;
    right: 12px;
    bottom: 3px;
    height: 25px;
    font-size: 14px;
    font-weight: 400;
    color: #fff;
    line-height: 28px;
    //background: rgba(13, 12, 12, 0.7);
    border-radius: 3px;
    padding-left: 8px;
    .tip-item {
      float: left;
      height: 100%;
      margin-right: 10px;
    }
    .latitude {
      width: 68px;
    }
    .setting {
      cursor: pointer;
      text-align: center;
      color: #1569b2;
      float: left;
      i {
        font-size: 20px;
        float: left;
        line-height: 24px;
      }
      .set-title {
        line-height: 23px;
      }
    }
  }
</style>
