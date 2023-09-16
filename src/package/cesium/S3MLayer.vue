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
    name: {
      type: String
    },
    focus: {
      type: Boolean
    }
  }

  export default {
    name: 'CS3MLayer',
    mixins: [mixin],
    props: {
      ...props,
      options: {
        type: Object,
        default: () => {}
      }
    },
    mounted() {
      this.tempLayerName = this.name || this.url;
      let options = this.mixinPropOption(this._props, props, this.zIndex);
      if(!options.name){
        options.name = this.tempLayerName;
      }
      if (this.$parent._isMounted) {
        let promise = Viewer.scene.addS3MTilesLayerByScp(this.url+"/config",options)
        promise.then((layer) => {
          if (this.options.hasOwnProperty('selectEnabled') && !this.options.selectEnabled) {
            layer.selectEnabled = false;
          }
          this.cesium = layer;
          if (this.focus) {
            Viewer.zoomTo(layer);
          }
        });
      }
    },
    watch: {
      opacity(val, newVal) {
        this.cesium.style3D.fillForeColor.alpha = val;
      },
      visible(val, newVal) {
        this.cesium.visible = val;
      }
    },
    methods: {
    },
    beforeDestroy() {
      this.cesium && Viewer.scene.layers.remove(this.tempLayerName);
    }
  }
</script>
