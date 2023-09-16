<template>

</template>

<script>
  // import L from 'leaflet'
  import mixin from './../mixins/mixin'

  const events = [
    'loading',
    'tileunload',
    'tileloadstart',
    'tileerror',
    'tileload',
    'load',
    'add',
    'remove',
    'popupopen',
    'popupclose',
    'tooltipopen',
    'tooltipclose'
  ]

  const props = {
    format: {
      type: String,
      // default: 'image/png' //override the leaflet default value
    },
    transparent: {
      type: Boolean,
      default: true
    },
    opacity: {
      type: Number,
    },
    crs: {
      type: Object,
      default: null
    },
    tileSize: {
      type: Number,
      default: 512
    },
    zIndex: {
      type: Number,
    },
    visible:{
      type:Boolean
    },
    layersID: {
      type: String,
    },
    options: {
      type: Object,
      default: () => {}
    },
  }

  export default {
    name: 'LTimeServicLayer',
    mixins: [mixin],
    props: {
      ...props,
      url: {
        type: String,
        default: '',
        required: true
      },
    },
    mounted() {
      let layerOptions = this.mixinPropOption(this._props, props);
      if (layerOptions.layersID) {
        layerOptions.layersID = this.convertLayerName(layerOptions.layersID);
      }
      this.leaflet = L.supermap.tiledMapLayer(this.url, layerOptions);
      
      this.leaflet._paramsChanged = true;

      this.addEventHook(this.leaflet, events);

      if (this.$parent._isMounted) {
        this._initHooks(this.$parent.leaflet);
      }
    },
    watch: {
      url(val, newVal) {
        if (this.layersID) {
          let _layersID = this.convertLayerName(this.layersID);
          if (_layersID) {
            this.leaflet.requestParams.layersID = _layersID;
          }
        }
        this.leaflet.setUrl(val);
      },
      opacity(val, newVal) {
        this.leaflet.setOpacity(val);
      },
      zIndex(val, newVal) {
        if(this.leaflet){
          this.leaflet.setZIndex(val);
        }
      },
      visible(val, newVal) {
        let parent = this.$parent.leaflet;
        if (parent && this.leaflet) {
          if(val){
            this.leaflet.addTo(parent);
          } else {
            this.leaflet.remove();
          }
        }
      }
    },
    beforeDestroy() {
      let parent = this.$parent.leaflet;
      if (parent) {
        parent.removeLayer(this.leaflet);
      }
    },
    methods: {
      _initHooks(parent) {
        this.leaflet.addTo(parent);
      },
      convertLayerName(layerName) {
        if (!layerName || layerName.indexOf(':') == -1) {
          return null;
        }
        let splitLayerName = layerName.split(',');
        let idsName = '[0:';
        splitLayerName.forEach((item, index) => {
          index == 0 ? idsName += item.split(":")[1] : idsName += ',' + item.split(":")[1];
        })
        idsName += ']';
        return idsName;
      }
    }
  }
</script>
