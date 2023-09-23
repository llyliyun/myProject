<template> </template>
<script>
let baseMarkerUrl = "static/img/mark/";

export default {
  created() {
    EventBus.$on("query-poi", this.showPoi); //查询的兴趣点
    EventBus.$on("query-seleted", this.showOne); //选中某点
    EventBus.$on("query-inmarker", this.inMarker);
    EventBus.$on("query-outmarker", this.outMarker);
  },
  beforeDestroy() {
    EventBus.$off("query-poi", this.showPoi); //查询的兴趣点
    EventBus.$off("query-seleted", this.showOne); //选中某点
    EventBus.$off("query-inmarker", this.inMarker);
    EventBus.$off("query-outmarker", this.outMarker);
  },
  methods: {
    showPoi(list) {
      if (Viewer) {
        Viewer.entities.removeAll();
        Viewer.scene.globe.depthTestAgainstTerrain = false;
        if (this.currentBaseMap.desc == "NONEARTHFLAT") {
          // 平面地名地址
          for (var i = 0; i < list.length; i++) {
            var item = list[i];
            let point = new Cesium.Cartesian3(
              parseFloat(item.X),
              parseFloat(item.Y),
              parseFloat(60)
            );
            let pointCartographic = Viewer.scene.camera._projection.unproject(
              point
            );
            let pointCX = Cesium.Math.toDegrees(pointCartographic.longitude);
            let pointCY = Cesium.Math.toDegrees(pointCartographic.latitude);
            Viewer.entities.add({
              position: Cesium.Cartesian3.fromDegrees(pointCX, pointCY),
              billboard: {
                image: baseMarkerUrl + (i + 1) + ".png",
                width: 30,
                height: 40
              },
              name: item.NAME || "暂无名称",
              id: i,
              props: item,
              description: item.NAME || "暂无名称"
            });
          }
        } else {
          for (var i = 0; i < list.length; i++) {
            var item = list[i];
            Viewer.entities.add({
              position: Cesium.Cartesian3.fromDegrees(
                parseFloat(item.X),
                parseFloat(item.Y)
              ),
              billboard: {
                image: baseMarkerUrl + (i + 1) + ".png",
                width: 30,
                height: 40
              },
              name: item.NAME || "暂无名称",
              id: i,
              props: item,
              description: item.NAME || "暂无名称"
            });
          }
        }
        Viewer.zoomTo(Viewer.entities);
      }
    },
    showOne(item) {
      if (Viewer) {
        if (this.currentBaseMap.desc == "NONEARTHFLAT") {
          // 平面地名地址
          let point = new Cesium.Cartesian3(
            parseFloat(item.X),
            parseFloat(item.Y),
            parseFloat(300)
          );
          let pointCartographic = Viewer.scene.camera._projection.unproject(
            point
          );
          let pointCX = Cesium.Math.toDegrees(pointCartographic.longitude);
          let pointCY = Cesium.Math.toDegrees(pointCartographic.latitude);
          Viewer.scene.camera.flyTo({
            destination: new Cesium.Cartesian3.fromDegrees(
              pointCX,
              pointCY,
              pointCartographic.height
            )
          });
        } else {
          Viewer.scene.camera.flyTo({
            destination: new Cesium.Cartesian3.fromDegrees(
              +item.X,
              +item.Y,
              15000
            )
          });
        }
      }
    },
    inMarker(index) {
      let self = this;
      if (Viewer) {
        Viewer.entities.values.forEach(function(layer) {
          if (layer._id == index) {
            layer._billboard._image._value =
              baseMarkerUrl + (index + 1) + "_h.png";
          }
        });
      }
    },
    outMarker(index) {
      let self = this;
      if (Viewer) {
        Viewer.entities.values.forEach(function(layer) {
          if (layer._id == index) {
            layer._billboard._image._value =
              baseMarkerUrl + (index + 1) + ".png";
          }
        });
      }
    }
  }
};
</script>
