<template>

</template>

<script>
  import mixin from './mixins/mixin'
  import { SuperMap2DImagryProvider } from './SuperMap2DImagryProvider.js'
  const events = [
    'loading',
    'tileunload',
    'tileloadstart',
    'tileerror',
    'tileload',
    'load',
    'add',
    'remove',
  ]

  const props = {
    format: {
      type: String,
      default: 'image/png'
    },
    transparent: {
      type: Boolean,
      default: true
    },
    opacity: {
      type: Number
    },
    layerIndex: {
      type: Number
    },
    visible:{
      type:Boolean,
    },
    options: {
      type: Object,
      default: () => {}
    },
    resID: {
      type: String
    },
  }

  let imageryLayers;

  export default {
    name: 'CRestTilelayer',
    mixins: [mixin],
    props: {
      ...props,
      url: {
        type: String,
        default: '',
        required: true
      },
      prjTrans: {
        type: Boolean,
        default: false
      }
    },
    mounted() {
      if (!this.prjTrans) {
        this._provider = new Cesium.SuperMapImageryProvider({
          url : this.url
        });
      } else {
        let promise = SuperMap2DImagryProvider(Viewer, this.url, {prjCoordSys: 4326});
        let _this = this
        promise.then(function(data) {
          _this._cesium = data
        });
      }
      if (this.$parent._isMounted) {
        this._initHooks();
      }
    },
    watch: {
      url(val, newVal) {
        this._cesium.url = val;
      },
      opacity(val, newVal) {
        this._cesium.alpha = val;
      },
      layerIndex(val, newVal) {
        let diff = this._cesium._layerIndex - val
        for(let i=0; i<Math.abs(diff); i++){
          if(diff > 0){
            imageryLayers.lower(this._cesium)
          }else{
            imageryLayers.raise(this._cesium)
          }
        }
      },
      visible(val, newVal) {
        this._cesium.show = val;
      }
    },
    beforeDestroy() {
      if(imageryLayers){
        this._cesium && imageryLayers.remove(this._cesium, true);
      }
    },
    methods: {
      _initHooks() {
        imageryLayers = Viewer.imageryLayers
        if(this._provider) this._cesium = imageryLayers.addImageryProvider(this._provider);
      }
    }
  }
</script>
