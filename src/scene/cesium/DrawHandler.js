/**
 * 全局命名空间CesiumApp
 * @type {[type]}
 */
import _ from 'underscore'

window.CesiumApp = window.CesiumApp || {};

(function() {
  
  let _callback = {
    /**
     * DrawHandler销毁时回调事件
     * @return {[type]} [description]
     */
    destory: null,
    /**
     * DrawHandler绘制完成时回调事件
     * @param  {[type]} result    绘制完成后原始结果回调
     * @param  {[type]} latlngArr 绘制完成后经纬度对象。形如[{x: 1, y: 2, z: 3}, ...]
     * @return {[type]}           [description]
     */
    complete: null,
  }

  let _setting = {
    clampMode: 0,
    /**
     * 绘制完成后是否默认添加到场景中
     * @type {Boolean}
     */
    completeAdd: false,
    /**
     * 面绘制完成后默认样式，只在completeAdd为true下有效
     * @type {Object}
     */
    polygonOptions: {
      outline:false,
      outlineColor: Cesium.Color.RED,
      outlineWidth:5,
      fill:true,
      material : Cesium.Color.RED.withAlpha(0.5),
    },
    /**
     * 点绘制完成后默认样式，只在completeAdd为true下有效
     * @type {Object}
     */
    pointOptions: {

    },
    /**
     * marker绘制完成后默认样式，只在completeAdd为true下有效
     * @type {Object}
     */
    markerOptions: {

    },
    /**
     * 线绘制完成后默认样式，只在completeAdd为true下有效
     * @type {Object}
     */
    lineOptions: {

    }
  }

  /**
   * drawHandler二次封装类，提供更易用的绘制接口
   * @param {[type]}   viewer   viewer对象
   * @param {Object}   options  参考_setting
   * @param {Function} cbOptions 回调对象,参考_callback
   */
  function DrawHandler(viewer, options = {}, cbOptions) {
    this.fns = _.extend({}, _callback, cbOptions);
    this.clampMode = _setting.clampMode;
    this.viewer = viewer;
    this.options = _.extend({}, _setting, options)
  }
  /**
   * 绘制面
   * @param  {[type]} clampMode  贴地模式
   * @param  {[type]} onComplete 绘制成功后回调
   * @return {[type]}            [description]
   */
  DrawHandler.prototype.drawPolygon = function(clampMode, onComplete) {
    if (!this.polygonHandler) {
      this.polygonHandler = new Cesium.DrawHandler(Viewer,Cesium.DrawMode.Polygon, clampMode || this.options.clampMode);
    }
    this.polygonHandler.activate();
    this.polygonHandler.activeEvt.addEventListener(function(isActive) {
    })

    let _this = this;

    this.polygonHandler.drawEvt.addEventListener(function(result) {
      let resultData = result.object.positions;

      let latlngArr = [];

      resultData.forEach(function(val, index) {
        let ellipsoid = _this.viewer.scene.globe.ellipsoid;
        let xyz = new Cesium.Cartesian3(
          result.object.positions[index].x,
          result.object.positions[index].y,
          result.object.positions[index].z
        );
        let wgs84 = ellipsoid.cartesianToCartographic(xyz);
        let lng = Cesium.Math.toDegrees(wgs84.longitude);
        let lat = Cesium.Math.toDegrees(wgs84.latitude);
        let height = Cesium.Math.toDegrees(wgs84.height);
        latlngArr.push({
          lng: lng,
          lat: lat,
          // z: height
        });
      });

      if (_this.options.completeAdd) {
        let _opts = _.extend({}, _this.options.polygonOptions, {
          hierarchy: new Cesium.PolygonHierarchy(resultData)
        })
        _this.polygonEntity = new Cesium.Entity({
          polygon: _opts
        })
        _this.viewer.entities.add(_this.polygonEntity);
      }

      if (_.isFunction(_this.fns.complete)) {
        _this.fns.complete(result, latlngArr)
      }

      if (_.isFunction(onComplete)) {
        onComplete(result, latlngArr);
      }

      // _this.polygonHandler.deactivate()
    })
  };

  /*TODO 绘制线、marker、point方法*/

  /**
   * [drawLine description]
   * @param  {[type]} clampMode  [description]
   * @param  {[type]} onComplete [description]
   * @return {[type]}            [description]
   */
  DrawHandler.prototype.drawLine = function(clampMode, onComplete) {
    if (this.polylineHandler) {
      this.polylineHandler = new Cesium.DrawHandler(Viewer,Cesium.DrawMode.Polyline, clampMode || this.options.clampMode);
    }

    this.polygonHandler.activate();
    this.polygonHandler.activeEvt.addEventListener(function(isActive){
    })

    this.polylineHandler.drawEvt.addEventListener((result) => {

    })
  };

  DrawHandler.prototype.drwaMarker = function(options) {
    if (this.markerHandler) {
      this.markerHandler = new Cesium.DrawHandler(Viewer,Cesium.DrawMode.Marker, clampMode || this.options.clampMode);
    }

  };

  DrawHandler.prototype.destory = function() {
    this.polygonHandler && this.polygonHandler.clear()
    this.polylineHandler && this.polylineHandler.clear()
    this.markerHandler && this.markerHandler.clear()

    this.polygonHandler = null;
    this.polylineHandler = null;
    this.markerHandler = null;

    if (_.isFunction(this.fns.destory)) {
      this.fns.destory();
    }
  };
  CesiumApp.DrawHandler = DrawHandler;
}())
