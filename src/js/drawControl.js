import {
  markerIcon
} from './icon.js'
import {
  processCoord,
  createDebounce
} from './utils.js'

let DrawType = {
  marker: 'marker',
  polyline: 'polyline',
  polygon: 'polygon',
  rectangle: 'rectangle',
  circle: 'circle',
  bufferPolyline: 'bufferPolyline'
}

class DrawnFeature {
  type
  feature

  constructor(feature, type) {
    this.feature = feature;
    this.type = type;
  }
}

class BufferPolyline extends DrawnFeature {
  bufferRadius
  buffer

  constructor(bufferRadius, polyline, buffer) {
    super(polyline, DrawType.bufferPolyline);

    this.bufferRadius = bufferRadius;
    this.buffer = buffer;
  }
}

class DrawControl {

  map

  LdrawMarkerControl
  LdrawPolylineControl
  LdrawRectangleControl
  LdrawPolygonControl
  LdrawCircleControl

  LdrawnFeatureMap = new Map();

  LeditControl
  LenableEdit

  LlastMapCenter

  LbufferRadius

  LfeaturePane

  selected

  selectedFeatureCallback
  createdFeatureCallback
  updatedFeatureCallback

  constructor(map) {
    this.map = map;

    //#region tooltip 汉化
    L.drawLocal.edit.handlers.remove.tooltip.text = "请点击要删除的图形";

    L.drawLocal.edit.handlers.edit.tooltip.text = "●  拖拽节点编辑图形<br />●  点击删除顶点";
    L.drawLocal.edit.handlers.edit.tooltip.subtext = "";

    L.drawLocal.draw.handlers.marker.tooltip.start = "点击地图放置标记";

    L.drawLocal.draw.handlers.polyline.tooltip.start = "点击开始绘制线";
    L.drawLocal.draw.handlers.polyline.tooltip.end = "点击最后一个节点结束画线";
    L.drawLocal.draw.handlers.polyline.tooltip.cont = "点击继续绘制线";

    L.drawLocal.draw.handlers.polygon.tooltip.start = "点击开始绘制多边形";
    L.drawLocal.draw.handlers.polygon.tooltip.end = "点击起点结束绘制多边形";
    L.drawLocal.draw.handlers.polygon.tooltip.cont = "点击继续绘制多边形";

    L.drawLocal.draw.handlers.rectangle.tooltip.start = "按下鼠标左键并拖动以绘制矩形";

    L.drawLocal.draw.handlers.circle.tooltip.start = "按下鼠标左键并拖动以绘制圆";
    L.drawLocal.draw.handlers.circle.radius = "半径";

    L.drawLocal.draw.handlers.simpleshape.tooltip.end = "松开鼠标结束绘制";
    //Lendregion

    this.LdrawMarkerControl = new L.Draw.Marker(this.map, {
      icon: markerIcon
    });
    this.LdrawPolylineControl = new L.Draw.Polyline(this.map, {
      shapeOptions: {
        weight: 2,
        color: "#ff0000",
        opacity: 0.8
      }
    });
    this.LdrawRectangleControl = new L.Draw.Rectangle(this.map, {
      shapeOptions: {
        weight: 2,
        color: "#ff0000",
        opacity: 0.8
      },
      metric: ['km', 'm']
    });
    this.LdrawPolygonControl = new L.Draw.Polygon(this.map, {
      shapeOptions: {
        weight: 2,
        color: "#ff0000",
        opacity: 0.8
      }
    });
    this.LdrawCircleControl = new L.Draw.Circle(this.map, {
      shapeOptions: {
        weight: 2,
        color: "#ff0000",
        opacity: 0.8
      }
    });

    this.LfeaturePane = map.createPane("featurePane", map.getPane("overlayPane"));

    let self = this;
    this.map.on(L.Draw.Event.CREATED, function (event) {
      let drawnFeature;

      if (self.LdrawPolylineControl.enabled() && self.LbufferRadius) {
        let buffer = self.LcreateBuffer(event.layer, self.LbufferRadius);
        drawnFeature = new BufferPolyline(self.LbufferRadius, event.layer, buffer);
      } else {
        drawnFeature = new DrawnFeature(event.layer, event.layerType);
      }

      self.LdrawnFeatureMap.set(event.layer, drawnFeature);

      event.layer.addEventListener("click", function (e) {
        if (self.LenableEdit) {
          let drawnFeature = self.LdrawnFeatureMap.get(e.target);

          self.LstartEdit(e.target);

          self.selected = drawnFeature;

          if (self.selectedFeatureCallback) self.selectedFeatureCallback(drawnFeature);
        }
      });

      if (self.createdFeatureCallback) {
        self.createdFeatureCallback(drawnFeature);
        self.createdFeatureCallback = undefined;
      }

      event.layer.options.pane = self.LfeaturePane;
      self.map.addLayer(event.layer);
    });

    this.map.on(L.Draw.Event.EDITED, function (event) {
      let layers = event.layers.getLayers();
      if (layers.length == 0) return;
      let feature = layers[0];
      let drawnFeature = self.LdrawnFeatureMap.get(feature);
      if (drawnFeature) {
        if (self.updatedFeatureCallback) self.updatedFeatureCallback(drawnFeature);

        self.LupdateBuffer(drawnFeature);
      }
    });

    this.map.on(L.Draw.Event.EDITVERTEX, function (event) {
      let feature = event.poly;
      let drawnFeature = self.LdrawnFeatureMap.get(feature);

      if (self.updatedFeatureCallback) self.updatedFeatureCallback(drawnFeature);

      self.LupdateBuffer(drawnFeature);
    });

    let debounce = createDebounce();
    this.map.on(L.Draw.Event.EDITRESIZE, function (event) {
      let feature = event.layer;
      let drawnFeature = self.LdrawnFeatureMap.get(feature);

      if (self.updatedFeatureCallback) {
        debounce(() => {
          self.updatedFeatureCallback(drawnFeature);
        });
      }
    });

    this.map.on(L.Draw.Event.EDITMOVE, function (event) {
      let feature = event.layer;
      let drawnFeature = self.LdrawnFeatureMap.get(feature);

      if (self.updatedFeatureCallback) {
        debounce(() => {
          self.updatedFeatureCallback(drawnFeature);
        });
      }
    });

    this.map.addEventListener("mousedown", function (e) {
      if (self.LdrawPolylineControl.enabled() || self.LdrawPolygonControl.enabled()) {
        self.LlastMapCenter = self.map.getCenter();
      }
    });

    //绘制线或多边形的同时平移地图的情况
    this.map.addEventListener("mouseup", function (e) {
      if (self.LdrawPolylineControl.enabled() || self.LdrawPolygonControl.enabled()) {
        if (self.LlastMapCenter) {
          let currentMapCenter = self.map.getCenter();
          let points = [];
          points.push([self.LlastMapCenter.lng, self.LlastMapCenter.lat]);
          points.push([currentMapCenter.lng, currentMapCenter.lat]);
          let line = turf.lineString(points);
          var length = turf.length(line, {
            units: 'kilometers'
          });
          if (length > 0.00001) {
            if (self.LdrawPolylineControl.enabled()) {
              self.LdrawPolylineControl.deleteLastVertex();
            }
            if (self.LdrawPolygonControl.enabled()) {
              self.LdrawPolygonControl.deleteLastVertex();
            }
          }
        }
      }
    });
  }

  startEdit() {
    this.LenableEdit = true;
  }

  stopEdit() {
    this.LenableEdit = false;

    this.selected = undefined;

    if (this.LeditControl) {
      this.LeditControl.disable();
    }
  }

  deleteSelected() {
    if (this.LenableEdit) {
      if (this.selected) {
        this.map.removeLayer(this.selected.feature);

        this.selected.buffer && this.map.removeLayer(this.selected.buffer);
        this.LdrawnFeatureMap.delete(this.selected.feature);
      }
    }
  }

  LstartEdit(target) {
    if (this.LeditControl) {
      this.LeditControl.disable();
    }

    if (this.LenableEdit) {
      let featureGroup = new L.featureGroup();
      featureGroup.addLayer(target);

      this.LeditControl = new L.EditToolbar.Edit(this.map, {
        featureGroup: featureGroup,
        selectedPathOptions: {
          maintainColor: false,
          color: "#ff0000",
          opacity: 0.8
        }
      });
      this.LeditControl.enable();
    }
  }

  drawMarker(createdFeatureCallback) {
    this.stopDrawAll();

    if (createdFeatureCallback) {
      this.createdFeatureCallback = createdFeatureCallback;
    }
    this.LdrawMarkerControl.enable();
  }

  drawPolyline(createdFeatureCallback) {
    this.stopDrawAll();

    if (createdFeatureCallback) {
      this.createdFeatureCallback = createdFeatureCallback;
    }
    this.LdrawPolylineControl.enable();
  }

  drawBufferPolyline(bufferRadius, createdFeatureCallback) {
    this.stopDrawAll();

    this.LbufferRadius = bufferRadius;
    if (createdFeatureCallback) {
      this.createdFeatureCallback = createdFeatureCallback;
    }
    this.LdrawPolylineControl.enable();
  }

  drawRectangle(createdFeatureCallback) {
    this.stopDrawAll();

    if (createdFeatureCallback) {
      this.createdFeatureCallback = createdFeatureCallback;
    }
    this.LdrawRectangleControl.enable();
  }

  drawPolygon(createdFeatureCallback) {
    this.stopDrawAll();

    if (createdFeatureCallback) {
      this.createdFeatureCallback = createdFeatureCallback;
    }
    this.LdrawPolygonControl.enable();
  }

  drawCircle(createdFeatureCallback) {
    this.stopDrawAll();

    if (createdFeatureCallback) {
      this.createdFeatureCallback = createdFeatureCallback;
    }
    this.LdrawCircleControl.enable();
  }

  stopDrawAll() {
    this.LdrawMarkerControl.disable();
    this.LdrawPolylineControl.disable();
    this.LdrawRectangleControl.disable();
    this.LdrawPolygonControl.disable();
    this.LdrawCircleControl.disable();
    this.LbufferRadius = undefined;
  }

  LcreateBuffer(polyline, bufferRadius) {
    let pointArr = [];
    let latlngs = polyline.getLatLngs();
    for (let i = 0; i < latlngs.length; i++) {
      pointArr.push([latlngs[i].lng, latlngs[i].lat]);
    }

    let line = turf.lineString(pointArr);
    let buffered = turf.buffer(line, 0.001 * bufferRadius, {
      units: 'kilometers',
      steps: 64
    }); //线左右两边各50米缓冲区，缓冲区宽共100米

    let polylineBufferPointArr = processCoord(buffered.geometry.coordinates);

    let polylineBuffer = L.polygon(polylineBufferPointArr, {
      stroke: true,
      color: '#ff0000',
      weight: 2,
      fill: true,
      fillColor: '#ff0000',
      fillOpacity: 0.5
    });
    this.map.addLayer(polylineBuffer);

    let self = this;
    polylineBuffer.addEventListener("click", function (e) {
      if (self.LenableEdit) {
        let line;
        for (let drawnFreature of self.LdrawnFeatureMap.values()) {
          if (Object.is(drawnFreature.buffer, e.target)) {
            line = drawnFreature.feature;
            self.selected = drawnFreature;
          }
        }
        if (line) {
          self.LstartEdit(line);
        }
      }
    });

    return polylineBuffer;
  };

  LupdateBuffer(drawnFreature) {
    if (drawnFreature.type == DrawType.bufferPolyline) {
      this.map.removeLayer(drawnFreature.buffer);

      let buffer = this.LcreateBuffer(drawnFreature.feature, drawnFreature.bufferRadius);
      drawnFreature.buffer = buffer;
    }
  }

}

export {
  DrawControl,
  DrawType
}
