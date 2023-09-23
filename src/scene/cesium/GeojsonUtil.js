/**
 * 全局命名空间CesiumApp
 * @type {[type]}
 */
import _ from 'underscore'

window.CesiumApp = window.CesiumApp || {};
  
(function() {

  let _defaultOptions = {
    clampToGround: true,
    outline: false,
    fill: Cesium.Color.ORANGERED.withAlpha(.5),
    polylineWidth: 10,
    polylineMaterial: new Cesium.PolylineGlowMaterialProperty({
      glowPower: .1, //一个数字属性，指定发光强度，占总线宽的百分比。
      color: Cesium.Color.ORANGERED.withAlpha(.9)
    }),
    /**
     * 是否需要转换multiPolygon hack，realTime返回结果在处理复杂面数据集的情况下结构有误，导致三维加载异常
     */
    multiPolygonConvert: false,
    hightLightColor: Cesium.Color.RED.withAlpha(.8),
    /**
     * geojson数据源中数据被选中回调
     * @param  {[type]} entity [description]
     * @return {[type]}        [description]
     */
    /*onEntitySelected: function(entity) {
    }*/
    /**
     * 实体添加后回调
     * @param  {[type]} dataSource 添加成功后datasource
     * @return {[type]}            [description]
     */
   /* onEntitiesAdd: function(dataSource) {
    }*/
  }

  /**
   * 默认加载回调函数
   * @type {Object}
   */
  let _callback = {
  }

  // let _initListenrCalled = false;
  let _datasourceCache = {};
  /**
   * 全局高亮entity， 默认只允许只有一个高亮元素
   */
  let _preHighlightEntity = null;

  /**
   * [GeojsonUtil description]
   * @param {Object} dataOptions     默认参数选项 参考 http://support.supermap.com.cn:8090/webgl/Build/Documentation/GeoJsonDataSource.html?classFilter=GeoJsonDataSource
   * @param {Object} callbackOptions 回调函数对象： onEntitiesAdd等
   */
  function GeojsonUtil(options = {}) {
    this.options = _.extend({}, _defaultOptions, options);
    this._initListenrCalled = false;
    this._loadedDatasoureceName = []
    // _datasourceCache = {};
    //_preHighlightEntity = null;
    // this.fns = _.extend({}, _callback, callbackOptions);
  }

  /**
   * 加载geojson数据
   * @param  {[type]}  Viewer             Viewer对象
   * @param  {[type]}  data               geojson数据
   * @param  {String}  name               数据源名称，默认为default
   * @param  {Boolean} options.clearOnAdd 同名数据集下新增数据是否清除之前数据
   * @param  {Boolean} options.focus      加载数据后是否重新定位
   * @return {[type]}                     [description]
   */
  GeojsonUtil.prototype.load = function(Viewer, data, name = 'default', {clearOnAdd = true, focus = true, polygonOutline = false} = {}) {
    this.viewer = Viewer;

    this._loadedDatasoureceName.push(name)

    if (!this._initListenrCalled) {
      this._initListenr();
    }

    let _this = this;

    if (!_datasourceCache[name]) {
      _datasourceCache[name] = new Cesium.GeoJsonDataSource(name);
    }

    if (!this.viewer.dataSources.contains(_datasourceCache[name])) {
      this.viewer.dataSources.add(_datasourceCache[name]);
    }

    if (clearOnAdd) {
      _datasourceCache[name].entities.removeAll();
    }

    let promise;

    if (this.options.multiPolygonConvert) {
      data = this.convertMulti(data);
    }

    /**
     * Cesium的面要素默认不支持outline，此处将边线复制一份加载
     * polygonOutline属性由options控制即跟普通线属性保持一致
     */
    if (polygonOutline) {
      data = this.convertPolygonToLine(data);
    }

    try {
      promise = _datasourceCache[name].load(data, this.options);
    } catch ( e ) {
      console.error(data);
    }
    _datasourceCache[name].errorEvent.addEventListener((e) => {
      console.error(e);
    })

    promise.then((dataSource) => {
      let entities = dataSource.entities.values;
      entities.forEach(entity => {
        entity.sourceFrom = name;
        if (Cesium.defined(entity.polygon)) {
          entity.polygon.outline = false;
          // entity.polygon.closeTop = false;
          // entity.polygon.closeTop = false;
          // entity.polygon.clampToGround = true;
        } else if (Cesium.defined(entity.polyline)) {
          if (polygonOutline) {
            entity.polyline.width = this.options.polylineWidth;
            entity.polyline.material = this.options.polylineMaterial;
          }
        }
      })
      // console.log('...')
      if (_.isFunction(_this.options.onEntitiesAdd)) {
        _this.options.onEntitiesAdd.call(this, dataSource);
      }
    });

    if (focus) {
      this.viewer.flyTo(promise);
    }
  };

  /**
   * 根据数据源名称移除datasource
   * @param  {[type]}  name    数据源名称
   * @param  {Boolean} destroy 是否销毁
   * @return {[type]}          [description]
   */
  GeojsonUtil.prototype.removeDatasouceByName = function(name, destroy = true) {
    if (_datasourceCache[name]) {
      _datasourceCache[name].entities.removeAll();
      try {
        this.viewer.dataSources.remove(_datasourceCache[name], destroy);
      } catch (e) {
        console.error(e)
      }
      _datasourceCache[name] = null;
      delete _datasourceCache[name];
    }
  };

  GeojsonUtil.prototype.removeEntityByName = function(datasourceName, entityname) {

  }

  GeojsonUtil.prototype.removeAll = function() {
    let keys = Object.keys(_datasourceCache);
    keys.forEach(item => this.removeDatasouceByName(item));
    this.removeHighLightEntity();
  };

  GeojsonUtil.prototype.convertMulti = function(data) {
    let _geojson = _copy(data);
    if (_geojson.type == 'FeatureCollection') {
      let features = _geojson.features;
      for (var i = features.length - 1; i >= 0; i--) {
        if(features[i].geometry.type == 'MultiPolygon') {
          let _prop = _copy(features[i].properties);
          let _polygons = features[i].geometry.coordinates[0];
          _polygons.forEach(item => {
            features.push({
              type: 'Feature',
              properties: _prop,
              geometry: {
                coordinates: [item],
                type: 'Polygon'
              }
            })
          })
          features.splice(i, 1);
        }
      }
    }
    return _geojson;
  };

  /**
   * 支持将Geojson中Multipolygon拆分为polygon，防止cesium加载异常，用于和有拓扑错误的数据叠加分析时使用，
   * 该方法无法处理带岛洞数据
   * @param  {[type]} geojson [待处理geojson对象]
   * @return {[type]}         [description]
   */
  GeojsonUtil.prototype.convertPolygonToLine = function(geojson) {
    let _geojson = _copy(geojson);
    if (_geojson.type == 'FeatureCollection') {
      let _lineFeatures = _copy(geojson.features);
      _lineFeatures.forEach(item => {
        let newType = item.geometry.type == 'Polygon' ? 'LineString' : 'MultiLineString';
        item.geometry.type = 'MultiLineString';
      })
      _geojson.features = [].concat.call(_geojson.features, _lineFeatures);
    }
    return _geojson;
  };

  GeojsonUtil.prototype._initListenr = function() {
    this.viewer.selectedEntityChanged.addEventListener((entity) => {
      if (!Cesium.defined(entity) || !Cesium.defined(entity.polygon)) {
        return;
      }
      // let keys = Object.keys(this._loadedDatasoureceName)
      if (Cesium.defined(entity.sourceFrom) && this._loadedDatasoureceName.includes(entity.sourceFrom)) {

        if (this.options.hightLightColor) {
          this.removeHighLightEntity();

          if (_preHighlightEntity == entity) {
            return;
          }

          let _entityClone = new Cesium.Entity({
            polygon: entity.polygon.clone()
          });
          _entityClone.polygon.material = this.options.hightLightColor;

          _preHighlightEntity = this.viewer.entities.add(_entityClone);
        }
        
        if (this.options.onEntitySelected) {
          this.options.onEntitySelected.call(this, entity)
        }
      }
    })
    this._initListenrCalled = true;
  };

  GeojsonUtil.prototype.removeHighLightEntity = function() {
    if (_preHighlightEntity) {
      this.viewer.entities.remove(_preHighlightEntity);
      _preHighlightEntity = null;
    }
  };


  function _copy(data) {
    return JSON.parse(JSON.stringify(data));
  }

  CesiumApp.GeojsonUtil = GeojsonUtil;
}())