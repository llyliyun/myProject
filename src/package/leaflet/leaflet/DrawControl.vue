<template> </template>
<script>
// import L from "leaflet";
// import "leaflet-draw/dist/leaflet.draw.css";
// import "leaflet-draw/dist/leaflet.draw.js";
import mixin from "./../mixins/mixin";

let layer = null;
let fgroup = new L.FeatureGroup(),
  drawControlLayer = null;
const events = [
  // L.Draw.Event.DELETED,
  // L.Draw.Event.DELETESTART,
  // L.Draw.Event.DELETESTOP,
  // L.Draw.Event.DRAWSTART,
  // L.Draw.Event.DRAWSTOP,
  // L.Draw.Event.DRAWVERTEX,
  // L.Draw.Event.EDITED,
  // L.Draw.Event.EDITMOVE,
  // L.Draw.Event.EDITRESIZE,
  // L.Draw.Event.EDITSTART,
  // L.Draw.Event.EDITSTOP,
  // L.Draw.Event.EDITVERTEX,
  // L.Draw.Event.MARKERCONTEXT,
  // L.Draw.Event.TOOLBARCLOSED,
  // L.Draw.Event.TOOLBAROPENED
];

let MyCustomMarker = L.Icon.extend({
  options: {
    shadowUrl: null,
    iconAnchor: new L.Point(16, 36),
    iconSize: new L.Point(32, 36),
    iconUrl: "./static/img/alpha.png"
  }
});

let drawOptions = {
  icon: new L.DivIcon({
    iconSize: new L.Point(16, 16),
    className:
      "leaflet-div-icon leaflet-editing-icon leaflet-edit-move leaflet-touch-icon"
  })
};

const props = {
  position: {
    type: String,
    default: "topleft"
  },
  draw: {
    type: Object,
    default: () => {
      return {
        polyline: null,
        marker: { icon: new MyCustomMarker() },
        circlemarker: {},
        polygon: {
          ...drawOptions
        },
        circle: null,
        rectangle: {
          shapeOptions: {
            clickable: false
          }
        }
      };
    }
  },
  edit: {
    type: Object,
    default: () => {
      return {
        featureGroup: fgroup //REQUIRED!!
      };
    }
  }
};

export default {
  name: "LDraw",
  mixins: [mixin],
  props: {
    ...props
  },
  mounted() {
    let drawOptions = this.mixinPropOption(this._props, props);
    this.leaflet = new L.Control.Draw(drawOptions);
    L.drawLocal = {
      draw: {
        toolbar: {
          actions: {
            title: "取消绘制",
            text: "取消"
          },
          finish: {
            title: "完成绘制",
            text: "完成"
          },
          undo: {
            title: "删除最后一个点",
            text: "删除最后一个点"
          },
          buttons: {
            polygon: "多边形查询",
            rectangle: "矩形查询",
            marker: "点查询",
            circlemarker: "穿透查询"
          }
        },
        handlers: {
          circle: {
            tooltip: {
              start: "点击拖拽绘制圆."
            },
            radius: "半径"
          },
          circlemarker: {
            shapeOptions: {
              type: 1
            },
            tooltip: {
              start: "穿透查询"
            }
          },
          marker: {
            tooltip: {
              start: "点击选取位置"
            }
          },
          polygon: {
            tooltip: {
              start: "点击开始绘制多边形",
              cont: "点击继续绘制多边形",
              end: "点击第一个点完成绘制"
            }
          },
          polyline: {
            error: "<strong>Error:</strong> shape edges cannot cross!",
            tooltip: {
              start: "点击开始绘制直线.",
              cont: "点击继续绘制直线",
              end: "双击最后一个点完成绘制直线"
            }
          },
          rectangle: {
            tooltip: {
              start: "点击拖拽绘制"
            }
          },
          simpleshape: {
            tooltip: {
              end: "释放鼠标完成绘制"
            }
          }
        }
      },
      edit: {
        remove: true,
        toolbar: {
          actions: {
            save: {
              title: "保存改变",
              text: "保存改变"
            },
            cancel: {
              title: "取消改变",
              text: "取消"
            },
            clearAll: {
              title: "清除所有图层",
              text: "清除所有图层"
            }
          },
          buttons: {
            edit: "编辑图层",
            editDisabled: "没有可编辑的图层",
            remove: "删除查询结果",
            removeDisabled: "没有可以删除的查询结果"
          }
        },
        handlers: {
          edit: {
            tooltip: {
              text: "选择一个点开始编辑",
              subtext: "点击取消按钮取消编辑"
            }
          },
          remove: {
            tooltip: {}
          }
        }
      }
    };
    if (this.$parent._isMounted) {
      this._initHooks(this.$parent.leaflet);
      fgroup.addTo(this.$parent.leaflet);
    }
  },
  beforeDestroy() {
    this.leaflet.remove();
    delete this.leaflet;
  },
  methods: {
    _initHooks($parent) {
      $parent.addControl(this.leaflet);
      this.addEventHook($parent, events);
      this.initEvent();
      this.$parent.leaflet.on(L.Draw.Event.DELETESTART, this.deleteFeature);
      this.$parent.leaflet.on("draw:drawstop", this.drawStop);
      this.message = this.$message({
        dangerouslyUseHTMLString: true,
        message:
          '<span class="message-content">已开启连续查询,可通过“漫游”,“清除”,“右键单击”关闭</span>',
        duration: 0,
        customClass: "draw-control-message"
      });
      this.message.close();
      this.message.$el.style.zIndex = "1999";
    },
    offEvent() {
      if (this.$parent.leaflet) {
        this.$parent.leaflet.off(L.Draw.Event.CREATED, this.drawComplete);
      }
    },
    initEvent() {
      this.$parent.leaflet.on("draw:toolbaropened", this.drawStart);
      this.$parent.leaflet.on(L.Draw.Event.CREATED, this.drawComplete);
    },
    drawComplete(e) {
      this.layerType = e.layerType;
      if (!this.$parent.leaflet.hasLayer(fgroup)) {
        fgroup.addTo(this.$parent.leaflet);
      }
      fgroup.clearLayers();
      layer = e.layer;
      layer.addTo(fgroup);
      let _distance = this.$parent.leaflet.options.crs.resolutions
        ? this.$parent.leaflet.options.crs.resolutions[
            this.$parent.leaflet.getZoom()
          ] * 10
        : SuperMap.Util.getResolutionFromScale(
            this.$parent.leaflet.options.crs.scale(
              this.$parent.leaflet.getZoom(),
              ""
            )
          );
      this.$emit("draw-complete", e.layer, e.layerType, _distance);
    },
    drawStop() {
      let self = this;
      if (this.layerType) {
        if (this.drawControlLayer) {
          this.drawControlLayer.disable();
          this.drawControlLayer = null;
        }
        if (this.layerType == "marker") {
          this.drawControlLayer = new L.Draw.Marker(this.$parent.leaflet, {
            icon: new MyCustomMarker()
          });
        } else if (this.layerType == "circlemarker") {
          this.drawControlLayer = new L.Draw.CircleMarker(this.$parent.leaflet);
        }
        if (this.drawControlLayer) {
          this.drawControlLayer.enable();
          this.message.$el.style.display = "";
          this.$parent.leaflet.on(L.Draw.Event.CREATED, this.drawComplete);
          setInterval(function() {
            self.message.$el.style.display = "none";
          }, 3000);
          this.$parent.leaflet.on("contextmenu", this.clearDrawControlLayer);
          this.$parent.leaflet.contextmenu &&
            this.$parent.leaflet.contextmenu.disable();
        }
      } else {
        if (this.drawControlLayer) {
          this.drawControlLayer.disable();
          this.drawControlLayer = null;
        }
      }
    },
    drawStart() {
      this.clearDrawControlLayer();
      this.$emit("draw-start");
    },
    deleteFeature() {
      fgroup.clearLayers();
      this.$emit("draw-clear");
    },
    clearDrawLayer() {
      if (layer) {
        layer.remove();
      }
      this.clearDrawControlLayer();
    },
    clearDrawControlLayer(e) {
      this.layerType = null;
      if (this.drawControlLayer) {
        this.drawControlLayer.disable();
        this.drawControlLayer = null;
      }
      this.message.$el.style.display = "none";
      this.$parent.leaflet.off("contextmenu", this.clearDrawControlLayer);
      this.$parent.leaflet.contextmenu &&
        this.$parent.leaflet.contextmenu.enable();
    }
  }
};
</script>
<style type="text/css" lang="scss">
.draw {
  position: absolute;
  top: 13%;
  left: 3%;
}

.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-edit-edit.leaflet-disabled,
.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-edit-edit {
  display: none;
}

// .leaflet-draw-actions-bottom {
//   display: none !important;
// }

.leaflet-draw-actions a {
  color: #fff !important;
}
.draw-control-message {
  top: 76px;
  left: 1000px;
  transform: translateX(-55%);
  padding: 8px;
}
</style>
