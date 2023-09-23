<template>
  <div class="two-three-linkage">
    <div class="SgsScenceMap" v-if="mapMode === '3d'">
      <el-card class="box-card" v-if="isMax">
        <div slot="header" class="clearfix box-card-head">
          <span>二三维联动</span>
          <i class="fa fa-minus" v-show="isMax" @click="showOrHide2dMap"  aria-hidden="true"></i>
        </div>
        <div class="sgsContainer">

        </div>
      </el-card>
    </div>
    <div class="SgsScenceMapClose" v-if="mapMode === '3d'">
      <el-card class="box-card" :body-style="{ padding: '0px' }" v-if="!isMax">
        <div slot="header" class="clearfix box-card-head">
          <span>二三维联动</span>
          <i class="fa fa-window-restore" v-show="!isMax" @click="showOrHide2dMap" aria-hidden="true"></i>
        </div>
      </el-card>
    </div>
  </div>
</template>
<script>
  import { mapState, mapMutations } from "vuex";
  import { calculateSizeFromAltitude } from '@/components/common/sceneUtil'
  import { transformByParams } from '@/components/common/dfcUtil'
  import { ServiceConfig, DFC } from "@/config/app-config";
  let transformUrllonlatToPlane = ServiceConfig.httpproxy + "?url=" + DFC.transformForward,
    TransformConfig = APPCONFIG.TransformConfig;
  export default {
    computed: {
      ...mapState({
        mapMode: state => state.map.mapMode,
        lastMapPosition: state => state.map.lastMapPosition,
      })
    },
    props:{
      sgs3dMapStyle:{
        type: Object,
        default () {
          return {}
        }
      }
    },
    data() {
      return {
        isMax: true,
      };
    },
    mounted() {
      if (APPCONFIG.MapSceneLink) {
        EventBus.$on("mapToScene", this.mapToScene);
        EventBus.$on("ViewerChanged", this.initSceneMouseEvent);
      }
    },
    beforeDestroy() {
      if (APPCONFIG.MapSceneLink) {
        EventBus.$off("mapToScene", this.mapToScene);
        EventBus.$off("ViewerChanged", this.initSceneMouseEvent);
      }
    },
    methods: {
      showOrHide2dMap(){
        if (this.isMax) {
          this.isMax = false;
          this.$emit('update:sgs3dMapStyle', {'z-index':-100000000})
        } else {
          this.isMax = true;
          this.$emit('update:sgs3dMapStyle', {'z-index':100000000})
        }
      },
      initSceneMouseEvent() {
        try{
          Viewer.scene.camera.moveEnd.removeEventListener(this.sceneToMapEvent);
        }catch(e){
        }
        Viewer.scene.camera.moveEnd.addEventListener(this.sceneToMapEvent);
        this.LEFT_CLICK_HANDLE = new Cesium.ScreenSpaceEventHandler(
          Viewer.canvas
        );
      },
      mapToScene({ lng, lat, altitude }) {
        let that = this;
        Viewer.scene.camera.moveEnd.removeEventListener(this.sceneToMapEvent);
        if (lng && lat && altitude) {
          Viewer.scene.camera.flyTo({
            destination: new Cesium.Cartesian3.fromDegrees(lng, lat, altitude),
            complete() {
              setTimeout(() => {
                Viewer.scene.camera.moveEnd.addEventListener(
                  that.sceneToMapEvent
                );
              }, 200);
            }
          });
        }
      },
      sceneToMapEvent() {
        let camera = Viewer.scene.camera;
        let cameraPosiion = camera.position;
        let cartographic = Cesium.Cartographic.fromCartesian(cameraPosiion);
        let longitude = Cesium.Math.toDegrees(cartographic.longitude);
        let latitude = Cesium.Math.toDegrees(cartographic.latitude);
        let height = cartographic.height;
        let size = calculateSizeFromAltitude(height);
        size = size * 0.5;
        // EventBus.$emit("sceneToMap", [
        //   [latitude - size, longitude - size],
        //   [latitude + size, longitude + size]
        // ]);
        this.move2dMap(latitude, longitude, height);
      },
      async move2dMap(y, x, h) {
        h = Number.parseInt(h);
        let hobj = {
          "2": "22",
          "5": "21",
          "10": "20",
          "20": "19",
          "50": "18",
          "100": "17",
          "200": "16",
          "500": "15",
          "1000": "14",
          "2000": "13",
          "5000": "12",
          "10000": "11",
          "20000": "10",
          "25000": "9",
          "50000": "8",
          "100000": "7",
          "200000": "6",
          "500000": "5",
          "1000000": "4",
          "2000000": "3"
        };
        let level = 15;
        let isFind = true;
        for (const key in hobj) {
          const element = hobj[key];
          let hei = Number(key);
          if (isFind) {
            if (h < hei) {
              level = Number(element);
              isFind = false;
            }
          }
        }
        let point;
        if (this.lastMapPosition.center.lng > 180) {
          let circlePoint = {
            lng: x,
            lat: y
          };
          let temp = await transformByParams(
            transformUrllonlatToPlane,
            TransformConfig.TransformParams.lonlatToPlane,
            [circlePoint]
          );
          point = temp.data.resultInfo.data.points[0];
        } else {
          point = {
            x: x,
            y: y
          };
        }
        let heading = window.Viewer.camera.heading; //三维方位角
        let img = "";
        if (3.375 > heading && heading > 3.125) {
          img = "marker3d4.png";
        } else if (3.125 > heading && heading > 1.875) {
          img = "marker3d5.png";
        } else if (1.875 > heading && heading > 1.125) {
          img = "marker3d6.png";
        } else if (1.125 > heading && heading > 0.375) {
          img = "marker3d7.png";
        } else if (4.875 < heading && heading < 5.625) {
          img = "marker3d1.png";
        } else if (4.125 < heading && heading < 4.875) {
          img = "marker3d2.png";
        } else if (3.375 < heading && heading < 4.125) {
          img = "marker3d3.png";
        } else {
          img = "marker3d0.png";
        }
        let circlePointPM = [point.x, point.y, level - 4, img];
        EventBus.$emit("fix-2d-to-3d", circlePointPM);
      },
    }
  }
</script>
<style lang="scss">
  .two-three-linkage{
    .SgsScenceMap {
      .el-card__header{
        padding: 12px 20px;
        font-size: 14px;
      }
      .box-card {
        width: 35%;
        position: absolute;
        z-index: 10000;
        left: 0.5%;
        bottom: 1%;
        .box-card-head > i {
          float: right;
          padding: 3px 0px;
          color: #6b6767;
          font-weight: 200;
          cursor: pointer;
        }
        .sgsContainer {
          height: 270px;
        }
      }
    }
    .SgsScenceMapClose{
      .box-card {
        width: 15%;
        position: absolute;
        z-index: 10000;
        left: 0.5%;
        bottom: 1%;
        .el-card__body {
          padding: 0 !important;
        }
        .box-card-head > i {
          float: right;
          font-size: 14px;
          padding: 3px 0px;
          color: #6b6767;
          font-weight: 200;
          cursor: pointer;
        }
      }
    }
  }
</style>
