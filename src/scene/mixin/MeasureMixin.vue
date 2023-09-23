<template>
</template>
<script>
let handlerDis, handlerArea, handlerHeight,VolumeDataArea;
  export default {
    created() {
      EventBus.$on('toolbar-measured', this.initmeasure);
      EventBus.$on('toolbar-clearAll', this.clearAll);
    },
    beforeDestroy(){
      EventBus.$off('toolbar-measured', this.initmeasure);
      EventBus.$off('toolbar-clearAll', this.clearAll);
      this.clearAll()
    },
    watch: {
      currentBaseMap(val, oldVal) {
        handlerDis = handlerArea = handlerHeight = null;
      },
    },
    methods: {
      initmeasure(command, isCloseToGround, isCloseVolumeMeasure, controlspeed) {
        let scene = Viewer.scene;
        let that = this;
        let VolumeData = null;
        VolumeDataArea = 0;
        let isVolume = false;
        //初始化测量距离 --- 量距
        if (!handlerDis) {
          handlerDis = new Cesium.MeasureHandler(Viewer, Cesium.MeasureMode.Distance, 0);
          //注册测距功能事件
          handlerDis.measureEvt.addEventListener(function(result) {
            var distance = result.distance > 1000 ? (result.distance / 1000).toFixed(2) + 'km' : result.distance + 'm';
            handlerDis.disLabel.text = '距离:' + distance;
          });
          handlerDis.activeEvt.addEventListener(function(isActive) {
            if (isActive == true) {
              Viewer.enableCursorStyle = false;
              Viewer._element.style.cursor = '';
            } else {
              Viewer.enableCursorStyle = true;
            }
          });
        }
        if (!handlerArea) {
          //初始化测量面积 --- 量面积
          handlerArea = new Cesium.MeasureHandler(Viewer, Cesium.MeasureMode.Area, 0);
          handlerArea.measureEvt.addEventListener(function(result) {
            VolumeData = result;
            console.log(VolumeData);
            VolumeDataArea = result.area;
            isVolume = true;
            var area = result.area > 1000000 ? (result.area / 1000000).toFixed(2) + 'km²' : result.area + '㎡'
            handlerArea.areaLabel.text = '面积:' + area;
            try {
              if (controlspeed === "excavation") {
                EventBus.$emit("toolbar-VolumeDataVm",VolumeDataArea);
              } else {
                Viewer.entities.removeAll();
                if (VolumeData.positions.length > 2 && isCloseVolumeMeasure && isVolume) {
                  var positions = [];
                  for (var i = 0; i < VolumeData.positions.length; i++) {
                    positions.push(
                      new Cesium.Cartesian3(
                        VolumeData.positions[i].x,
                        VolumeData.positions[i].y,
                        VolumeData.positions[i].z
                      )
                    );
                  }
                  var polygon = Viewer.entities.add({
                    polygon: {
                      hierarchy: {
                        positions: positions
                      },
                      material: Cesium.Color.HONEYDEW.withAlpha(0.5)
                    }
                  });
                  //polygon.extrudedHeight = Viewer.entities.properties.Shape_Area / 100000.0;
                  Viewer.zoomTo(polygon);
                  var polygonEntity = Viewer.entities.values[0];
                  polygonEntity.polygon["extrudedHeight"] = controlspeed + 90;
                  EventBus.$emit("toolbar-VolumeData", VolumeDataArea);
                }
                isVolume = false;
              }
            } catch (e) {}
          });
          handlerArea.activeEvt.addEventListener(function(isActive) {
            if (isActive == true) {
              Viewer.enableCursorStyle = false;
              Viewer._element.style.cursor = '';
            } else {
              Viewer.enableCursorStyle = true;
            }
          });
        }

        if (!handlerHeight) {
          //初始化测量高度
          handlerHeight = new Cesium.MeasureHandler(Viewer, Cesium.MeasureMode.DVH);
          handlerHeight.measureEvt.addEventListener(function(result) {
            var distance = result.distance > 1000 ? (result.distance / 1000).toFixed(2) + 'km' : result.distance + 'm';
            var vHeight = result.verticalHeight > 1000 ? (result.verticalHeight / 1000).toFixed(2) + 'km' : result.verticalHeight + 'm';
            var hDistance = result.horizontalDistance > 1000 ? (result.horizontalDistance / 1000).toFixed(2) + 'km' : result.horizontalDistance + 'm';
            handlerHeight.disLabel.text = '空间距离:' + distance;
            let degree = "（对角：" + (90 - Math.atan(result.horizontalDistance/result.verticalHeight) / (Math.PI / 180)).toFixed(0) + "°）"
            handlerHeight.vLabel.text = '垂直高度:' + vHeight + degree;
            handlerHeight.hLabel.text = '水平距离:' + hDistance;
          });
          handlerHeight.activeEvt.addEventListener(function(isActive) {
            if (isActive == true) {
              Viewer.enableCursorStyle = false;
              Viewer._element.style.cursor = '';
            } else {
              Viewer.enableCursorStyle = true;
            }
          });
        }
        if (isCloseToGround) {
          handlerDis.clampMode = 1;
          handlerArea.clampMode = 1;
          handlerHeight.clampMode = 1;
        } else {
          handlerDis.clampMode = 0;
          handlerArea.clampMode = 0;
          handlerHeight.clampMode = 0;
        }
        if (command === 'distance') {
          that.measureDis();
        };
        if (command === 'polyline') {
          that.measureArea();
        };
        if (command === 'height') {
          that.measureHeight();
        };
      },
      measureDis() {
        this.deactiveAll();
        handlerDis && handlerDis.activate();
      },
      measureArea() {
        this.deactiveAll();
        handlerArea && handlerArea.activate();
      },
      measureHeight() {
        this.deactiveAll();
        handlerHeight && handlerHeight.activate();
      },
      deactiveAll() {
        handlerDis && handlerDis.deactivate();
        handlerArea && handlerArea.deactivate();
        handlerHeight && handlerHeight.deactivate();
      },
      clearAll() {
        handlerDis && handlerDis.clear();
        handlerArea && handlerArea.clear();
        handlerHeight && handlerHeight.clear();
      }
    }
  }
</script>
