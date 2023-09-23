<template>
  <div>
    <div id="cesiumContainer"></div>
    <template v-for="(item, index) in cSpecialLayers">
        <c-rest-tilelayer
          v-if="item.layerType == 'SMRESTMAP'"
          :key="item.key || item.resID"
          :url="item.url"
          :visible="item.visible"
          :opacity="item.opacity"
          :prjTrans="item.prjTrans"
          :focus="item.focus"
          :options="item.options"
          :layerIndex="index + cesiumLayerCount"
        >
        </c-rest-tilelayer>
        <c-wms-imageryprovider
          v-if="item.layerType == 'WMS111'"
          :version="'1.1.1'"
          :key="item.key || item.resID"
          :url="item.url"
          :visible="item.visible"
          :opacity="item.opacity"
          :options="item.options"
          :zIndex="index + cesiumLayerCount"
        >
        </c-wms-imageryprovider>
        <c-wms-imageryprovider
          v-if="item.layerType == 'WMS130'"
          :version="'1.3.0'"
          :key="item.key || item.resID"
          :url="item.url"
          :visible="item.visible"
          :opacity="item.opacity"
          :options="item.options"
          :zIndex="index + cesiumLayerCount"
        >
        </c-wms-imageryprovider>
        <c-wmts-imageryprovider
          v-if="item.layerType == 'WMTS'"
          :key="item.key || item.resID"
          :url="item.urlTemplate || item.url"
          :visible="item.visible"
          :opacity="item.opacity"
          :options="item.options"
          :zIndex="index + cesiumLayerCount"
        >
        </c-wmts-imageryprovider>
        <c-wmts-imageryprovider
          v-if="item.layerType == 'WMTS100'"
          :key="item.key"
          :url="item.urlTemplate || item.url"
          :visible="item.visible"
          :opacity="item.opacity"
          :options="item.options"
          :zIndex="index + cesiumLayerCount"
        >
        </c-wmts-imageryprovider>
        <c-wmts-imageryprovider
          v-if="item.layerType == 'SGSWMTS100'"
          :key="item.key"
          :url="item.urlTemplate || item.url"
          :visible="item.visible"
          :opacity="item.opacity"
          :options="item.options"
          :zIndex="index + cesiumLayerCount"
        >
        </c-wmts-imageryprovider>
        <s3-m-layer
          v-if="item.layerType == 'SMS3MLAYERS'"
          :key="item.resID"
          :url="item.url"
          :visible="item.visible"
          :opacity="item.opacity"
          :focus="item.focus"
          :options="item.options"
          :zIndex="index + cesiumLayerCount"
        ></s3-m-layer>
        <cesium-terrain
          v-if="item.layerType == 'SMTERRAIN'"
          :key="item.resID"
          :url="item.url"
          :visible="item.visible"
          :opacity="item.opacity"
        >
        </cesium-terrain>
        <single-scene
          v-if="item.layerType == 'SMSCENELAYERS'"
          :key="item.resID"
          :url="
            isNewCesiumLib && item.urlTemplate ? item.urlTemplate : item.url
          "
          :visible="item.visible"
          :opacity="item.opacity"
          :options="item.options"
          :zIndex="index + cesiumLayerCount"
        ></single-scene>
        <l-esri-imagery-provider
          v-if="item.layerType == 'ArcGISREST'"
          :key="item.resID || item.key"
          :url="item.url"
          :visible="item.visible"
          :opacity="item.opacity"
          :zIndex="index + cesiumLayerCount"
          :layers="item.layerName"
        ></l-esri-imagery-provider>
        <csm-vector-tilelayer
          v-if="item.layerType == 'SMVectorTile'"
          :key="item.resID"
          :url="item.url"
          :visible="item.visible"
          :opacity="item.opacity"
          :zIndex="index + cesiumLayerCount"
        ></csm-vector-tilelayer>
      </template>
  </div>
</template>

<script>
import {
  mapState,
  mapMutations
} from 'vuex'
import { getLayerSubdomains } from "../js/mapUtil";
import {
  CRestTilelayer,
  CWmsImageryprovider,
  CWmtsImageryprovider,
  S3MLayer,
  SingleScene,
  CesiumTerrain,
  CsmVectorTilelayer,
  LEsriImageryProvider
} from "../package/cesium/main";
// import CesiumScene from "../scene/CesiumScene.vue";

let flyNodes = null;
export default {
  components: {
    CRestTilelayer,
    CWmsImageryprovider,
    CWmtsImageryprovider,
    S3MLayer,
    SingleScene,
    CesiumTerrain,
    CsmVectorTilelayer,
    LEsriImageryProvider,
  },
  data() {
    return {
      markData: null,
      oldId: null,
      Ddplain: [],
      cesiumLayerCount: 0,
      currentBaseMap:{}
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
  computed:{
    ...mapState({
      baseMapLayersGroup: (state) => state.map.baseMapLayersGroup,
      cSpecialLayers: state => state.scene.cSpecialLayers,
    }),
    // currentBaseMap() {
    //   return this.baseMapLayersGroup[0];
    // }
  },
  destroyed() {
    this.$bus.$off("markerplain");
    this.$bus.$off("flyTolist");
  },
  methods: {
    ...mapMutations([
      'cAddLayer',
    ]),
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
      let promises = [], viewerOptions = {
          shadows: true,
          navigation: false,
          selectionIndicator: false,
          infoBox: false,
        };
      //三维图层加载
      let sceneType = ['SMSCENELAYERS','SMS3MLAYERS','SMTERRAIN'];
      this.currentBaseMap = this.baseMapLayersGroup[this.baseMapLayersGroup.length - 1];
      let sceneLayers = this.currentBaseMap.layers.filter((layer) => {
        return layer.layerType && !layer.isStandlayer && sceneType.indexOf(layer.layerType) > -1
      })
      sceneLayers.forEach((sceneLayer) => {
        let url = this.convertSceneProxyUrl(sceneLayer.layerUrl, sceneLayer.layerType, sceneLayer.name);
        let _sceneOption = {}, promise
        if (APPCONFIG.NewCesiumLib && APPCONFIG.MuleSubdomains && APPCONFIG.MuleSubdomains.length) {
          _sceneOption.subdomains = APPCONFIG.MuleSubdomains;
        }
        if(sceneLayer.layerType === "SMS3MLAYERS"){
          _sceneOption.name = sceneLayer.name
          promise = scene.addS3MTilesLayerByScp(url + "/config", _sceneOption);
          promises.push(promise);
        }else if(sceneLayer.layerType === "SMSCENELAYERS"){
          promise = scene.open(url, undefined, _sceneOption);
          promise.then((layers)=>{
            /**注记与图标图层进行一对一关联，图层规则如下：名称相同，图层后缀不同；例：省级注记（省级_ZJ）、省级图标（省级_TB）*/
            layers.map((item)=>{
              if(item._s3MTilesLabelStyle&&item.name.toUpperCase().indexOf('_TB') != -1){
                item.isOverlapDisplayed = false;
                layers.map((layerdata)=>{
                  if(layerdata._s3MTilesLabelStyle&&layerdata.name.toUpperCase().indexOf('_ZJ') != -1){
                    if(layerdata.name.trim().substring(0,layerdata.name.trim().lastIndexOf("_")) === item.name.trim().substring(0,item.name.trim().lastIndexOf("_"))){
                      layerdata.isOverlapDisplayed = false;
                      item.iconRelatedTextLayerID = layerdata.id;
                    }
                  }
                });
              }
            });
          });
          promises.push(promise);
        }else if(sceneLayer.layerType === "SMTERRAIN"){
          viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
            url : url,
            isSct : true//地形服务源自SuperMap iServer发布时需设置isSct为true
          })
        }
      })
      Cesium.when.all(promises,(layers) => {
        this.onSceneReady(layers);
        this.initViewerEvent()
      },
      (e) => {
        //为防止部分异常导致三维打不开，捕获异常后继续后续操作
        this.onSceneReady()
        this.initViewerEvent()
        console.error('三维场景可能部分异常或全部异常，请检查数据和网络情况！')
      })

      // this.initResetLocation();
      // this.leftHander();
    },
    initViewerEvent() {
      let handler = new Cesium.ScreenSpaceEventHandler(Viewer.scene.canvas);
      let that = this;
      handler.setInputAction(function(e){
          // 获取鼠标屏幕坐标,并将其转化成笛卡尔坐标 服务定点漫游功能
          if(that.startFlyCircle){
            Viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)
            var position = e.position;
            var last = Viewer.scene.pickPosition(position);
            last.z = last.z+2
            Viewer.camera.flyTo({
                destination: last,
                orientation: {
                  pitch :0
                }
            });
            //Viewer.camera.flyCircle(last);
            Viewer.camera.lookAt(last, new Cesium.HeadingPitchRange(0, 0, 5000));
            scene.screenSpaceCameraController.enableZoom = false
          }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      Viewer.selectedEntityChanged.addEventListener((entity) => {
          EventBus.$emit('initPopup',entity);
      });
    },
    async onSceneReady(layers) {
      //初始化数据源耗时不小，并且同时渲染白膜及转动相机位置容易导致卡顿
      this._loadingService && this._loadingService.close();
      // EventBus.$emit("layersChanged",Viewer.scene.layers.layerQueue);
      // if (layers && layers[0]) {
      //   layers[0].forEach(s3mlayer => {
      //     // s3mlayer.clearMemoryImmediately = true;
      //     s3mlayer.indexedDBSetting.isGeoTilesSave = true
      //   });
      // } else {
      //   layers = Viewer.scene.layers.layerQueue
      // }
      if (this.currentBaseMap.isEntity) {
        changeUnderGroundAlpha(this.currentGroundAlpha, Viewer);
      }
      //判断是否开启自动定位
      if (this.currentBaseMap.isautomove) {
        //判断是否存在上一次地图位置
        //二维地图zoom大于13才允许自动定位
        if (this.lastMapPosition && this.lastMapPosition.center) {
          //判断是否需要做坐标转换
          let position = {
            lng: this.lastMapPosition.center.lng,
            lat: this.lastMapPosition.center.lat
          }
          if (this.currentBaseMap.isprojchange) {
            const { data } = await transformByParams(transformUrl, TransformConfig.TransformParams.planeToLonlat, [this.lastMapPosition.center]);
            let point = data.resultInfo.data.points[0];
            position = {
              lng: point.x,
              lat: point.y
            }
          }
          // 平面场景自动定位
          if(this.currentBaseMap.desc == 'NONEARTHFLAT'){
            let point = new Cesium.Cartesian3(parseFloat(this.lastMapPosition.center.lng), parseFloat(this.lastMapPosition.center.lat), parseFloat(cameraCfg.destination.z))
            let pointCartographic = Viewer.scene.camera._projection.unproject(point)
            let pointCX = Cesium.Math.toDegrees(pointCartographic.longitude)
            let pointCY = Cesium.Math.toDegrees(pointCartographic.latitude)
            Viewer.scene.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(pointCX, pointCY, pointCartographic.height),
              orientation: {
                heading: cameraCfg.orientation.heading,
                pitch: cameraCfg.orientation.pitch,
                roll: cameraCfg.orientation.roll
              }
            })
          }else{
            Viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(position.lng, position.lat, APPCONFIG.Analysis.locationHeight),
            })
          }
        }
      } else {
        if(this.currentBaseMap.desc == 'NONEARTHFLAT'){
          let cesiumX = cameraCfg.destination.x
          let cesiumY = cameraCfg.destination.y

          let point = new Cesium.Cartesian3(parseFloat(cesiumX), parseFloat(cesiumY), parseFloat(cameraCfg.destination.z))
          let pointCartographic = Viewer.scene.camera._projection.unproject(point)
          let pointCX = Cesium.Math.toDegrees(pointCartographic.longitude)
          let pointCY = Cesium.Math.toDegrees(pointCartographic.latitude)
          Viewer.scene.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(pointCX, pointCY, pointCartographic.height),
            orientation: {
              heading: cameraCfg.orientation.heading,
              pitch: cameraCfg.orientation.pitch,
              roll: cameraCfg.orientation.roll
            }
          })
        }else{
          /*Viewer.camera.flyToBoundingSphere(bounds, {
            duration: 3
          });*/
        }
      }
      let mapLayers = this.currentBaseMap.layers.filter((layer) => {
        return layer.layerType && (layer.layerType === "SMRESTMAP" || layer.layerType.indexOf("WMTS") > -1) && !layer.isStandlayer
      })
      mapLayers.forEach((layer) => {
        let _layer = this.conventBaseToLayer(layer)
        _layer.noClear = true
        _layer.key = layer.pkid
        if (_layer.layerType === "SMRESTMAP") {
          _layer.prjTrans = true
        }
        _layer.show = true
        _layer.visible = true
        _layer.opacity = 1
        this.cAddLayer(_layer)
      })
      this.batchNoteLayer(true)
      this.openAnimation();
    },
    openAnimation(){
       let flyToViewerOptions = {...APPCONFIG.FlyToViewer};
       flyNodes = flyToViewerOptions.flyOPtions;
       if(flyToViewerOptions.startView.destination.height){
         flyToViewerOptions.startView.destination= this.wgsToCartesian(flyToViewerOptions.startView.destination);
       }
       if(flyToViewerOptions.animation){
         //初始位置
         try{window.viewer.camera.setView(flyToViewerOptions.startView);}catch(e){console.log(e)};

         if(flyNodes && flyNodes.length){
           this.excuteFlying(0);
         }
       }
    },
    wgsToCartesian({longitude,latitude,height}) {//wgs84转笛卡尔：经度，纬度，高度
      return Cesium.Cartesian3.fromDegrees(longitude,latitude,height)
    },
    excuteFlying(flyNodeIndex){
      let self = this;
      if(!flyNodes)return false;
      if(!flyNodes.length)return false;
      try{let v = flyNodes[flyNodeIndex];}catch(e){return false;}
      let node = flyNodes[flyNodeIndex].options;
      let nodeOrientation = node.orientation;
      window.viewer.camera.flyTo({
        destination: self.wgsToCartesian(node.destination),
        duration: node.duration,
        orientation: {
          heading: Cesium.Math.toRadians(nodeOrientation.heading),
          pitch: Cesium.Math.toRadians(nodeOrientation.pitch),
          roll: Cesium.Math.toRadians(nodeOrientation.roll)
        },
        complete:function () {
          if ((flyNodeIndex + 1 ) !== flyNodes.length) {
            //回调下一个节点
            self.excuteFlying(flyNodeIndex + 1);
          }
        }
      })
    },
    conventBaseToLayer(item, maxZoom) {
        let userKey = "886e60bb7e014f22a707de23e6f6505d";
        let url = item.layerUrl.indexOf('proxy') > -1 ? (item.layerUrl + '/' + userKey) : item.layerUrl;
        let _item;
        switch (item.layerType) {
          case 'WMTS':
            item = JSON.parse(JSON.stringify(item));
            let identifier = item.identifier,
              matrixIds = [],
              layerOptions = {
                layerType: 'WMTS',
                url: url,
                key: item.pkid,
                options: {
                  layer: item.name,
                  tilematrixSet: item.matrixSet,
                  style: 'default',
                  format: item.format,
                  identifier: item.identifier,
                  maxZoom: item.identifier && item.identifier.length ? item.identifier.length - 1 : maxZoom
                }
              };
            if (item.resolution && item.resolution.length) {
              layerOptions.options.resolutions = item.resolution;
            }
            if (identifier && identifier.length) {
              identifier.forEach((ident) => {
                matrixIds.push({
                  identifier: Number(ident)
                })
              })
              layerOptions.options.matrixIds = matrixIds;
            }
            _item = layerOptions;
            break;
          case 'SMRESTMAP':
            _item = {
              layerType: 'SMRESTMAP',
              url: url,
              key: item.pkid,
              layerName: item.name,
              options: {
                transparent: false,
                maxZoom: maxZoom
              }
            }
            break;
          default:
            _item = {}
        }
        return getLayerSubdomains(_item);
      },
    
    batchNoteLayer(flag){
      if(this.currentBaseMap.noteLayer){
        let noteLayer = this.currentBaseMap.noteLayer
        if(noteLayer.layerType === "SMRESTMAP" || noteLayer.layerType === "WMTS"){
          noteLayer = this.conventBaseToLayer(noteLayer)
          noteLayer.key = this.currentBaseMap.noteLayer.pkid
          if (noteLayer.layerType === "SMRESTMAP") {
            noteLayer.prjTrans = true;
          }
        }else{
          noteLayer.url = this.convertSceneProxyUrl(noteLayer.layerUrl, noteLayer.layerType, noteLayer.name)
        }
        noteLayer.noClear = true
        if(flag){
          this.cAddLayer(noteLayer)
        }else{
          this.cRemoveLayer(noteLayer)
        }
      }
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
