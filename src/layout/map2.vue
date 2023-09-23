<template>
  <l-map ref="map" class="leaflet-map" :options="mapOptions" v-if="mapOptions" @l-click="onMapClick" >
    <l-layer-group ref="baseMapLayersGroup">
      <template v-for="(item, index) in baseMapLayers">
        <l-wmts-tilelayer
          v-if="item.layerType == 'WMTS'"
          :key="item.key"
          :url="item.urlTemplate || item.url"
          :options="item.options"
          :zIndex="index"
          >
        </l-wmts-tilelayer>
        <l-wmts-tilelayer
          v-else-if="item.layerType == 'WMTS100'"
          :key="item.key"
          :url="item.urlTemplate || item.url"
          :options="item.options"
          :zIndex="index"
          >
        </l-wmts-tilelayer>
        <l-wmts-tilelayer
          v-else-if="item.layerType == 'SGSWMTS100'"
          :key="item.key"
          :url="item.urlTemplate || item.url"
          :options="item.options"
          :zIndex="index"
          >
        </l-wmts-tilelayer>
        <l-wmts-tilelayer
          v-else-if="item.layerType == 'WMTS-china'"
          :key="item.key"
          :url="item.urlTemplate || item.url"
          :options="item.options"
          :zIndex="index"
          >
        </l-wmts-tilelayer>
        <l-rest-tilelayer
          v-else-if="item.layerType == 'SMRESTMAP'"
          :key="item.key"
          :url="item.urlTemplate || item.url"
          :layersID="item.layerName"
          :layerName="item.name"
          :transparent="true"
          :options="item.options"
          :zIndex="index"
          >
        </l-rest-tilelayer>
      </template>
    </l-layer-group>
    </l-map>
</template>

<script>
import DrawPlug from "../js/hi";
import Vue from 'vue'
// import L from 'leaflet'
import 'leaflet-contextmenu';
import 'leaflet-contextmenu/dist/leaflet.contextmenu.min.css';
import {
  LMap,
  LWmsTilelayer,
  LMarker,
  LRestTilelayer,
  LWmtsTilelayer,
  LLayerGroup,
  LQuerybtnControl,
  LEsriDynamicTilelayer,
  LGeojson,
  LPolyline,
  LMousePosition,
  LTimeServiceLayer
} from '../package/leaflet/main.js'
import {
  apiBaseMap,
} from '../js/api'
import {
  mapState,
  mapMutations
} from 'vuex'
const CrsMap = {
  "EPSG:4490": L.CRS.TianDiTu_WGS84,
  "EPSG:4326": L.CRS.EPSG4326,
  "EPSG:3857": L.CRS.EPSG3857,
  "EPSG:900913": L.CRS.TianDiTu_Mercator,
};
export default {
  components:{
    LMap,
    LWmsTilelayer,
    LMarker,
    LRestTilelayer,
    LWmtsTilelayer,
    LLayerGroup,
    LQuerybtnControl,
    LEsriDynamicTilelayer,
    LGeojson,
    LPolyline,
    LMousePosition,
    LTimeServiceLayer
  },
  data(){
    return {
      resultInfo:{},
      mapOptions:null,
      baseMapLayers: [],
      currentMap:null,
    }
  },
  mounted() {
    EventBus.$on('baseMapChange', this.baseMapChange);
    // 获取json文件数据
    const result = require("../../static/json/query.json");
    this.resultInfo = result.resultInfo.data.items;
    this.currentMap = this.resultInfo[0];
    this.initBaseMap();
    let wmts = APPCONFIG.wmts;
    var resolutions = wmts.resolutions;
    let center = wmts.center;
    this.mapOptions = {
      center: [center.y, center.x],
        zoom: center.zoom,
        minZoom: center.minZoom,
        maxBounds: L.latLngBounds(
          L.latLng(this.currentMap.bbox[1], this.currentMap.bbox[0]),
          L.latLng(this.currentMap.bbox[3], this.currentMap.bbox[2])
        ),
        preferCanvas: true,
    }

  },
  computed:{
    ...mapState({
      baseMapLayersGroup: (state) => state.map.baseMapLayersGroup,
      mapMode:state => state.map.mapMode,
      isFirst:state => state.map.isFirst,
      mapIndex:state => state.map.mapIndex,
      historyIndex:state => state.map.historyIndex,
    })
  },
  beforeDestroy(){
    EventBus.$off('baseMapChange', this.baseMapChange);
  },
  methods: {
    ...mapMutations([
      'changeMapMode',
      'addBaseMapLayersGroup',
      'changeFirst'
    ]),
    async initBaseMap() {
      let self = this;
      let firstResult = await apiBaseMap();
      let resultInfo = [];
      resultInfo = firstResult.resultInfo.data.items;
      let items = resultInfo;
      let maps = [];

      if (this.$route.name == '3dscene') {
        this.changeMapMode('3d')
      }

      for (let i = 0; i < items.length; i++) {
        if(self.SeparateCesium || this.$route.name == '3dscene'){ //如果三维独立展示了 新增三维一张图独立路由配置
          if(self.mapMode == "2d"){
            if(items[i].mapType == 0){
              maps.push(self.bulid2dMap(items[i]))
            }
          } else if(self.mapMode == "3d"){
            if(items[i].mapType == 1){
              maps.push(self.build3dMap(items[i]))
            }
          }
        } else {
          if(items[i].mapType == 0){
            maps.push(self.bulid2dMap(items[i]))
          } else if(items[i].mapType == 1){
            maps.push(self.build3dMap(items[i]))
          }
        }
      }
      if (!items || !items.length) {
        this.$message.error('暂未配置底图，请联系管理员配置')
        return;
      }
      if(this.$route.query.fromMultiScreen){
        let currentMap = JSON.parse(localStorage.getItem('currentMap'));
        maps.unshift(currentMap)
      }
      if(this.isFirst){
        this.addBaseMapLayersGroup(maps.reverse());
        this.initMapConfig(this.currentMap, "default");
      }else{
        this.baseMapChange(this.baseMapLayersGroup.length-1,this.historyIndex)
      }
    },
    baseMapChange(mapIndex,index){
      this.currentMap = this.baseMapLayersGroup[mapIndex]
      this.initMapConfig(this.currentMap, index);
    },
    bulid2dMap(item){
      if (item.versions.length > 0) {
        let datas = []
        datas = item.versions.map((version) => {
          let layer = item.layers.filter((layer) => {
            return layer.version == version && !layer.isStandlayer
          })
          let noteLayer = item.layers.find((layer) => {
            return layer.version === version && layer.isStandlayer
          })
          if(noteLayer) noteLayer.noteLayerChecked = true
          return {
            version,
            layer,
            noteLayer
          }
        })
        item.verLayers = datas;
        item.type="map";
      }
      return item
    },
    build3dMap(item){
      item.type="scene";
      item.imgUrl="static/img/mapshow/yingxiang_1.png";
      item.url=item.realspaceurl;
      item.isShow=true;
      let noteLayer = item.layers.find((layer) => {
        return layer.isStandlayer
      })
      if(noteLayer){
        item.noteLayer = noteLayer
        item.noteLayer.noteLayerChecked = true
      }
      return item
    },
    initMapConfig(currentMap, index) {
      this.changeFirst();
      localStorage.setItem('currentMap',JSON.stringify(currentMap))
      this.baseMapLayers = [];
      this.wmtsMatrixIds = null;
      let mapOptions = {
        center: [currentMap.centerY, currentMap.centerX],
        zoom: currentMap.initLevel || 0,
        maxBounds: L.latLngBounds(L.latLng(currentMap.bbox[1], currentMap.bbox[0]), L.latLng(currentMap.bbox[3], currentMap.bbox[2])),
        preferCanvas: true
      }
      this.currentCenter = [currentMap.centerY, currentMap.centerX];
      this.currentZoom = currentMap.initLevel || 0;
      let origin = {};
      if(index==="default" && currentMap.defaultversion) {
        //使用默认指定的version:defaultversion
        currentMap.versions.forEach((v,i)=>{
          if(currentMap.defaultversion&&v===currentMap.defaultversion) {
            index = i;
          }
        })
      }else if(!index||index==="default") {
        index = 0;
      }
      this.activeIndex = index;
      currentMap.verLayers[index].layer.find(item => {
        if (item.origin) {
          origin = {
            x: item.origin[0],
            y: item.origin[1]
          }
          return true;
        }
      })
      let crsOptions = {
        //平面坐标系的origin只支持L.point类型 不支持数组
        origin: L.point(origin.x || currentMap.bbox[0], origin.y || currentMap.bbox[3]),
        bounds: L.bounds([currentMap.bbox[0], currentMap.bbox[1]], [currentMap.bbox[2], currentMap.bbox[3]]),
      }

      let resLayers = currentMap.verLayers[index].layer.filter((item) => {
        return item.resolution && item.resolution.length;
      })
      let scaleLayers = currentMap.verLayers[index].layer.filter((item) => {
        return item.scale && item.scale.length;
      })
      let maxZoom = 18;
      if(currentMap.layers[index].layerType == 'WMTS'){
        if (resLayers && resLayers.length) {
          crsOptions.resolutions = resLayers[0].resolution;
          maxZoom = crsOptions.resolutions.length - 1
        } else if(APPCONFIG.DefaultResolution && APPCONFIG.DefaultResolution.length){
          crsOptions.resolutions = APPCONFIG.DefaultResolution;
          maxZoom = crsOptions.resolutions.length - 1
        } else {
          crsOptions.dpi = 90.714
          maxZoom = scaleLayers && scaleLayers.length?scaleLayers[0].scale.length - 1:maxZoom
        }
      }
        let projCode = currentMap.projection == 'EPSG:4490' ? 'EPSG:4326' : currentMap.projection;
        const res = [];
        for(let i = 0;i<18;i++){
          res.push(0.703125/(Math.pow(2,i)));
        }
      mapOptions.crs = L.Proj.CRS("EPSG:4326",{origin:[-180,90],resolutions:res});
      mapOptions.maxZoom = maxZoom;
      mapOptions.minZoom = 7;
      mapOptions.contextmenu = true;
      mapOptions.contextmenuWidth=120,
      mapOptions.contextmenuItems=[];
      mapOptions.contextmenuItems.unshift({
        text: '设置地图显示范围',
        callback: this.setMapLevel
      });
      mapOptions.zoomControl = false;
      this.mapOptions = mapOptions;
      //判断坐标系是否一致，只有坐标系不一致的情况才切换坐标系重设中心点， 判断经依据crs的Bounds跟origin、resolutions， 不判断scales(dpi不同导致)
      let needChangeMapCrs = true;
      if (this.$refs && this.$refs.map && this.$refs.map.leaflet) {
        let map = this.$refs.map.leaflet;
        let oldCrsOptions = map.options.crs.options || map.options.crs; //自定义坐标系、平面坐标系无crs.options
          //是否切换坐标系调整为仅判断切图的原点是否保持一致及第一级的分辨率
        /*if (oldCrsOptions && L.point(oldCrsOptions.origin).equals(crsOptions.origin)
          && oldCrsOptions.resolutions
          && crsOptions.resolutions
          && oldCrsOptions.resolutions[0] == crsOptions.resolutions[0]) {
          needChangeMapCrs = false;
        }*/
        if (oldCrsOptions && L.point(oldCrsOptions.origin) && L.point(oldCrsOptions.origin).equals(crsOptions.origin)) {
          needChangeMapCrs = false;
        }
        // if (needChangeMapCrs) {
        //   //投影变换移除全部专题图
        //   this.baseMapCrsChange();
        //   this.mapOptions = mapOptions;
        // }
      }
      // 构造底图对象
      currentMap.verLayers[index].layer.map(item => {
        if (!item.isPano) {
          let layerObj = this.conventBaseToLayer(item);
          this.baseMapLayers.push(layerObj);
        }
      });
      // this.$refs.map && this.$refs.map.leaflet && this.$refs.map.leaflet._onResize();
      // this.batchNoteLayer(true);
    },
    conventBaseToLayer(item) {
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
                maxZoom: item.identifier && item.identifier.length ? item.identifier.length - 1 : this.mapOptions.maxZoom
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
            this.wmtsMatrixIds = matrixIds;
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
              maxZoom: this.mapOptions.maxZoom
            }
          }
          break;
        default:
          _item = {}
      }
      return _item;
    },
    batchNoteLayer(flag){
      if(this.currentBaseMap.verLayers[this.activeIndex].noteLayer){
        let layer = this.conventBaseToLayer(this.currentBaseMap.verLayers[this.activeIndex].noteLayer)
        layer.id = this.currentBaseMap.verLayers[this.activeIndex].noteLayer.pkid
        layer.noClear = true
        if(flag){
          this.addLayer(layer)
        }else{
          this.removeLayer(layer)
        }
      }
    },
    onMapClick(e) {
      if (e.layer) {
        return;
      }
      if (drawLayerGroup && this.$refs.map.leaflet.hasLayer(drawLayerGroup)) {
        drawLayerGroup.invoke('disableEdit');
      }
    },
    initMap() {
      let wmtsMap = this.resultInfo[1].layers[1];
      let wmts = APPCONFIG.wmts;
      var resolutions = wmts.resolutions;
      let center = wmts.center;
      let hcmap = L.map("map", {
        center: [center.y, center.x],
        maxZoom: center.maxZoom,
        zoom: center.zoom,
        crs: L.CRS.EPSG4326,
      });
      
      // L.supermap.TiledMapLayer(url).addTo(map);

      L.supermap.wmtsLayer(wmtsMap.layerUrl+"/886e60bb7e014f22a707de23e6f6505d",
        {
          layer: "vec",
          style: "default",
          tilematrixSet: "rasterdj",
          format: "image/png"
        }
      ).addTo(hcmap);
      // var layer = L.supermap.wmtsLayer(wmts.url, wmts.options).addTo(hcmap);

      // let wmtsyxlayer = new L.supermap.TiandituTileLayer({
      //   layerType: "img",
      //   key: "1d109683f4d84198e37a38c442d68311",
      // }).addTo(hcmap);
      // let wmtszjlayer = new L.supermap.TiandituTileLayer({
      //   layerType: "img",
      //   isLabel: true,
      //   key: "1d109683f4d84198e37a38c442d68311",
      // }).addTo(hcmap);
      //   var layer = L.supermap.wmtsLayer(wmts.url, wmts.options).addTo(hcmap);

      //  var zjlayer = L.supermap
      //    .wmtsLayer(wmts.zjurl, wmts.zjoptions)
      //   .addTo(hcmap);
      window.hcmap = hcmap;
      // window.wmtszjlayer = wmtszjlayer;
      // window.wmtsyxlayer = wmtsyxlayer;
      var _viewSpotLayer = L.layerGroup();
      hcmap.addLayer(_viewSpotLayer);
      window._viewSpotLayer = _viewSpotLayer;
      let drawPlug = new DrawPlug(hcmap, _viewSpotLayer);
      window.drawPlug = drawPlug;
    },
  },
};
</script>

<style>
</style>
