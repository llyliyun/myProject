<template>

</template>

<script>
  import mixin from './mixins/mixin'

  const props = {
    url: {
      type: String,
      default: '',
      required: true
    },
    visible: {
      type: Boolean
    },
    opacity: {
      type: Number
    },
    zIndex: {
      type: Number
    },
  }

  let imageryLayers;

  export default {
    name: 'CWmtsImageryprovider',
    mixins: [mixin],
    props: {
      ...props,
      options: {
        type: Object,
        default: () => {}
      }
    },
    mounted() {
      EventBus.$on("showDOM",(a)=>{
        if(this.provider._layer == APPCONFIG.DOMLayer){
          if(a){
            this.cesium.alpha = 0;
          }else{
            this.cesium.alpha = 1;
          }
        }
      })
      let options = this.mixinOptions(this._props, props);
      this.provider = new Cesium.WebMapTileServiceImageryProvider(options);

      if (this.$parent._isMounted) {
        this._initHooks();
      }
    },
    methods: {
      _initHooks() {
        imageryLayers = Viewer.imageryLayers;
        this.cesium = imageryLayers.addImageryProvider(this.provider);
        if(this.provider._layer == APPCONFIG.DOMLayer){
          this.cesium.alpha = 0;
        }
        //this.cesium = this.zIndex ? imageryLayers.addImageryProvider(provider, this.zIndex) : imageryLayers.addImageryProvider(provider);
      },
      mixinOptions(_props, propsObj) {
        let options = Object.assign({}, _props['options'] || {});
        let keys = Object.keys(propsObj);
        keys.forEach(key => {
          if (key == 'visible') {
            options.show = _props['visible'];
          } else if (key == 'opacity') {
            options.alpha = _props['opacity'];
          } else {
            options[key] = _props[key];
          }
        })
        //三维加载去掉0级
        let needDeleteFirst =false;
        if (options.resolutions && options.resolutions[0].toFixed(1) == 1.4) {
          options.resolutions.splice(0, 1);
          if (options.scales && options.scales.length) {
            options.scales.splice(0, 1);
          }
          needDeleteFirst = true;
        }
        if (options['tilematrixSet']) {
          options['tileMatrixSetID'] = options['tilematrixSet'];
          delete options['tilematrixSet'];
        }
        if (options['identifier'] && options['identifier'].length) {
          options['tileMatrixLabels'] = options['identifier'];
          //三维加载去掉0级
          if (needDeleteFirst) {
            options['tileMatrixLabels'].splice(0, 1);
          }
        } else {
          options['tileMatrixLabels'] = [];
          let _identArr = (options.resolutions && options.resolutions.length)?options.resolutions : options.scales;
          _identArr.forEach((item, index) => {
            options['tileMatrixLabels'][index] = index + 1;
          })
        }
        options.maximumLevel = options['tileMatrixLabels'].length -1;
        delete options['identifier'];
        options['tilingScheme'] = new Cesium.GeographicTilingScheme();
        //options.maximumLevel = options['tileMatrixLabels'].length -1;
        if (options.subdomains && options.subdomains.length) {
          let urlSuffix = `tilematrix={TileMatrix}&layer=${options.layer}&style=default&tilerow={TileRow}&tilecol={TileCol}&tilematrixset=${options['tileMatrixSetID']}&format=${options.format}&service=WMTS&version=1.0.0&request=GetTile`;
          let ipArr = options.subdomains[0].split(":"),
            urlArr = options.url.split('\/\/'),
            _url = urlArr[0] + '//' + ipArr[0] + ":" + urlArr[1];
          // 设定mule Ip统一，动态端口号
          options.subdomains = options.subdomains.map(item => item.split(':')[1]);
          if (options.url.indexOf('?') > -1) {
            options.url = _url + '&' + urlSuffix;
          } else {
            options.url = _url + "?" + urlSuffix;
          }
        }
        return options;
      }
    },
    watch: {
      url(val, newVal) {
        this.cesium.url = val;
      },
      opacity(val, newVal) {
        this.cesium.alpha = val;
      },
      zIndex(val, newVal) {
        let diff = this.cesium._layerIndex - val
        for(let i=0; i<Math.abs(diff); i++){
          if(diff > 0){
            imageryLayers.lower(this.cesium)
          }else{
            imageryLayers.raise(this.cesium)
          }
        }
      },
      visible(val, newVal) {
        this.cesium.show = val;
      }
    },
    beforeDestroy() {
      EventBus.$off("showDOM");
      this.cesium && imageryLayers.remove(this.cesium, true);
    },
  }
</script>
