<template>
  
</template>

<script>
  // 添加
  let imageryLayers = null;
  let cesium = null;
  export default {
    name: 'LEsriImageryProvider',
    // 添加
    props:{
      url: {
        type: String,
        default: '',
        required: true
      },
      visible: {
        type: Boolean,
        default: true,
      },
      opacity: {
        type: Number,
        default: 1,
      },
      layers: {
        type: String,
      },
      tileWidth:{
        type:String,
        default: 256
      },
      tileHeight:{
        type:String,
        default: 256
      }
    },
    mounted() {
      if (this.$parent._isMounted) {
        this._initHooks();
      }
    },
    watch: {
      url(val, newVal) {
        cesium.url = val;
      },
      opacity(val, newVal) {
        cesium.alpha = val;
      },
      layerIndex(val, newVal) {
        let diff = cesium._layerIndex - val
        for(let i=0; i<Math.abs(diff); i++){
          if(diff > 0){
            imageryLayers.lower(cesium)
          }else{
            imageryLayers.raise(cesium)
          }
        }
      },
      visible(val, newVal) {
        cesium.show = val;
      }
    },
    beforeDestroy() {
      cesium && imageryLayers.remove(cesium, true);
    },
    methods: {
      _initHooks() {
        const layer = new Cesium.ArcGisMapServerImageryProvider({
          url : this.url,
          enablePickFeatures: true,
          tileHeight: this.tileHeight,
          tileWidth: this.tileWidth,
          layers: this.layers
        });
        imageryLayers = window.viewer.imageryLayers;
        cesium = imageryLayers.addImageryProvider(layer);
      }
    }
  }
</script>
