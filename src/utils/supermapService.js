// import L from 'leaflet';
// import '@supermap/iclient-leaflet';
// import {ServiceConfig} from "@/config/quotamanager-config.js"
// import {measureRingArea} from "@/utils/dfcUtil"

let LayerInfoCacheMap = {}; //layerInfo缓存
/**
 * 数据集-数据集、数据集-空间对象叠加分析
 * @param option
 * @returns {Promise}
 */
export const smRestAnalyisFindGeometry = (option) => {
  return new Promise((resolve,reject) => {
    L.supermap.spatialAnalystService(option.url).overlayAnalysis(option.params, (result) => {
      result = transformIServerData(result);
      resolve(result);
    }, "ISERVER");
  })
}
export const smQueryLayerInfo = function(url){
  return new Promise((resolve, reject) => {
    if (LayerInfoCacheMap[url]) {
      resolve(LayerInfoCacheMap[url]);
    } else {
      L.supermap.layerInfoService(url).getLayersInfo((result) => {
        LayerInfoCacheMap[url] = result;
        resolve(result);
      })
    }
  })
};
function transformIServerData (result) {
  if(!result.error) result = result.result;
  if(result.resultGeometry && result.resultGeometry.points.length){
    result.resultGeometry = JSON.parse(new SuperMap.Format.GeoJSON().write(result.resultGeometry))
  }
  if(result && result.recordset){
    result.recordsets = [result.recordset]
    delete result.recordset
  }
  if (result && result.recordsets && result.recordsets.length) {
    let geoJSONFormat = new SuperMap.Format.GeoJSON();
    for (let i = 0;i < result.recordsets.length; i++) {
      let features = [],fea, datasetType;
      if (result.recordsets[i].features && result.recordsets[i].features.length) {
        datasetType = result.recordsets[i].features[0].geometry.type
        fea = result.recordsets[i].features;
        fea.forEach((feature) => {
          if (feature.geometry.type != "REGION3D" &&  feature.geometry.type != "GEOMODEL") {
            //重设feature的key，防止转换之后属性中出现多余字段
            features.push({
              fieldNames: result.recordsets[i].fieldCaptions,
              fieldValues: feature.fieldValues,
              geometry: feature.geometry
            })
          }
        })
      }
      if(features && features.length){
        // if(features[0].geometry.type === "REGION"){
        //   for (let i = 0;i < features.length; i++) {
        //     let area = parseArea(features[i])
        //     if(area){
        //       let _index = features[i].fieldNames.findIndex((item) => {return item === "SmArea" || item === "SMAREA"})
        //       features[i].fieldValues[_index] = area
        //     }
        //   }
        // }
        result.recordsets[i].features = JSON.parse(geoJSONFormat.write(features));
        result.recordsets[i].datasetType = datasetType
      }
    }
  }
  return result
}