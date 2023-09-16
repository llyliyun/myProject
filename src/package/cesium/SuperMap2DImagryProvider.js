import $ from 'jquery'
import axios from 'axios'

export const SuperMap2DImagryProvider = (viewer, url, options) => {
  return new Promise((resolve, reject) => {
    this.layerProvider = ''
    this.options = options || {}
    this.prjCoordSys = options.prjCoordSys || undefined
    this.scales84 = [3.38032714321E-9, 6.76065428641E-9, 1.352130857282E-8, 2.704261714564E-8, 5.408523429128E-8, 1.0817046858257E-7, 2.1634093716514E-7, 4.3268187433028E-7, 8.6536374866056E-7, 1.73072749732112E-6, 3.46145499464224E-6, 6.92290998928448E-6, 1.3845819978568952E-5, 2.7691639957137904E-5, 5.538327991427581E-5, 1.1076655982855162E-4, 2.2153311965710323E-4, 4.4306623931420646E-4, 8.861324786284129E-4, 0.0017722649572568258, 0.0035445299145136517, 0.007089059829027303]
    this.scalesweb = [1.69016357160E-9, 3.38032714321E-9, 6.76065428641E-9, 1.352130857282E-8, 2.704261714564E-8, 5.408523429128E-8, 1.0817046858257E-7, 2.1634093716514E-7, 4.3268187433028E-7, 8.6536374866056E-7, 1.73072749732112E-6, 3.46145499464224E-6, 6.92290998928448E-6, 1.3845819978568952E-5, 2.7691639957137904E-5, 5.538327991427581E-5, 1.1076655982855162E-4, 2.2153311965710323E-4, 4.4306623931420646E-4, 8.861324786284129E-4, 0.0017722649572568258, 0.0035445299145136517, 0.007089059829027303]
    var _that = this
    $.ajax({
      async:false,
      ype: "get",
      url: url + '.json',
      success: function(result) {
        var name = _that.options.name || result.name;
        //var rectangle = Cesium.Rectangle.fromDegrees(result.bounds.left, result.bounds.bottom, result.bounds.right, result.bounds.top)
        var rectangle = Cesium.Rectangle.fromDegrees(-180, -90, 180, 90)
        //var epsgcode = result.prjCoordSys.epsgCode
        var epsgcode = _that.prjCoordSys
        var tilingScheme = ''
        var minlevel = 0
        var maxlevel = 22
        var originx = 0
        var originy = 0
        if(epsgcode === 4326) {
          tilingScheme = new Cesium.GeographicTilingScheme({
            numberOfLevelZeroTilesX: 2,
            numberOfLevelZeroTilesY: 1
          })
          originx = -180
          originy = 90
          if(_that.options.minimumLevel !== undefined) {
            minlevel = _that.options.minimumLevel
          } else {
            minlevel = compareLevel(result.visibleScales[0], _that.scales84)
          }
          if(_that.options.maximumLevel !== undefined) {
            maxlevel = _that.options.maximumLevel
          } else {
            maxlevel = compareLevel(result.visibleScales[result.visibleScales.length - 1], _that.scales84)
          }
        }
        if(epsgcode === 3857) {
          tilingScheme = new Cesium.WebMercatorTilingScheme()
          originx = -20037508.34
          originy = 20037508.34
          if(_that.options.minimumLevel !== undefined) {
            minlevel = _that.options.minimumLevel
          } else {
            minlevel = compareLevel(result.visibleScales[0], _that.scalesweb)
          }
          if(_that.options.maximumLevel !== undefined) {
            maxlevel = _that.options.maximumLevel
          } else {
            maxlevel = compareLevel(result.visibleScales[result.visibleScales.length - 1], _that.scalesweb)
          }
        }
        _that.layerProvider = new Cesium.UrlTemplateImageryProvider({
          url: url + "/tileImage.png?transparent=true&cacheEnabled=true&width=256&height=256&x={x}&y={y}&scale={scale}&redirect=false&overlapDisplayed=false&origin={'x':" + originx + ",'y':" + originy + "}" + "&prjCoordSys={'epsgCode':" + epsgcode + "}",
          rectangle: rectangle,
          minimumLevel: minlevel || 0,
          maximumLevel: maxlevel || 21,
          tilingScheme: tilingScheme,
          customTags: {
            scale: function(imageryProvider, x, y, level) {
              if(epsgcode === 4326) {
                return _that.scales84[level]
              }
              if(epsgcode === 3857) {
                return _that.scalesweb[level]
              }
            }
          }
        });
        var layer = viewer.imageryLayers.addImageryProvider(_that.layerProvider);
        resolve(layer);
      },
      error: function(msg) {
        console.log(msg);
      }
    })
  }).catch(err => {
    console.log("请求失败")
    reject(err)
  })
};

export const compareLevel = (value, scales) => {
  if (value) {
    var val = value.toFixed(18)
    for(var i = 0, len = scales.length; i < len; i++) {
      var scale = scales[i].toFixed(18)
      if(val === scale) {
        return i
      }
    }
  }
}
