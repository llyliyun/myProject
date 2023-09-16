// import {
//   apiServiceMetadata,
//   apiWMTSCapality
// } from '@/apis/map-api'
import $ from 'jquery'
import Vue from 'vue'
import {
  // smRestMapFindByGeometry,
  // smRestMapFindByDistance,
  smQueryLayerInfo,
  // smRestMapFindBySql,
  smRestAnalyisFindGeometry
} from './supermapService'
// import {
//   ServiceConfig
// } from "@/config/app-config.js"

const RestQueryProvider = {
  // SQL: smRestMapFindBySql,
  // Geometry: smRestMapFindByGeometry,
  // Distance: smRestMapFindByDistance
}

export const serviceMgr = {
  getLegend(url, callback) {
    let legend = [];
    smQueryLayerInfo(`${ServiceConfig.httpproxy}?url=${url}`).then((data) => {
      if (data.result) {
        if (data.result.subLayers) {
          var mapname = data.result.name;
          for (var j = 0; j < data.result.subLayers.layers.length; j++) {
            var layer = data.result.subLayers.layers[j];
            var resourcetype = layer.datasetInfo.type;
            if (layer && layer.visible) {
              if (layer.ugcLayerType == "THEME") {
                if (layer.theme.items) {
                  for (var m = 0; m < layer.theme.items.length; m++) {
                    var item = layer.theme.items[m];
                    var style = item.style;
                    //获取图例
                    var imgsrc = getSymbolByStyle(url, style, resourcetype);
                    var caption = item.caption;
                    var le = {
                      caption: caption,
                      imgurl: imgsrc
                    }
                    legend[m] = le;
                  }
                }
                //获取标签图例
                if (layer.theme.type == "LABEL") {
                  var legendname = layer.name;
                  legendname = legendname.replace("#", ".");
                  var imgsrc = url + "/layers/" + legendname + "@@" + mapname + "/legend";
                  var caption = layer.caption;
                  var le = {
                    caption: caption,
                    imgurl: imgsrc
                  }
                  legend[legend.length] = le;
                }
              } else {
                var legendname = layer.name;
                legendname = legendname.replace("#", ".");
                //判断图层样式是否为null
                if (layer.caption == "行政区划") {} else {
                  //获取图例
                  var imgsrc = getSymbolByStyle(url, layer.style, resourcetype);
                  var caption = layer.caption;
                  var le = {
                    caption: caption,
                    imgurl: imgsrc
                  }
                  legend[legend.length] = le;
                }

              }
            }

          }
          callback(legend)
        }
      }
    })
  },
  getFeatureByRestMap({ url= '', queryParams = '', noFilter = false , type = 'SQL', options = {}}) {
    let captionMap = {}, subLayers = [];
    if (url.indexOf('httpproxy.jsp') == -1) {
      url = ServiceConfig.httpproxy+ "?url="+ url;
    }
    return new Promise(async (resolve, reject) => {
      RestQueryProvider[type]({
        url: url,
        options: options
      }).then((res) => {
        resolve(res);
      })
    })
  },

  getAnalysisRestResult(layer,options) {
    let captionMap = {};
    return new Promise(async (resolve, reject) => {
      //let serviceurl = ServiceConfig.httpproxy+ "?url="+ layer.url;
      let serviceurl = layer.url;
      let subLayers = [];
      let splitLayerIndex = this.filteLayerName(layer.layerName);
      smQueryLayerInfo(serviceurl).then((data) => {
        if (data.result) {
          if (data.result.subLayers) {
            let paramNames = [];
            let baseLayer = data.result.subLayers.layers[data.result.subLayers.layers.length-1];
            let aLayer = baseLayer.name.substring(baseLayer.name.indexOf('@'));
            let bLayer = aLayer.indexOf('#')>-1 ? aLayer.substring(0,aLayer.indexOf('#')) : aLayer;
            let layerName = baseLayer.datasetInfo.name + bLayer;
            options.sourceDataset = layerName
            let datasetOverlayAnalystParameters = new SuperMap.DatasetOverlayAnalystParameters(options);
            smRestAnalyisFindGeometry({
              url: layer.analysisRestUrl || APPCONFIG.AnalysisRestUrl,
              params: datasetOverlayAnalystParameters
            }).then((res) => {
              if(res && res.recordsets){
                res.recordsets.forEach((recordset) => {
                  recordset.datasetName = layerName
                })
              }
              resolve(res);
            })
          }
        }
      })
    })
  },

  //TODO rest查询方法需重构，与getRestResult基本一致， 可把url作为参数传递进来
  getAllRestResult(layer,layerGeo) {
    let captionMap = {};
    return new Promise(async (resolve, reject) => {
      let serviceurl = ServiceConfig.httpproxy+ "?url="+ layer.url;  //layer.url; //
      let subLayers = [];
      let splitLayerIndex = this.filteLayerName(layer.layerName);
      smQueryLayerInfo(serviceurl).then((data) => {
        if (data.result) {
          if (data.result.subLayers) {
            let paramNames = [];
            for (let j = 0; j < data.result.subLayers.layers.length; j++) {
              let subLayer = data.result.subLayers.layers[j];
              if (subLayer.visible && subLayer.queryable && !(subLayer.datasetInfo.type == "TEXT") && subLayer.datasetInfo.name.indexOf('注记') == -1) {
                if (!splitLayerIndex.length || splitLayerIndex.indexOf(j) > -1) {
                  captionMap[subLayer.name] = {
                    caption: subLayer.caption,
                    datasourceName: subLayer.datasetInfo.dataSourceName,
                    datasetName: subLayer.datasetInfo.name
                  };
                  let layerParam  = {
                    name: subLayer.name
                  }
                  if (subLayer.displayFilter) {
                    layerParam.attributeFilter = subLayer.displayFilter;
                  }
                  paramNames.push(layerParam);
                }
              }
            };
            if (!paramNames || !paramNames.length) {
              resolve([]);
              return;
            }
            let _paramNamesArr=[];
            for(var i=0;i<paramNames.length;i++){
              let fa = _paramNamesArr.filter(function(item){
                return item.name.indexOf(paramNames[i].name) !== -1 || paramNames[i].name.indexOf(item.name) !== -1
              })
              if(!fa.length){
                _paramNamesArr.push(paramNames[i])
              }
            }
            smRestMapFindByGeometry({
              url: serviceurl,
              name: _paramNamesArr,
              options: {
                geometry: layerGeo,
                expectCount: APPCONFIG.geoSearchCount
              }
            }).then((res) => {
              if (res && res.recordsets) {
                //设置tab标题为图层别名
                res.recordsets.forEach(item => {
                   let features = item.features.features;
                  if (features && features.length) {
                    let sourceProps = {
                      fields: item.fields,
                      fieldTypes: item.fieldTypes,
                      fieldCaptions: item.fieldCaptions,
                      name: item.datasetName,
                      url: serviceurl,
                      layer: layer
                    }
                    features.forEach((item) => {
                      item.sourceProps = sourceProps
                    })
                  }
                  //设置tab标题为图层别名
                  if (captionMap[item.datasetName] && captionMap[item.datasetName].caption) {
                    item.captionName = captionMap[item.datasetName].caption;
                  }
                })
              }
              resolve(res);
            })
          }
        }
      })
    })
  },
  async getRestResult(layer, layers, layerType, distance, succ, f1, f2, f3) {
    let params = {};
    let queryName = [];
    let captionMap = {};
    let speciallayersgroup = layers;
    if (speciallayersgroup.length > 0) {
      let toplayer = speciallayersgroup[speciallayersgroup.length - 1];
      let _url = toplayer.layerType === 'SMRESTMAP' ? toplayer.url : toplayer.restLayer
      let serviceurl = ServiceConfig.httpproxy+ "?url="+ _url;
      if (serviceurl.indexOf("rest") > -1) {
        let subLayers = [];
        let data = await smQueryLayerInfo(serviceurl);
        if (data.result) {
          if (data.result.subLayers) {
            let getDataSet = [];
            let filterArrIndex = this.filteLayerName(toplayer.layerName);
            for (let j = 0; j < data.result.subLayers.layers.length; j++) {
              let subLayer = data.result.subLayers.layers[j];
              if ((subLayer.visible || subLayer.caption.indexOf('#') == -1) && subLayer.queryable && !(subLayer.datasetInfo.type == "TEXT")
                && subLayer.datasetInfo.name.indexOf('注记') == -1) {
                let paramData = subLayer.name;
                if (!filterArrIndex.length || filterArrIndex.indexOf(j) > -1) {
                  captionMap[subLayer.name] = {
                    caption: subLayer.caption,
                    datasourceName: subLayer.datasetInfo.dataSourceName,
                    datasetName: subLayer.datasetInfo.name
                  };
                  let layerParam  = {
                    name: paramData
                  }
                  if (subLayer.displayFilter) {
                    layerParam.attributeFilter = subLayer.displayFilter;
                  }
                  getDataSet.push(layerParam);
                }
              }
            };
            if (!getDataSet || !getDataSet.length) {
              f1();
              return;
            }
            let _getDataSetArr=[];
            for(var i=0;i<getDataSet.length;i++){
              let fa = _getDataSetArr.filter(function(item){
                return item.name.indexOf(getDataSet[i].name) !== -1 || getDataSet[i].name.indexOf(item.name) !== -1
              })
              if(!fa.length){
                _getDataSetArr.push(getDataSet[i])
              }
            }
            let res = {}
            if(layerType === 'marker' && distance){
              res = await smRestMapFindByDistance({
                url: serviceurl,
                name: _getDataSetArr,
                options: {
                  geometry: layer,
                  distance: distance,
                  expectCount: APPCONFIG.geoSearchCount
                }
              })
            }else{
              res = await smRestMapFindByGeometry({
                url: serviceurl,
                name: _getDataSetArr,
                options: {
                  geometry: layer,
                  expectCount: APPCONFIG.geoSearchCount
                }
              })
            }
            if (res && res.recordsets) {
              res.recordsets.forEach(item => {
                let features = item.features.features;
                if (features && features.length) {
                  let sourceProps = {
                    fields: item.fields,
                    fieldTypes: item.fieldTypes,
                    fieldCaptions: item.fieldCaptions,
                    name: item.datasetName,
                    url: serviceurl,
                    layer: toplayer
                  }
                  features.forEach((item) => {
                    item.sourceProps = sourceProps
                  })
                }
                //设置tab标题为图层别名
                if (captionMap[item.datasetName] && captionMap[item.datasetName].caption) {
                  item.captionName = captionMap[item.datasetName].caption;
                }
              })
            }
            succ(res)
          }
        }
      } else {
        f2();
      }

    } else {
      f3();
    }
  },
  filteLayerName(layerName) {
     if (!layerName) {
      return [];
    }
    let filterArr = [],
      splitArray = layerName.split(',');
    if(splitArray.length > 1)
    filterArr = splitArray.map(item => {
      return +item.split(':')[1];
    })
    return filterArr;
  },
  getMetadata(serviceId, userKey) {
    userKey = userKey || '886e60bb7e014f22a707de23e6f6505d';
    return new Promise(async (resolve, reject) => {
      if (!serviceId) {
        return;
      }
      let layers = [];
      let bounds = [];
      const metaRes = await apiServiceMetadata(serviceId);
      let $meta = $(metaRes.data);
      let metaXml = {
        url: $meta.find("item[id='meta_surl']").attr("value") + '/' + userKey,
        sname: $meta.find("item[id='meta_sname']").attr("value"),
        layerName: $meta.find("item[id='meta_slayername']").attr("value"),
        center_x: $meta.find("item[id='center_x']").attr("value"),
        center_y: $meta.find("item[id='center_y']").attr("value"),
        maxLeft: $meta.find("item[id='bounds_left']").attr("value"),
        maxTop: $meta.find("item[id='bounds_top']").attr("value"),
        maxRight: $meta.find("item[id='bounds_right']").attr("value"),
        maxBottom: $meta.find("item[id='bounds_bottom']").attr("value"),
        projections: $meta.find("item[id='prjcoordsyscode']").attr("value"),
        serviceInterfaceType: $meta.find("item[id='meta_interface']").attr("value"),
        datasetName: $meta.find("item[id='meta_sdatasetname']").attr("value"),
        dataSetType: $meta.find("item[id='meta_sdatasettype']").attr("code"),
        dataSetTypeValue: $meta.find("item[id='meta_sdatasettype']").attr("value"),
        senceName: $meta.find("item[id='meta_sscenename']").attr("value"),
        meta_sdept: $meta.find("item[id='meta_sdept']").attr("value"),  //所属部门
        meta_rdate: $meta.find("item[id='meta_rdate']").attr("value"),  //资源创建时间
        meta_range: $meta.find("item[id='meta_range']").attr("value"),  //资源描述
        update_cycle: $meta.find("item[id='update_cycle']").attr("value"),  //更新周期
      }
      let crs = metaXml.projections == 'EPSG:3857' ? L.CRS.EPSG3857 : L.CRS.EPSG4326;
      let customCrs = null;
      //地图的默认zoom大小
      let zoom = 8;
      let center;
      let options = {};
      if (metaXml.serviceInterfaceType && metaXml.serviceInterfaceType.indexOf('WMS') > -1) {
        var layerIDArray = metaXml.layerName.split(",");
        if (layerIDArray.length > 1) {
          layerIDArray.sort(rank());
          //将数组进行排序
          metaXml.layerName = layerIDArray.toString();
        }
        options = {
          layers: metaXml.layerName
        }
        bounds = [
          [metaXml.maxTop, metaXml.maxLeft],
          [metaXml.maxBottom, metaXml.maxRight]
        ];
      } else if (metaXml.serviceInterfaceType.indexOf('SFS') > -1) {
        var layerIDArray = metaXml.layerName.split(",");
        var layerIndex = layerIDArray[0].split(":")[0];
        var layerNum = layerIDArray[0].split(":")[1];
        metaXml.layerName = "[" + layerIndex + ":";
        for (var i = 0; i < layerIDArray.length; i++) {
          if (layerIndex == layerIDArray[i].split(":")[0]) {
            metaXml.layerName = metaXml.layerName + i + ",";
          }
        }
        bounds = [
          [metaXml.maxTop, metaXml.maxLeft],
          [metaXml.maxBottom, metaXml.maxRight]
        ];
        metaXml.url = ServiceConfig.httpproxy+ "?url="+  metaXml.url;
      } else if (metaXml.serviceInterfaceType.indexOf('WMTS') > -1) {

        const capalityRes = await apiWMTSCapality({
          url: metaXml.url
        });
        let capality = capalityRes.data.resultInfo.data[0];
        let filterArr = capality.tileMatrixSets.filter((item) => {
          return item.identifier == metaXml.layerName;
        })
        //解决wmts服务无layerName导致filterArr为空， 默认取第一个tileMatrixSets
        if (!filterArr.length && capality.tileMatrixSets.length) {
          filterArr = capality.tileMatrixSets;
        }
        if (filterArr.length) {
          let scales = filterArr[0].scales;
          let resolutions = filterArr[0].resolutions || [];
          let matrixIds = [];
          if (filterArr[0].tdtIdentifier) {
            //天地图zoom设置为2
            zoom = 2;
          }
          if (resolutions.length) {
            resolutions.forEach((item, index) => {
              resolutions[index] = Number(resolutions[index]);
            })
          }
          let spatialInfo = filterArr[0].spatialInfo;

          center = [Number(spatialInfo.centerPoint.y), Number(spatialInfo.centerPoint.x)]
          options = {
            layer: capality.identify,
            tilematrixSet: metaXml.layerName,
            style: 'default',
            format: filterArr[0].imageFormat,
            resolutions: resolutions,
            scales: capality.tileMatrixSets[0].scales,
            identifier: capality.tileMatrixSets[0].tdtIdentifier
          };
        }
        bounds = [
          [metaXml.maxTop, metaXml.maxLeft],
          [metaXml.maxBottom, metaXml.maxRight]
        ];
      } else if (metaXml.serviceInterfaceType.indexOf('REST') > -1) {
          bounds = [
            [metaXml.maxTop, metaXml.maxLeft],
            [metaXml.maxBottom, metaXml.maxRight]
          ];
          center = [metaXml.center_x,metaXml.center_y];
      } else if (metaXml.serviceInterfaceType.indexOf('REALTIME') > -1) {
        metaXml.legend = [{
          imgurl:'./static/img/marker/realtimeMarker/normal.png',
          caption:'正常'
        },{
          imgurl:'./static/img/marker/realtimeMarker/error.png',
          caption:'异常'
        },]
      }
      // this.mapOptions = { crs: customCrs || crs, zoom }
      layers = [{
        url: metaXml.url,
        layerType: metaXml.serviceInterfaceType,
        layerName: metaXml.layerName, //图层名称
        name: metaXml.sname,
        legend: metaXml.legend ? metaXml.legend : [],
        opacity: 1,
        project: metaXml.projections,
        options: options,
        bounds: bounds,
        center: center
      }];
      if (layers.length > 0) {
        resolve(layers);
      } else {
        reject(layers)
      }
    })

  }

}

function getSymbolByStyle(url, style, resourcetype) {
  if (resourcetype == "REGION") {
    resourcetype = "SYMBOLFILL";
  } else if (resourcetype == "POINT") {
    resourcetype = "SYMBOLMARKER";
  } else if (resourcetype == "LINE") {
    resourcetype = "SYMBOLLINE";
  }
  var styleParams = JSON.stringify(style);
  var imageUrl = url + "/symbol.png?resourceType=" + resourcetype + "&style=" + encodeURI(styleParams) + "&picWidth=30&picHeight=20";
  return imageUrl;
}

function rank() {
  return function(obj1, obj2) {
    var val1 = obj1;
    var val2 = obj2;
    if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
      val1 = Number(val1);
      val2 = Number(val2);
    }
    if (val1 < val2) {
      return 1;
    } else if (val1 > val2) {
      return -1;
    } else {
      return 0;
    }
  };
}
