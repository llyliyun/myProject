<template>
</template>

<script>
  import { mapState, mapMutations } from "vuex";
  import { ServiceConfig, DFC } from "@/config/app-config";
  import {apiTransGeojsonPrj} from '@/apis/api.js'
  import { serviceMgr } from "@/components/map/serviceMeta.js";
  const transformUrllonlatToPlane = ServiceConfig.httpproxy + "?url=" + DFC.transformForward,
    transformUrl = ServiceConfig.httpproxy + "?url=" + DFC.transformUrl,
    TransformConfig = APPCONFIG.TransformConfig;

  let handlerPolygonSearch = null

  export default {
    data() {
      return {
        canQuery: true
      }
    },
    mounted() {

    },
    computed: {
      ...mapState({
        cSpecialLayers: state => state.scene.cSpecialLayers,
        baseMapLayersGroup: state => state.map.baseMapLayersGroup,
      }),
      currentBaseMap() {
        return this.baseMapLayersGroup[0];
      },
      sceneLayers() {
        return this.cSpecialLayers.map(item => {
          let obj = JSON.parse(JSON.stringify(item));
          if (obj.prjTrans) {
            obj.url += '?prjCoordSys={"epsgCode":4326}'
          }
          return obj;
        })
      }
    },
    created() {
      EventBus.$on('toolbar-clearAll',this.clear);
      EventBus.$on('ViewerChanged', this.initHandler);
      EventBus.$on('toolbar-spatialquery', this.spatialquery);
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
      spatialquery() {
        if (!this.canQuery) {
          return
        }
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
        handlerPolygonSearch.drawEvt.addEventListener((result) => {
          handlerPolygonSearch.deactivate();
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
          this.canQuery = true;
          _this.transformPolylineSearch(pointArr);
        });
        handlerPolygonSearch.activate();
      },
      async transformPolylineSearch(pointArr) {
        let self = this;
        let polygon;
        if (this.currentBaseMap.isprojchange) {
          let temp = await transformByParams(
            transformUrllonlatToPlane,
            TransformConfig.TransformParams.lonlatToPlane,
            pointArr
          );
          let points = temp.data.resultInfo.data.points;
          let latlngs = [];
          points.forEach(function(val, index) {
            latlngs.push([val.y, val.x]);
          });
          polygon = L.polygon(points);
        }else {
          polygon = L.polygon(pointArr);
        }
        let resultList = [];

        serviceMgr.getRestResult(
          polygon,
          this.sceneLayers,
          null,null,{
        pageNum: 1,
        count:100000000
      },
          async res => {
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
                // this.showHighLightLayerOnMap(resultList);
                try {
                  let _restProject = self.sceneLayers[self.sceneLayers.length-1].restProject
                  if(_restProject.indexOf('4326') == -1 && _restProject.indexOf('4490') == -1){
                    let param = {
                      targetEpsgcode:APPCONFIG.targetEpsgcode,
                      method: '',
                      sourceProjectName: APPCONFIG.sourceProName,
                      geojson: JSON.stringify(resultList[0].data)
                    }
                    let result = await apiTransGeojsonPrj(param)
                    if(result.data.resultInfo.success){
                      if (callback) {
                        callback(result.data.resultInfo.data)
                      }
                      self.loadGeojsonData(result.data.resultInfo.data);
                    }else{
                      this.$message.error(result.data.resultInfo.message || "坐标转换失败")
                      return
                    }
                  }else{
                    if (callback) {
                      callback(resultList[0].data)
                    }
                    self.loadGeojsonData(resultList[0].data);
                  }
                } catch ( e ) {
                  console.error(e);
                }
                this.loadGeojsonData(resultList[0].data);
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
          }
        );
      },
      loadGeojsonData(geojson) {
        let promise = Cesium.GeoJsonDataSource.load(geojson);
        promise.then((datasource) => {
          Viewer.dataSources.add(datasource);
          var entities = datasource.entities.values;
          var colorHash = {};
          for (var i = 0; i < entities.length; i++) {
              var entity = entities[i];
              var name = entity.name;  //geojson里面必须得有一个name属性，entity.name对应
              var color = colorHash[name]; //可以使两个同名要素使用同一种颜色。。。
              if (!color) {
                  color = Cesium.Color.fromRandom({
                      alpha : 1.0
                  });
                  colorHash[name] = color;
              }
              // entity.polygon.material = color;
              entity.polygon.outline = true;
              // entity.polygon.extrudedHeight = Math.floor(Math.random()*40000+80000) //20000~60000的随机数，单位是米
              Viewer.zoomTo(promise);
          }
        })
      },
      // 高亮查询到的图层
      showHighLightLayerOnMap(resultList) {
        var features = resultList[0].data.features;
        this.switchQueryList(features)
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
              x: val2[0],
              y: val2[1]
            });
          });

          // const { data } = await transformByParams(
          //   transformUrl,
          //   TransformConfig.TransformParams.planeToLonlat,
          //   tempArr
          // );
          // var points = data.resultInfo.data.points;
          var hierarchyData = [];
          tempArr.forEach(function(point, key, arr) {
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
              x: val2[0],
              y: val2[1]
            });
          });

          // const { data } = await transformByParams(
          //   transformUrl,
          //   TransformConfig.TransformParams.planeToLonlat,
          //   tempArr
          // );
          try {
            // var points = data.resultInfo.data.points;
            tempArr.forEach(function(va, inde) {
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
            x: val.geometry.coordinates[0],
            y: val.geometry.coordinates[1]
          });
        });
        // const { data } = await transformByParams(
        //   transformUrl,
        //   TransformConfig.TransformParams.planeToLonlat,
        //   ponitsArr
        // );
        // var points = data.resultInfo.data.points;
        ponitsArr.forEach(function(va, inde) {
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
      
    }
  }
</script>