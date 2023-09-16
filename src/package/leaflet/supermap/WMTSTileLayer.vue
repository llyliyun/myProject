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
    opacity: {
      type: Number,
      default: 1
    },
    crs: {
      type: Object,
    },
    zIndex: {
      type: Number,
    },
    visible:{
      type:Boolean
    },
    options: {
      type: Object,
      default: () => {}
    }
  }

  export default {
    name: 'LWmtsTilelayer',
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
      /**
       * 河南省平台兼容影像统筹wmts服务
       */
      var res = [];
      var matrixIdsValue=[], matrixIdsValue96=[];
      var resolution = this._props.options.resolutions[0].toString().slice(0,this._props.options.resolutions[0].toString().indexOf('.')+4);
      for (var i = 0; i < 21; i++) {
          res.push(0.703125 / (Math.pow(2, i)));
          matrixIdsValue[i] = {identifier : i +""};
          matrixIdsValue96[i] = {identifier : i + 1 +""};
      }
      layerOptions.resolutions = res;
      if(this._props.options.resolutions[0] >= 1.4 && this._props.options.resolutions[0] <= 1.5){
        layerOptions.matrixIds = matrixIdsValue96;
      }else if(resolution == "0.703" || resolution == "7.031"){
        layerOptions.matrixIds = matrixIdsValue;
      }
      /* 兼容影像统筹wmts服务 end */
      this.leaflet = L.supermap.wmtsLayer(this.url, layerOptions);
      //this.leaflet = this._adaptLayer(this.url, layerOptions);
      this.addEventHook(this.leaflet, events);
      if (this.$parent._isMounted) {
        this._initHooks(this.$parent.leaflet);
      }
    },
    watch: {
      url(val, newVal) {
         this.leaflet.setUrl(val);
      },
      opacity(val, newVal) {
         this.leaflet.setOpacity(val);
      },
      zIndex(val, newVal) {
         this.leaflet.setZIndex(val);
      },
      visible(val, newVal) {
        let parent = this.$parent.leaflet;
        if (parent) {
          if(val){
            this.leaflet.addTo(parent);
          } else {
            this.leaflet.remove();
          }
        }
      },
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
      _adaptLayer(url, options) {
        let { format, layer, tilematrixSet } = options;
        if (format = 'tiles' && tilematrixSet == 'c') {
          switch (layer) {
            case 'vec':
              return L.supermap.tiandituTileLayer({
                layerType: 'vec'
              })
              break;
            case 'img':
              return L.supermap.tiandituTileLayer({
                layerType: 'img'
              })
              break;
            case 'cva':
              return L.supermap.tiandituTileLayer({
                layerType: 'vec',
                isLabel: true
              })
              break;
            case 'cia':
            return L.supermap.tiandituTileLayer({
                layerType: 'img',
                isLabel: true
              })
              break;
            default:
              return L.supermap.wmtsLayer(url, options);
          }
        } else {
          return L.supermap.wmtsLayer(url, options);
        }
      }
    }
  }
</script>
