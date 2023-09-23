<template>
  <div style="width: 100%;height: 100%;">
    <cesium-scene>
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
    </cesium-scene>
    <mvt-query-popup></mvt-query-popup>
    <scene-layer
      v-show="showSceneLayer"
      :scene="activeScene"
      @hide-layer="showSceneLayer = false"
    ></scene-layer>
    <location-tip></location-tip>
    <coord-location></coord-location>
    <slot name="default"></slot>
  </div>
</template>

<script>
import { Loading } from "element-ui";
import { ServiceConfig } from "@/config/app-config";
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
import CesiumScene from "./CesiumScene";
// import ResourceTreeMixin from "./mixin/ResourceTreeMixin";
// import MvtQueryPopup from "./childrens/MvtQueryPopup";
// import SceneRestQueryMixin from "./mixin/SceneRestQueryMixin";
// import SceneLayer from "@/components/scene/childrens/SceneLayer";
// import LocationTip from "./locationTip/Index";
// import CoordLocation from "./locationTip/CoordLocation";

import { mapState, mapMutations, mapActions } from "vuex";
// import { convertCartesianToLonlat } from "@/components/common/sceneUtil";

export default {
  // mixins: [ResourceTreeMixin, SceneRestQueryMixin],
  components: {
    CesiumScene,
    CRestTilelayer,
    CWmsImageryprovider,
    CWmtsImageryprovider,
    S3MLayer,
    SingleScene,
    CesiumTerrain,
    CsmVectorTilelayer,
    LEsriImageryProvider,
    // MvtQueryPopup,
    // SceneLayer,
    // LocationTip,
    // CoordLocation
  },
  data() {
    return {
      show: false,
      // 添加
      isNewCesiumLib: APPCONFIG.NewCesiumLib,
      cesiumLayerCount: 0
    };
  },
  mounted() {
    EventBus.$on("beforeBaseMapChange", this.beforeBaseMapChange);
    EventBus.$on("layersChanged", this.loadLayerCount);
    this.changeMapMode("3d");
    this.initEvent();
  },
  computed: {
    ...mapState({
      baseMapLayersGroup: state => state.map.baseMapLayersGroup,
      cSpecialLayers: state => state.scene.cSpecialLayers,
      userInfo: state => state.user.userInfo,
      lastMapPosition: state => state.map.lastMapPosition
    }),
    currentBaseMap() {
      return this.baseMapLayersGroup[0];
    }
  },
  beforeDestroy() {
    this.offEvent();
    this.cChangeSpecialLayer({ specialLayers: [] });
    EventBus.$off("beforeBaseMapChange", this.beforeBaseMapChange);
    EventBus.$off("layersChanged", this.loadLayerCount);
  },
  methods: {
    ...mapMutations([
      "changeMapMode",
      "changeCurrentBaseMapIndex",
      "storeLastMapPosition",
      "cChangeSpecialLayer"
    ]),
    loadLayerCount() {
      this.cesiumLayerCount = Viewer.imageryLayers._layers.length;
      this.setLastMapBounds();
    },
    beforeBaseMapChange() {
      alert(123)
      let position = convertCartesianToLonlat(Viewer.camera.position);
      Viewer.scene.camera.setView({
        orientation: {
          pitch: Cesium.Math.toRadians(-90),
          roll: Cesium.Math.toRadians(0)
        }
      });
      this.storeLastMapPosition({
        mapMode: "3d",
        center: [position.lat, position.lon],
        needConvert: !!this.currentBaseMap.projection,
        bounds: JSON.parse(JSON.stringify(Viewer.camera.computeViewRectangle()))
      });
      this.cChangeSpecialLayer({ specialLayers: [] });
      EventBus.$emit("pritree-removeAll");
    },
    setLastMapBounds() {
      let result = null;
      if (this.lastMapPosition && this.lastMapPosition.mapMode === "2d") {
        //上一个场景是二维
        const bounds = this.lastMapPosition.bounds;
        Viewer.camera.flyTo({
          destination: Cesium.Rectangle.fromDegrees(
            bounds._southWest.lng,
            bounds._southWest.lat,
            bounds._northEast.lng,
            bounds._northEast.lat
          )
        });
      }
    }
  }
};
</script>

<style lang="scss" scope></style>
