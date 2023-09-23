<template> </template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
import { apiServiceCatalogServiceByID, apiServiceOriginUrl } from "@/apis/api";
import { serviceMgr } from "@/components/map/serviceMeta.js";
import { sortServiceInfos } from "@/components/common/serviceUtil.js";
import { adaptSceneLayerUrl } from "@/components/common/sceneUtil.js";
import { getLayerSubdomains } from "../../common/mapUtil";
import { ServiceConfig, DFC } from "@/config/app-config";
import { transformByParams } from "@/components/common/dfcUtil.js";
let transformUrl = ServiceConfig.httpproxy + "?url=" + DFC.transformUrl,
  TransformConfig = APPCONFIG.TransformConfig;
let serType = [
  "SMVectorTile",
  "SMSCENELAYERS",
  "SMS3MLAYERS",
  "SMTERRAIN",
  "WMTS100",
  "SGSWMTS100",
  "SMRESTMAP",
  "WMS111",
  "WMS130",
  "SGSSFS110",
  "ArcGISREST",
  "REALTIME"
];
let SceneProxy = APPCONFIG.SceneProxy;

export default {
  data() {
    return {
      showSceneLayer: false,
      activeScene: {
        url: "",
        name: ""
      }
    };
  },
  created() {
    EventBus.$on("tree-sideBarCheck", this.onSideBarCheck); //添加图层
  },
  beforeDestroy() {
    EventBus.$off("tree-sideBarCheck", this.onSideBarCheck); //添加图层
  },
  computed: {
    ...mapState({
      baseMapLayersGroup: state => state.map.baseMapLayersGroup,
      cSpecialLayers: state => state.scene.cSpecialLayers,
      cShowLegend: state => state.scene.cShowLegend,
    }),
    currentBaseMap() {
      return this.baseMapLayersGroup[0];
    }
  },
  methods: {
    ...mapMutations(["cAddLayer", "cRemoveLayer", "storeLastMapPosition","cShowHideLegend"]),
    async onSideBarCheck(node, checked, indeterminate) {
      let self = this;
      if (checked) {
        const { data } = await apiServiceCatalogServiceByID(node.resID).catch(function(){
            self.$message.error("数据资源请求失败");
            return;
          });
        if (data.resultInfo.data.length > 0) {
          let resource = data.resultInfo.data;
          let originRes = [];
          for (let resou of resource) {
            originRes = originRes.concat(resou.serviceInfos);
          }
          let filterService = sortServiceInfos(originRes, serType);
          if (!filterService.length) {
            this.$message.error("当前资源无可叠加服务！");
            return;
          }
          let sevice = filterService[0];
          if (this.currentBaseMap.isprojchange) {
            let _service = filterService.find(item => {
              return (
                item.interfaceType && item.interfaceType.value === "SMRESTMAP"
              );
            });
            if (_service) sevice = _service;
          }
          let sermeta = await serviceMgr.getMetadata(
            sevice.id,
            this.userInfo.userkey
          );
          let splitArr = sermeta[0].url.split("\/"),
            serviceId = splitArr[splitArr.length - 2];

          if (
            sermeta[0].project.indexOf("4326") > -1 ||
            sermeta[0].project.indexOf("4490") > -1 ||
            sermeta[0].project.indexOf("3857") > -1
          ) {
            sermeta[0].prjTrans = false;
          } else {
            sermeta[0].prjTrans = true;
          }
          let restLayer = filterService.find(item => {
            return (
              item.interfaceType &&
              item.interfaceType.value === "SMRESTMAP" &&
              item.version === sevice.version
            );
          });
          const _findArcgisRest = filterService.find(item => item.interfaceType.value == 'ArcGISREST');
          sermeta[0].arcgisRestLayer = _findArcgisRest && _findArcgisRest.url + '/' + this.userInfo.userkey;
          sermeta[0].restLayer =
            restLayer && restLayer.url + "/" + this.userInfo.userkey;
          sermeta[0].resID = node.resID;
          sermeta[0].key = node.resID;
          sermeta[0].show = true;
          sermeta[0].visible = true;
          sermeta[0].focus = true;
          if (SceneProxy) {
            sermeta[0].url = adaptSceneLayerUrl(
              sermeta[0].url,
              sermeta[0].layerType,
              sermeta[0].layerName
            );
            getLayerSubdomains(sermeta[0]);
          } else {
            let serviceData = await apiServiceOriginUrl(serviceId);
            sermeta[0].url = serviceData.data.resultInfo.data;
          }
          if (node.autoLocation && sermeta[0].bounds) {
            //通过快速定位跳转进来，勾选同时需要进行快速定位操作
            let bounds;
            if (sermeta[0].prjTrans) {
              let temp = await transformByParams(
                transformUrl,
                TransformConfig.TransformParams.lonlatToPlane,
                [
                  {
                    lat: sermeta[0].bounds[0][0],
                    lng: sermeta[0].bounds[0][1]
                  },
                  {
                    lat: sermeta[0].bounds[1][0],
                    lng: sermeta[0].bounds[1][1]
                  }
                ]
              );
              if (temp.data.resultInfo.data) {
                const points = temp.data.resultInfo.data.points;
                bounds = [
                  [points[0].y, points[0].x],
                  [points[1].y, points[1].x]
                ];
              }
            } else {
              bounds = sermeta[0].bounds;
            }
            if (bounds)
              Viewer.camera.flyTo({
                destination: Cesium.Rectangle.fromDegrees(
                  bounds[0][1],
                  bounds[0][0],
                  bounds[1][1],
                  bounds[1][0]
                )
              });
          }
          if(!this.cShowLegend){
            //设置默认展开图例
            this.cShowHideLegend(true);
          }
          this.cAddLayer(sermeta[0]);
          if (sermeta[0].layerType == "SMSCENELAYERS") {
            this.activeScene.name = sermeta[0].name;
            this.activeScene.url = sermeta[0].url;
            this.showSceneLayer = true;
            setTimeout(() => {
              this.activeScene.url = "";
            }, 1);
          }
        }else if(data.resultInfo.data.length == 0){
            self.$message.warning("当前资源不存在，请重新收藏！");
            return;
          }
      } else {
        for (let i = 0; i < this.cSpecialLayers.length; i++) {
          if (node.resID == this.cSpecialLayers[i].resID) {
            if (this.cSpecialLayers[i].layerType == "SMSCENELAYERS") {
              this.activeScene.url = this.cSpecialLayers[i].url;
              setTimeout(() => {
                this.activeScene.url = "";
              }, 1);
            }
            this.cRemoveLayer(this.cSpecialLayers[i]);
          }
        }
      }
    }
  }
};
</script>
