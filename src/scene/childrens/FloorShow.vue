<template>
  <div>
    <div class="floors" v-if='config'>
      <div class="building" :title='config.name'><i class="fa fa-shopping-cart" aria-hidden="true"></i></div>
      <div class='floor' v-for='(item,index) in config.floors' :key='index' @click="viewToFloor(item,index)" :class="{'active':index==activeIndex}">
        {{item.name}}
      </div>
    </div>
    <div class='mapContainer' v-show='mapShow'>
      <div class='mapTitle' v-if='config && activeIndex!=null'>
        {{config.floors[activeIndex].restMapName}}
        <div class="close" @click='close'><i class="fa fa-times" aria-hidden="true"></i></div>
      </div>
      <div id="floorMap" v-show='config && activeIndex!=null'></div>
    </div>
  </div>
</template>
<script>
import {
  mapState,
  mapMutations,
  mapActions
} from 'vuex';
import axios from 'axios'

import {
  ServiceConfig
} from '../../../config/app-config.js';
let map = null;
let restLayer = null;
let jsonLayer = null;
const CrsMap = {
  'L.CRS.EPSG4490': L.CRS.TianDiTu_WGS84,
  'L.CRS.EPSG4326': L.CRS.EPSG4326,
  'L.CRS.EPSG3857': L.CRS.EPSG3857,
  'L.CRS.EPSG900913': L.CRS.TianDiTu_Mercator,
}
export default {
  computed: {
    ...mapState({
      currentBaseMap: state => state.map.baseMapLayersGroup[0]
    }),
    config(){
      let self = this;
      self.activeIndex = null;
      let config = null;
      if(self.configs && self.configs.length && self.currentBaseMap){
        config = self.configs.find((item) => {
          return item.url == self.currentBaseMap.url;
        });
      }
      return config;
    }
  },
  data(){
    return{
      configs:APPCONFIG.query3dConfig,
      activeIndex:null,
      mapShow:true,
      floorFieldValue:null
    }
  },
  created(){
    EventBus.$on('ViewerChanged',this.viewerChanged)
  },
  beforeDestroy(){
    EventBus.$off('ViewerChanged',this.viewerChanged);
  },
  methods:{
    viewerChanged(){
      if(this.config){
        window.Viewer.pickEvent.addEventListener(this.sceneCick);
      }
    },
    close(){
      this.mapShow = false;
    },
    sceneCick(feature){
      if(feature[this.config.floorField]){
        if(this.floorFieldValue!=feature[this.config.floorField]){
          this.floorFieldValue = feature[this.config.floorField];
          let floors = this.config.floors;
          let sign = false;
          for(let i=0;i<floors.length;i++){
            let floor = floors[i];
            if(floor.floorValue == feature[this.config.floorField]){
              var item = floor;
              this.activeIndex = i;
              sign = true;
              break;
            }
          }
          if(sign){
            this.mapShow = true;
            if(map){
              this.changeLayer(item);
              this.changeStore(feature[this.config.scenceStoreField]);
            }else{
              this.$nextTick(() =>{
                this.initMap(item);
                this.changeStore(feature[this.config.scenceStoreField]);
              })
            }
          }else{
            this.activeIndex = null;
            this.mapShow = false;
          }
        }else{
          if(this.activeIndex){
            this.mapShow = true;
          }
          this.changeStore(feature[this.config.scenceStoreField]);
        }
      }else{
        this.activeIndex = null;
        this.mapShow = false;
        this.floorFieldValue = null;
      }
    },
    viewToFloor(item,index){
      if(this.floorFieldValue!=item.floorValue){
        this.floorFieldValue = item.floorValue;
        this.activeIndex = index;
        this.mapShow = true;
        let result = this.proCameraView(item.cameraView);
        window.Viewer.camera.flyTo(result);
        if(map){
          this.changeLayer(item);
        }else{
          this.$nextTick(() =>{
            this.initMap(item);
          })
        }
      }else{
        if(this.activeIndex){
          this.mapShow = true;
        }
      }
    },
    async changeStore(val){
      if(this.mapShow){
        let url = restLayer._url;
        let name = this.config.floors[this.activeIndex].storeSetName;
        let param = new SuperMap.QueryBySQLParameters({
          queryParams:{
            name:name,
            attributeFilter:`${this.config.restStoreField} = '${val}'`
          }
        });
        let self = this;
        L.supermap.queryService(`${ServiceConfig.httpproxy}?url=${url}`).queryBySQL(param, function (serviceResult) {
          let result = serviceResult.result;
          if(jsonLayer){
            map.removeLayer(jsonLayer);
          }
          jsonLayer = L.geoJSON(result.recordsets[0].features).addTo(map);
          map.setView(jsonLayer.getBounds().getCenter(),self.config.DPZoom);
        });
      }
    },
    proCameraView(cameraView){
      let result = {};
      result.destination = new Cesium.Cartesian3.fromDegrees(...cameraView.destination);
      if(cameraView.direction){
        if(!result.orientation){
          result.orientation = {};
        }
        result.orientation.direction = new Cesium.Cartesian3(...cameraView.direction)
      }
      if(cameraView.up){
        if(!result.orientation){
          result.orientation = {};
        }
        result.orientation.up = new Cesium.Cartesian3(...cameraView.up)
      }
      if(cameraView.heading){
        if(!result.orientation){
          result.orientation = {};
        }
        result.orientation.heading = Cesium.Math.toRadians(cameraView.heading)
      }
      if(cameraView.pitch){
        if(!result.orientation){
          result.orientation = {};
        }
        result.orientation.pitch = Cesium.Math.toRadians(cameraView.pitch)
      }
      if(cameraView.roll){
        if(!result.orientation){
          result.orientation = {};
        }
        result.orientation.roll = cameraView.roll;
      };
      return result;
    },
    initMap(item){
      let mapOption = {
        center: item.mapOption.center,
        maxZoom: item.mapOption.maxZoom,
        zoom: item.mapOption.zoom
      };
      if (item.mapOption.crs) {
        if(CrsMap[item.mapOption.crs]) {
          mapOption.crs = CrsMap[item.mapOption.crs];
        }else{
          mapOption.crs = L.CRS.NonEarthCRS({
            bounds: L.bounds(item.mapOption.bounds[0],item.mapOption.bounds[1]),
            origin: L.point(item.mapOption.origin[0],item.mapOption.origin[1])
          });
        }
      }
      map = L.map('floorMap',mapOption);
      restLayer = L.supermap.tiledMapLayer(item.restMapUrl).addTo(map);
    },
    changeLayer(item){
      map.removeLayer(restLayer);
      if(jsonLayer){
        map.removeLayer(jsonLayer);
      }
      if(item.mapOption.crs){
        if(CrsMap[item.mapOption.crs]) {
          map.options.crs = CrsMap[item.mapOption.crs];
        }else{
          map.options.crs = L.CRS.NonEarthCRS({
            bounds: L.bounds(item.mapOption.bounds[0],item.mapOption.bounds[1]),
            origin: L.point(item.mapOption.origin[0],item.mapOption.origin[1])
          });
        }
      }
      if(item.mapOption.maxZoom!=undefined){
        map.setMaxZoom(item.mapOption.maxZoom)
      }
      if(item.mapOption.zoom!=undefined){
        map.setZoom(item.mapOption.zoom)
      }
      if(item.mapOption.center){
        map.setView(L.latLng(...item.mapOption.center))
      }
      restLayer = L.supermap.tiledMapLayer(item.restMapUrl).addTo(map);
    }
  }
}
</script>
<style type="text/css" lang="scss" scoped>
#floorMap{
  width:400px;
  height:200px;
}
.mapContainer{
  position:absolute;
  bottom:20px;
  left:10px;
  z-index: 999;
  box-shadow: 0 1px 8px #85a1b9;
  .mapTitle{
    widows: 400px;
    height: 35px;
    line-height: 35px;
    background-color: #5099EA;
    text-align: center;
    position: relative;
    color: white;
    font-size: 12px;
    .close{
      position: absolute;
      right: 10px;
      top: 0px;
      font-size: 20px;
      color: white;
      cursor: pointer;
    }
  }
}
.floors{
  position: absolute;
  top:50%;
  transform: translateY(-50%);
  left:10px;
  width:auto;
  height:auto;
  z-index: 999;
  box-shadow: 0 1px 8px #85a1b9;
  .floor{
    width: 26px;
    height: 26px;
    color: #333;
    font-size: 12px;
    text-align: center;
    background: #fff;
    cursor: pointer;
    line-height: 26px;
    &:hover{
      color: #3385ff;
    }
  }
  .active{
    background: #3385ff;
    color: #fff;
  }
  .building{
    background-color: white;
    text-align: center;
    cursor: default;
    height: 22px;
    line-height: 22px;
    border-bottom: 1px solid grey;
    color: #5099ea;
  }
}

</style>


