<template>

</template>

<script>
  /**
   * Cesium WMS图层组件实现类   http://support.supermap.com.cn:8090/webgl/Build/Documentation/WebMapServiceImageryProvider.html
   */
  import mixin from './mixins/mixin'

  const props = {
    url: {
      type: String,
      default: '',
      required: true
    },
    version: {
      type: String,
      default: '1.1.1'
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
    name: 'CWmsImageryprovider',
    mixins: [mixin],
    props: {
      ...props,
      options: {
        type: Object,
        default: () => {}
      }
    },
    mounted() {

      let options = this.mixinOptions(this._props, props);
      if(!options.layers){
        options.layers = '0';
      }
      this.provider = new Cesium.WebMapServiceImageryProvider(options);

      if (this.$parent._isMounted) {
        this._initHooks();
      }
    },
    watch: {
      visible(val) {
        if (this.cesium) {
          this.cesium.show = val;
        }
      },
      opacity(val) {
        if (this.cesium) {
          this.cesium.alpha = val;
        }
      },
      zIndex(val) {
        let diff = this.cesium._layerIndex - val
        for(let i=0; i<Math.abs(diff); i++){
          if(diff > 0){
            imageryLayers.lower(this.cesium)
          }else{
            imageryLayers.raise(this.cesium)
          }
        }
      }
    },
    methods: {
      _initHooks() {
        imageryLayers = window.viewer.imageryLayers;
        this.cesium = this.zIndex ? imageryLayers.addImageryProvider(this.provider, this.zIndex) : imageryLayers.addImageryProvider(this.provider);
      },
      mixinOptions(_props, propsObj) {
        let options = Object.assign({}, _props['options'] || {});
        let keys = Object.keys(propsObj);
        keys.forEach(key => {
          if (key == 'version' && _props[key]) {

            let parameters = _props['parameters'] || {},
              defaultParameter = {
                format: 'image/png',
                request: 'GetMap',
                service: 'WMS',
                styles: '',
              }
            if (_props[key] == '1.1.1') {
              defaultParameter.version = '1.1.1';
            } else if (_props[key] == '1.3.0') {
              defaultParameter.version = '1.3.0';
            }

            parameters = Object.assign(defaultParameter, parameters);
            options.parameters = parameters;
          } else if (key == 'visible') {
            options.show = _props['visible'];
          } else if (key == 'opacity') {
            options.alpha = _props['opacity'];
          } else {
            options[key] = _props[key];
          }
        })
        options['tilingScheme'] = new Cesium.GeographicTilingScheme();
        return options;
      }
    },
    beforeDestroy() {
      this.cesium && imageryLayers.remove(this.cesium, true);
    }
  }
</script>
