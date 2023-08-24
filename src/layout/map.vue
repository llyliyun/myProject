<template>
  <div id="cesiumContainer"></div>
</template>

<script>
export default {
  data() {
    return {
      markData: null,
      oldId: null,
      Ddplain: [],
    };
  },
  mounted() {
    this.onload3D();
    this.$bus.$on("markerplain", (data) => {
      this.getSitePosition(data);
    });
    this.$bus.$on("marker3dplain", (data) => {
      this.getSite3Dplay(data);
    });

    this.$bus.$on("flyTolist", (data) => {
      this.flyToleft(data);
    });
  },
  destroyed() {
    this.$bus.$off("markerplain");
    this.$bus.$off("flyTolist");
  },
  methods: {
    onload3D() {
      window.viewer = new Cesium.Viewer("cesiumContainer", {
        orderIndependentTranslucency: false,
        animation: false, //是否显示动画控件(左下方那个)
        baseLayerPicker: false, //是否显示图层选择控件
        geocoder: false, //是否显示地名查找控件
        timeline: false, //是否显示时间线控件
        sceneModePicker: false, //是否显示投影方式控件
        navigationHelpButton: false, //是否显示帮助信息控件
        infoBox: false, //是否显示点击要素之后显示的信息
        navigation: false,
        homeButton: false,
        selectionIndicator: false,
      });
      viewer._cesiumWidget._creditContainer.style.display = "none"; // 去掉 supermap 版权信息(logo)
      viewer.scene.globe.depthTestAgainstTerrain = true; //解决Cesium绘制几何图形被高程遮挡问题
      viewer.imageryLayers.addImageryProvider(
        new Cesium.TiandituImageryProvider({
          credit: new Cesium.Credit(
            "天地图全球影像服务     数据来源：国家地理信息公共服务平台 & 四川省测绘地理信息局"
          ),
          token: "1d109683f4d84198e37a38c442d68311",
        })
      );

      var imageryLayers = viewer.imageryLayers;
      //初始化天地图全球中文注记服务，并添加至影像图层
      var labelImagery = new Cesium.TiandituImageryProvider({
        mapStyle: Cesium.TiandituMapsStyle.CIA_C, //天地图全球中文注记服务（经纬度投影）
        token: "1d109683f4d84198e37a38c442d68311",
      });
      imageryLayers.addImageryProvider(labelImagery);
      this.initResetLocation();
      this.leftHander();
    },
    //缓慢进入
    initResetLocation() {
      viewer.scene.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(50, 37.5, 18000000),
      });
      var i = Date.now();

      function rotate() {
        var a = 0.1;
        var t = Date.now();
        var n = (t - i) / 1e3;
        i = t;
        viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, -a * n);
      }

      viewer.clock.onTick.addEventListener(rotate);
      setTimeout(function () {
        viewer.clock.onTick.removeEventListener(rotate);
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
            110.47456,
            37.004824,
            60000.0
          ),
          orientation: {
            heading: Cesium.Math.toRadians(357.8),
            pitch: Cesium.Math.toRadians(-20.5),
            roll: Cesium.Math.toRadians(360),
          },
          duration: 5,
        });
      }, 3000);
    },

    //点击飞进去
    flyToleft(data) {
      let _this = this;
      const brighterdata = {
        longitude: data.lat,
        latitude: data.lng,
        id: data.projectId,
      };
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          data.lat,
          data.lng - 0.5,
          30000.0
        ),
        orientation: {
          heading: Cesium.Math.toRadians(357.8),
          pitch: Cesium.Math.toRadians(-20.5),
          roll: Cesium.Math.toRadians(360),
        },
        duration: 3,
      });
      _this.brighter(brighterdata);
    },
    //鼠标左击事件
    leftHander() {
      const _this = this;
      var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction(function (movement) {
        var pick = viewer.scene.pick(movement.position);
        // 获取点击位置笛卡尔坐标
        if (pick.id.id == "video" || pick.id.id == "surrou") {
          _this.$bus.$emit("Ofthings", pick.id.id);
        } else {
          if (Cesium.defined(pick) && pick.id.id) {
            _this.$bus.$emit("billboardData", pick.id.id);
            var position = viewer.scene.pickPosition(movement.position);
            if (!position) {
              position = Cesium.Cartesian3.fromDegrees(0, 0, 0);
            }
            var cartographic = Cesium.Cartographic.fromCartesian(position);
            var longitude = Cesium.Math.toDegrees(cartographic.longitude);
            var latitude = Cesium.Math.toDegrees(cartographic.latitude);
            var height = cartographic.height;
            _this.brighter({
              longitude,
              latitude,
              height: height + 600,
              id: pick.id.id,
            });
            _this.$bus.$emit("3dmaker", { lat: longitude, lng: latitude });
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    //换标志点
    brighter(data) {
      this.$bus.$emit("gisBuilber", data.id);
      if (this.markData && this.oldId) {
        viewer.entities.getById(this.oldId).billboard = {
          image: this.markData,
          scale: 1,
          show: true,
          pixelOffset: new Cesium.Cartesian2(0, -30),
        };
      }
      this.markData = viewer.entities.getById(data.id).billboard.image;
      this.oldId = data.id;
      viewer.entities.getById(data.id).billboard = {
        image: require("../img/gis1.png"),
        scale: 1.5,
        show: true,
        pixelOffset: new Cesium.Cartesian2(0, -50),
      };
    },

    remove(data) {
      if (data == "") {
        viewer.entities.removeAll();
      } else {
        viewer.entities.removeById(data.id);
      }
    },
    getSite3Dplay(data) {
      let iconimg = null;
      if (this.Ddplain.length > 0) {
        this.Ddplain.forEach((item) => {
          viewer.entities.removeById(item.id);
        });
      }
      data.forEach((item) => {
        if (item.id == "video") {
          iconimg = require("../img/video.png");
        } else {
          iconimg = require("../img/huanjing.png");
        }
        viewer.entities.add({
          id: item.id,
          position: Cesium.Cartesian3.fromDegrees(
            Number(item.lat),
            Number(item.lng)
          ),
          billboard: {
            image: iconimg,
            scale: 1,
            MyValue: item,
            show: true,
            pixelOffset: new Cesium.Cartesian2(0, -30),
          },
        });
      });
      this.Ddplain = data;
    },

    //添加点
    getSitePosition(data) {
      console.log(data);
      viewer.entities.removeAll();
      for (let i = 0; i < data.length; i++) {
        let imgcolor = "";
        if (data[i].buildNature == "QQ") {
          imgcolor = require("../img/lvdun4.png");
        } else if (data[i].buildNature == "XINJ") {
          imgcolor = require("../img/lvdun2.png");
        } else {
          imgcolor = require("../img/lvdun3.png");
        }
        viewer.entities.add({
          id: data[i].projectId,
          position: Cesium.Cartesian3.fromDegrees(
            Number(data[i].lat),
            Number(data[i].lng)
          ),
          billboard: {
            image: imgcolor,
            scale: 1.2,
            MyValue: data[i],
            show: true,
            pixelOffset: new Cesium.Cartesian2(0, -30),
          },
        });
      }
    },
  },
};
</script>

<style>
.cesium-viewer-bottom {
  display: none;
}
</style>
