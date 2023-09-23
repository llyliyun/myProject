<template>
<div class="cesium-scene" id="cesium-scene">
  <slot></slot>
</div>
</template>

<script>
import {Loading} from 'element-ui';
import {
  mapState,
  mapMutations,
  mapActions
} from 'vuex'
// import { changeUnderGroundAlpha,calculateSizeFromAltitude,getBoundsFromPromisesLayer } from '@/components/common/sceneUtil'
// import { transformByParams } from '@/components/common/dfcUtil'
// import { apiTransGeojsonPrj} from '@/apis/api'
// import { ServiceConfig, DFC } from '@/config/app-config'
// import { loadScript, getLayerSubdomains } from '@/components/common/mapUtil'

import MeasureMixin from "./mixin/MeasureMixin"
import QueryPointMixin from "./mixin/QueryPointMixin"
import ScenePrintMixin from "./mixin/ScenePrintMixin"
import BuildingSimulationMixin from "./mixin/BuildingSimulationMixin"
// import MapMixin from "../mixin/MapMixin"

// let Analysis = APPCONFIG.Analysis, cameraCfg = Analysis.default.camera;
// let transformUrl = ServiceConfig.httpproxy + '?url=' + DFC.transformUrl,
//     TransformConfig = APPCONFIG.TransformConfig;
// let flyNodes = null;
// let loadCesiumScript;

export default {
  // mixins:[MeasureMixin,QueryPointMixin,ScenePrintMixin,BuildingSimulationMixin, MapMixin],
  data() {
    return {
      show: false,
      startFlyCircle:false
    }
  },
  // beforeCreate() {
  //   loadCesiumScript = loadScript([process.env.URL_ENV+'cesium/1.54.0/Cesium.js']);
  // },
  mounted() {
    EventBus.$on('start-surface',this.startSurface)
    EventBus.$on('close-surface',this.closeSurface)
    this._loadingService = Loading.service({
      target: this.$el,
      background: 'rgba(0, 0, 0, 0.8)',
      text: '正在加载中',
      spinner: 'el-icon-loading'
    });
    // loadCesiumScript.then(() => {
    //   this.initMount();
    //   require.ensure([], function(require){
    //     // require('./../common/cesium/DrawHandler.js');
    //     require('./cesium/DrawHandler.js');
    //     require('./cesium/GeojsonUtil.js');
    //     // require('./../common/cesium/GeojsonUtil.js');
    //   },'CesiumApp');
    // })
  },
  computed: {
    ...mapState({
      userInfo: state => state.user.userInfo,
      baseMapLayersGroup: state => state.map.baseMapLayersGroup,
      currentGroundAlpha: state => state.entity.currentGroundAlpha,
      lastMapPosition: state => state.map.lastMapPosition,
      openLocation: state => state.map.openLocation
    }),
    currentBaseMap() {
      return this.baseMapLayersGroup[0];
    }
  },
  watch: {
    currentBaseMap(val, oldVal) {
      if(val && val.type && val.type == "scene"){
        this.initViewer()
      }
    },
  },
  beforeDestroy() {
    if(window.Viewer && !Viewer.isDestroyed()) window.Viewer.destroy()
    this.offEvent();
  },
  methods: {
    ...mapMutations([
      'cShowHidePlane',
      'cAddLayer',
      'cRemoveLayer'
    ]),
    initMount() {
      this.initLayerout();
      this.initViewer();
      this.initEvent();
      //通知子组件父组件已经渲染完毕
      for (let children of this.$children) {
        children._initHooks && children._initHooks();
      }
    },
    initEvent() {
      EventBus.$on('tool-round-circle',this.roundCircle)
      EventBus.$on('toolbar-addTxtData', this.addTxtData);
      EventBus.$on("add-note-layer", this.batchNoteLayer);
      EventBus.$on("get-all-markers",this.renderMarker);
    },
    offEvent() {
      EventBus.$off('tool-round-circle',this.roundCircle)
      EventBus.$off('toolbar-addTxtData', this.addTxtData);
      EventBus.$off("add-note-layer", this.batchNoteLayer);
      EventBus.$off("get-all-markers",this.renderMarker);
    },
    initViewer() {
      if(this.currentBaseMap && this.currentBaseMap.type == "scene"){
        if (!window.Cesium) { return }
        if(window.Viewer){
          try {
            !Viewer.isDestroyed() && window.Viewer.destroy();
            window.Viewer = null;
          } catch (e) {
            console.log('销毁上一个三维失败');
          }
          this.renderView();
        } else {
          this.renderView();
        }
        if (this.lastMapPosition && this.lastMapPosition.center && this.openLocation) {
          //判断是否需要做坐标转换
          let position = {
            lng: this.lastMapPosition.center.lng,
            lat: this.lastMapPosition.center.lat
          }
          Viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(position.lng, position.lat, APPCONFIG.Analysis.locationHeight),
          })
        }
      }
    },
    renderView(){
      let promises = [], viewerOptions = {
          shadows: true,
          navigation: false,
          selectionIndicator: false,
          infoBox: false,
        };
      //平面三维支持
      if (this.currentBaseMap.desc == 'NONEARTHFLAT') {
        viewerOptions.sceneMode = Cesium.SceneMode.COLUMBUS_VIEW;
        viewerOptions.imageryProvider = new Cesium.SingleTileImageryProvider({
          url: './static/img/background.png'
        });
        this.cShowHidePlane(true)
      }
      let viewer = new Cesium.Viewer(this.$el, viewerOptions);
      //关闭cesium logo
      viewer._cesiumWidget._creditContainer.style.display = 'none';
      let scene = viewer.scene;
      Analysis.debugShowFramesPerSecond ? scene.debugShowFramesPerSecond = true : scene.debugShowFramesPerSecond = false;
      //默认关闭深度检测，防止地平面闪烁
      scene.globe.depthTestAgainstTerrain = true;
      let start = Cesium.JulianDate.fromDate(new Date(2020,1,20,12));
      viewer.clock.currentTime = start.clone();
      window.Viewer = viewer;
      EventBus.$emit('ViewerChanged')
      //兼容之前的三维加载
      if (this.currentBaseMap) {
        if(this.currentBaseMap.isShow && this.currentBaseMap.url){
          let url = this.currentBaseMap.url;
          url = this.convertSceneProxyUrl(url, 'SMSCENELAYERS', null)
          let promise = scene.open(url);
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
        }
      }
      //三维图层加载
      let sceneType = ['SMSCENELAYERS','SMS3MLAYERS','SMTERRAIN'];
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
      EventBus.$emit("layersChanged",Viewer.scene.layers.layerQueue);
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
      // this.openAnimation();
    },
    wgsToCartesian({longitude,latitude,height}) {//wgs84转笛卡尔：经度，纬度，高度
      return Cesium.Cartesian3.fromDegrees(longitude,latitude,height)
    },
    openAnimation(){
       let flyToViewerOptions = {...APPCONFIG.FlyToViewer};
       flyNodes = flyToViewerOptions.flyOPtions;
       flyToViewerOptions.startView.destination= this.wgsToCartesian(flyToViewerOptions.startView.destination);
       if(flyToViewerOptions.animation){
         //初始位置
         try{Viewer.camera.setView(flyToViewerOptions.startView);}catch(e){console.log(e)};

         if(flyNodes && flyNodes.length){
           this.excuteFlying(0);
         }
       }
    },
    excuteFlying(flyNodeIndex){
      let self = this;
      if(!flyNodes)return false;
      if(!flyNodes.length)return false;
      try{let v = flyNodes[flyNodeIndex];}catch(e){return false;}
      let node = flyNodes[flyNodeIndex].options;
      let nodeOrientation = node.orientation;
      Viewer.camera.flyTo({
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
    roundCircle(flag){
      this.startFlyCircle = flag
      if(!flag){
        Viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)
        Viewer.scene.screenSpaceCameraController.enableZoom = true
      }
    },
    //开启地下模式
    startSurface(){
      Viewer.scene.undergroundMode = false;
      Viewer.scene.screenSpaceCameraController.minimumZoomDistance = 1;
      Viewer.scene.globe.globeAlpha = 1;
    },
    closeSurface(){
      Viewer.scene.undergroundMode = true; //设置开启地下场景
      Viewer.scene.screenSpaceCameraController.minimumZoomDistance = -1000;//设置相机最小缩放距离,距离地表-1000米
      Viewer.scene.globe.globeAlpha = 0.1;
    },
    initLayerout() {
      let $parentNode = this.$el.parentNode;
      this.$el.style.height = $parentNode.clientHeight + 'px';
    },
    forceResize() {
      Viewer && Viewer.forceResize();
    },
    async addTxtData(data, type, identifier){
      // console.log(data);
      // console.log(type);
      // console.log(identifier);
      //Viewer.dataSources.removeAll()
      let flag = false
      for(let i=0; i<Viewer.dataSources.length; i++){
        let _dataSource = Viewer.dataSources.get(i)
        if(identifier && _dataSource.identifier && _dataSource.identifier === identifier){
          Viewer.dataSources.remove(_dataSource, true)
          flag = true
          break;
        }
      }
      if(flag || data === 'his') return
      if(data){
        if(this.currentBaseMap.isprojchange){
          let param = {
            targetEpsgcode: '4490',
            method: '',
            sourceProjectName: APPCONFIG.sourceProName,
            geojson: JSON.stringify(data)
          }
          let res = await apiTransGeojsonPrj(param)
          if(res.data.resultInfo.success){
            data = res.data.resultInfo.data
          }else{
            this.$message.error(res.data.resultInfo.message || "三维坐标转换失败")
            return
          }
        }
        let promise = Cesium.GeoJsonDataSource.load(data,{clampToGround:true});
        promise.then(function(dataSource) {
          dataSource.identifier = identifier
          Viewer.dataSources.add(dataSource);
          let entities = dataSource.entities.values;
          for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            if(Cesium.defined(entity.position)){
              entity.billboard = {
                image:'./static/img/marker.png',
                width:28,
                height:36
              }
            }else if(Cesium.defined(entity.polygon)){
              entity.polygon.material = Cesium.Color.BLUE.withAlpha(.5);
              entity.polygon.outline = false;
            }else if(Cesium.defined(entity.polyline)){
              entity.nameID = i;   //给每条线添加一个编号，方便之后对线修改样式
              entity.polyline.width = 10;  //添加默认样式
              (entity.polyline.material = new Cesium.PolylineGlowMaterialProperty({
                glowPower: .1, //一个数字属性，指定发光强度，占总线宽的百分比。
                color: Cesium.Color.ORANGERED.withAlpha(.9)
              }), 10)
            }
          }
        });
        Viewer.flyTo(promise)
      }
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
    renderMarker(features, identifier){
      if(!features.length) return
      let geojson = {
        features: [],
        type: "FeatureCollection"
      }
      if(features && features instanceof Array){
        features.forEach((feature) => {
          geojson.features.push(feature.markerProps.coords)
        })
      }
      this.addTxtData(geojson, null, identifier)
    }
  }
}
</script>

<style lang="scss" scope>
#cesium-scene {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>
