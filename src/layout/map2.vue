<template>
  <div id="map"></div>
</template>

<script>
import DrawPlug from "../js/hi";

export default {
  mounted() {
    this.initMap();
  },
  methods: {
    initMap() {
      let wmts = APPCONFIG.wmts;
      var resolutions = wmts.resolutions;
      let center = wmts.center;
      let hcmap = L.map("map", {
        center: [center.y, center.x],
        maxZoom: center.maxZoom,
        zoom: center.zoom,
        crs: L.supermap.CRS.TianDiTu_WGS84,
      });
      let wmtsyxlayer = new L.supermap.TiandituTileLayer({
        layerType: "img",
        key: "1d109683f4d84198e37a38c442d68311",
      }).addTo(hcmap);
      let wmtszjlayer = new L.supermap.TiandituTileLayer({
        layerType: "img",
        isLabel: true,
        key: "1d109683f4d84198e37a38c442d68311",
      }).addTo(hcmap);
      //   var layer = L.supermap.wmtsLayer(wmts.url, wmts.options).addTo(hcmap);

      //  var zjlayer = L.supermap
      //    .wmtsLayer(wmts.zjurl, wmts.zjoptions)
      //   .addTo(hcmap);
      window.hcmap = hcmap;
      window.wmtszjlayer = wmtszjlayer;
      window.wmtsyxlayer = wmtsyxlayer;
      var _viewSpotLayer = L.layerGroup();
      hcmap.addLayer(_viewSpotLayer);
      window._viewSpotLayer = _viewSpotLayer;
      let drawPlug = new DrawPlug(hcmap, _viewSpotLayer);
      window.drawPlug = drawPlug;
    },
  },
};
</script>

<style>
</style>
