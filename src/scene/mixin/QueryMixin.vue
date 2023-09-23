<template>
</template>
<script>
  import { mapState, mapMutations } from "vuex";
  import { ServiceConfig, DFC } from "@/config/app-config";
  import { serviceMgr } from "@/components/map/serviceMeta.js";
  import { toolTip } from "@/components/common/tooltip.js";
  import {transformByParams,} from "@/components/common/dfcUtil";
  const transformUrllonlatToPlane = ServiceConfig.httpproxy + "?url=" + DFC.transformForward,
    transformUrl = ServiceConfig.httpproxy + "?url=" + DFC.transformUrl,
    TransformConfig = APPCONFIG.TransformConfig;

  let handlerPolygonSearch = null
  export default {
    data(){
      return{
      }
    },
    computed: {
      ...mapState({
        cSpecialLayers: state => state.scene.cSpecialLayers,
        baseMapLayersGroup: state => state.map.baseMapLayersGroup,
      }),
      currentBaseMap() {
        return this.baseMapLayersGroup[0];
      },
    },
    mounted() {

    },
    created() {
      EventBus.$once('ViewerChanged', this.initHandler);
      EventBus.$on("showHighLightFeaturesOnMap", this.showHighLightFeaturesOnMap);
      EventBus.$on("switchQueryList", this.switchQueryList);
      EventBus.$on('toolbar-clearAll',this.clear);
      EventBus.$on('scene-rest-search',this.transformPolylineSearch)
    },
    beforeDestroy(){
      EventBus.$off("showHighLightFeaturesOnMap", this.showHighLightFeaturesOnMap);
      EventBus.$off("switchQueryList", this.switchQueryList);
      EventBus.$off('toolbar-clearAll',this.clear);
      EventBus.$off('scene-rest-search',this.transformPolylineSearch)
    },
    methods: {
      initHandler(){
        handlerPolygonSearch = new Cesium.DrawHandler(Viewer,Cesium.DrawMode.Polygon,0);
      },
      clear(){
        handlerPolygonSearch && handlerPolygonSearch.clear()
        Viewer.entities.removeAll()
      },
      // 绘制多边形查询，将绘制拿到的笛卡尔坐标转成经纬度
      polylineSearch() {
        if(!this.cSpecialLayers.length){
          this.$message.warning("请先叠加图层")
          return
        }
        this.canQuery = false;
        //let tooltip = toolTip.createTooltip(document.body);
        if (handlerPolygonSearch) {
          handlerPolygonSearch.clear();
        }
        //this.handlerPolygonSearch = new Cesium.DrawHandler(Viewer,Cesium.DrawMode.Polygon,0);
        let _this = this;
        handlerPolygonSearch.drawEvt.addEventListener(function(result) {
          let resultData = result.object.positions;
          let pointArr = [];
          resultData.forEach(function(val, index) {
            let ellipsoid = Viewer.scene.globe.ellipsoid;
            let xyz = new Cesium.Cartesian3(
              result.object.positions[index].x,
              result.object.positions[index].y,
              result.object.positions[index].z
            );
            let wgs84 = ellipsoid.cartesianToCartographic(xyz);
            let lng = Cesium.Math.toDegrees(wgs84.longitude);
            let lat = Cesium.Math.toDegrees(wgs84.latitude);
            pointArr.push({
              lng: lng,
              lat: lat
            });
          });
          _this.transformPolylineSearch(pointArr);
        });
        handlerPolygonSearch.activate();
      },
      // 将经纬度转成平面，并查询
      async transformPolylineSearch(pointArr, type) {
        this.canQuery = true;
        let self = this;
        if (this.currentBaseMap.isprojchange) {
          let temp = await transformByParams(
            transformUrllonlatToPlane,
            TransformConfig.TransformParams.lonlatToPlane,
            pointArr
          );
          if(!temp.data.resultInfo.data){
            this.$message.warning("坐标转换失败")
            return
          }
          let points = temp.data.resultInfo.data.points;
          let latlngs = [];
          points.forEach(function(val, index) {
            latlngs.push([val.y, val.x]);
          });
          pointArr = latlngs
        }
        let layer
        if(type === 'marker'){
          layer = L.marker(pointArr[0])
        }else{
          layer = L.polygon(pointArr);
        }
        let resultList = [];
        serviceMgr.getRestResult(
          layer,
          self.cSpecialLayers,
          null,null,{
        pageNum: 1,
        count:100000000
      },
          res => {
            if (res.recordsets && res.recordsets.length) {
              for (let i = 0; i < res.recordsets.length; i++) {
                if (
                  res.recordsets[i].features &&
                  res.recordsets[i].features.features
                ) {
                  resultList.push({
                    name: res.recordsets[i].captionName,
                    data: res.recordsets[i].features
                  });
                }
              }
              if(resultList.length){
                EventBus.$emit("show-query-list", resultList);
                self.showHighLightLayerOnMap(resultList);
              }else{
                this.$message.warning("查询结果为空");
              }
            }
          },
          function() {
            self.$message.warning("无可查询数据，请选择其它图层！");
          },
          function() {
            self.$message.warning("当前图层不是rest类型,无法获取数据！");
          },
          function() {
            self.$message.warning("当前未添加专题图层，无法进行查询");
          },
          function() {
            self.$message.warning("查询失败");
          }
        );
      },
      // 高亮查询到的图层
      showHighLightLayerOnMap(resultList) {
        var features = resultList[0].data.features;
        this.switchQueryList(features)
      },
      // 点击某一行的时候，高亮单个元素
      showHighLightFeaturesOnMap(features) {
        var type = features.geometry.type;
        if (type == "MultiPolygon") {
          this.showHighLightMultiPolygon([features]);
        } else if (type == "LineString" || type == "MultiLineString") {
          this.showHighLightMultiLineString([features]);
        } else if (type == "Point") {
          this.showHighLightMultiPoint([features]);
        }
      },
      async showHighLightMultiPolygon(features) {
        Viewer.entities.removeAll();

        features.forEach(async function(val, index) {
          var tempArr = [];
          val.geometry.coordinates[0][0].forEach(function(val2, index2) {
            tempArr.push({
              lng: val2[0],
              lat: val2[1]
            });
          });

          const { data } = await transformByParams(
            transformUrl,
            TransformConfig.TransformParams.planeToLonlat,
            tempArr
          );
          var points = data.resultInfo.data.points;
          var hierarchyData = [];
          points.forEach(function(point, key, arr) {
            var position = new Cesium.Cartesian3.fromDegrees(
              point.x,
              point.y,
              2971777
            );
            hierarchyData.push(
              new Cesium.Cartesian3(position.x, position.y, position.z)
            );
          });
          Viewer.entities.add({
            polygon: {
              hierarchy: {
                positions: hierarchyData,
                width: 3
              },
              material: Cesium.Color.AQUA.withAlpha(0.5),
              outline: true,
              outlineWidth: 2,
              outlineColor: Cesium.Color.BLACK
            }
          });
        });
      },
      showHighLightMultiLineString(features) {
        Viewer.entities.removeAll();

        features.forEach(async function(val, index) {
          var tempArr = [];
          val.geometry.coordinates.forEach(function(val2, index2) {
            tempArr.push({
              lng: val2[0],
              lat: val2[1]
            });
          });

          const { data } = await transformByParams(
            transformUrl,
            TransformConfig.TransformParams.planeToLonlat,
            tempArr
          );
          try {
            var points = data.resultInfo.data.points;
            points.forEach(function(va, inde) {
              if (inde < points.length - 1) {
                Viewer.entities.add({
                  corridor: {
                    positions: Cesium.Cartesian3.fromDegreesArray([
                      va.x,
                      va.y,
                      points[inde + 1].x,
                      points[inde + 1].y
                    ]),
                    width: 2,
                    material: Cesium.Color.RED
                  }
                });
              }
            });
          } catch (error) {}
        });
      },
      async showHighLightMultiPoint(features) {
        Viewer.entities.removeAll();
        var ponitsArr = [];
        features.forEach(async function(val, index) {
          ponitsArr.push({
            lng: val.geometry.coordinates[0],
            lat: val.geometry.coordinates[1]
          });
        });
        const { data } = await transformByParams(
          transformUrl,
          TransformConfig.TransformParams.planeToLonlat,
          ponitsArr
        );
        var points = data.resultInfo.data.points;
        points.forEach(function(va, inde) {
          Viewer.entities.add({
            position : Cesium.Cartesian3.fromDegrees(va.x,va.y),
            billboard :{
              image : './../static/img/location.png',
              heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND ,
              width:20,
              height:20
            }
          });
        });
      },
      switchQueryList(features){
        let type = features[0].geometry.type;
        if (type == "MultiPolygon") {
          this.showHighLightMultiPolygon(features);
        } else if (type == "LineString" || type == "MultiLineString"  ) {
          this.showHighLightMultiLineString(features);
        } else if (type == "Point") {
          this.showHighLightMultiPoint(features);
        }
      }
    }
  }
</script>
