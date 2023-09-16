// import L from 'leaflet'
// import '@supermap/iclient-leaflet';
import axios from 'axios'

const MAPRADIUS = 6371000; //默认地球半径

const convertMeterToRealLength = (meter, CRS) => {
  //平面坐标系无获取单位方法
  if (!CRS.projection.getUnits || CRS.projection.getUnits() == 'meter') {
    return meter;
  } else {
    //米转度
    return meter / (Math.PI * 2 * MAPRADIUS / 360);
  }
}

const convertLayerToBufferParams = (layer) => {
  let coords = layer._latlngs,
    params = '';

    if (layer instanceof L.Marker) {
      params = layer._latlng.lng + ',' + layer._latlng.lat;
    } else if (layer instanceof L.Polygon) {
      let firstPoint;
      coords.forEach((feature, featureIndex) => {
        // if (Array.isArray(feature)) {
        //   feature = feature[0];
        // }
        feature.forEach((item, itemIndex) => {
          if (featureIndex == 0 && itemIndex == 0) {
            firstPoint = item.lng + ',' + item.lat + ';';
          }
          if (Array.isArray(item)) {
            item.forEach((point) => {
              params += point.lng + ',' + point.lat + ';';
            })
            firstPoint = '';
          } else {
            params += item.lng + ',' + item.lat + ';';
          }
        })
      })
      params += firstPoint;
    } else if (layer instanceof L.Polyline) {
      coords.forEach((item) => {
        params += item.lng + ',' + item.lat + ';';
      })
    }

    return params.substring(0,params.length -1);
}

const convertBufferToLayer = (buffer, type) => {
  if (!buffer) {
    return null;
  }

  let pointArr = buffer.split(' '),
    coordsArr = [];
  pointArr.forEach((item) => {
    coordsArr.push([item.split(',')[1], item.split(',')[0]]);
  })
  return L.polygon(coordsArr);
}

const convertStrToLayer = (buffer, type) => {
  if (!buffer) {
    return null;
  }

  let pointArr = buffer.split(';'),
    coordsArr = [];
  pointArr.forEach((item) => {
    coordsArr.push([item.split(',')[1], item.split(',')[0]]);
  })
  return L.polygon(coordsArr);
}

/**
 * @param  {url} dfc基于参数的坐标转换接口
 * @param  {transformParams} 坐标转换参数
 * @param  {coords} [L.LatLng]
 * @return {[type]}
 */
const transformByParams = (url, transformParams, coords) => {
  let data,
    strs = '';
  if (!coords) {
    return null
  }
  if (coords instanceof L.LatLng) {
    strs = coords.lng + ',' + coords.lat;
  } else {
    coords.forEach((item, index) => {
      strs += item.lng + ',' + item.lat;
      if (index < coords.length -1) {
        strs += ';';
      }
    })
  }

  data = {
    prjCoordSysInfo: transformParams,
    points: strs
  }
  return axios({
    method: 'post',
    url: url,
    data: JSON.stringify(data)
  })
}

const transfromByUrl = (url, coords) => {
  let data,
    strs = '';
  if (!coords) {
    return null
  }
  if (coords instanceof L.LatLng) {
    strs = coords.lng + ',' + coords.lat;
  } else {
    coords.forEach((item, index) => {
      strs += item.lng + ',' + item.lat;
      if (index < coords.length -1) {
        strs += ';';
      }
    })
  }

  //TODO基于配置文件转换
  return new Promise((resolve) => {

  })
}


const measureRingArea = (coords,crscode) => {
  var rad = function rad(_) {
      return _ * Math.PI / 180;
  };
  var area = 0;
  if(coords.length < 3) return 0.0;

  //if(crscode == 0 || crscode == -1000 || crscode == -1){
  if(!SgsMap.options.crs.projection.getUnits){//进行平面坐标系计算
    var point_num = coords.length;
    var s = coords[0].lng * (coords[point_num-1].lat - coords[1].lat);
    for(var i = 1; i < point_num; ++i)
        s += coords[i].lng * (coords[i-1].lat - coords[(i+1)%point_num].lat);
    return Math.abs(s/2.0);
  } else {
    var p1, p2, p3, lowerIndex, middleIndex, upperIndex,
    area = 0,
    coordsLength = coords.length;

    if (coordsLength > 2) {
      for (var i = 0; i < coordsLength; i++) {
        if (i === coordsLength - 2) {// i = N-2
            lowerIndex = coordsLength - 2;
            middleIndex = coordsLength -1;
            upperIndex = 0;
        } else if (i === coordsLength - 1) {// i = N-1
            lowerIndex = coordsLength - 1;
            middleIndex = 0;
            upperIndex = 1;
        } else { // i = 0 to N-3
            lowerIndex = i;
            middleIndex = i+1;
            upperIndex = i+2;
        }
        p1 = coords[lowerIndex];
        p2 = coords[middleIndex];
        p3 = coords[upperIndex];
        area += ( rad(p3.lng) - rad(p1.lng) ) * Math.sin( rad(p2.lat));
      }
      area = area * MAPRADIUS * MAPRADIUS / 2;
    }
    return Math.abs(area);
  }
}

//米转亩
const transAreaUnitToMu = (area) => {
  let afterArea = {
    area:area,
    unit:"平方米"
  };
  if(!isNaN(area)){
    if(area > 10000){
      afterArea.area = area/666.6666667;
      afterArea.unit = "亩"
    }
  }
  return afterArea
}

//面积、长度结果换算
const unitTran = (area, unit) => {
  area = Number(area)
  if(!area){
    return 0
  }
  let result = 0
  switch(unit){
    case '亩':result = area/666.6666667
      break;
    case '公顷':result = area/10000
      break;
    case '万亩':result = area/6666666.667
      break;
    case '千米':result = area/1000
      break;
    case '英里':result = area/1609.344
      break;
    default:result = area
  }
  return parseFloat(result.toFixed(4))
}

export {
  convertBufferToLayer,
  convertLayerToBufferParams,
  transformByParams,
  getBufferByLayer,
  convertMeterToRealLength,
  convertStrToLayer,
  measureRingArea,
  transAreaUnitToMu,
  unitTran,
}
