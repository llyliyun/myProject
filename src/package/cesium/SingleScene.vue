<template>
  
</template>

<script>
  // 添加
  import mixin from './mixins/mixin'
  let _layers = [];
  export default {
    name: 'SingleScene',
    // 添加
    mixins: [mixin],
    props:{
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
      options: {
        type: Object,
        default: () => {}
      }
    },
    mounted() {
     // 添加
     let _option = {};
     if (this.options.subdomains && this.options.subdomains.length > 1) {
       _option.subdomains = this.options.subdomains;
     }
     let promise = Viewer.scene.open(this.url, undefined, _option);
     promise.then((layers) => {
        this._layers = layers;
     })
      // let promise = Viewer.scene.open(this.url)
      // promise.then((layers) => {
      //   this._layers = layers;
      // });
    },
    watch: {
      opacity(val, newVal) {
        this._layers.forEach((item) => {
          if(item.style3D){
            item.style3D.fillForeColor.alpha = val;
          } else if(item.alpha){
            item.alpha = val;
          }
        })
      },
      visible(val, newVal) {
        this._layers.forEach((item) => {
          item.visible = val;
          item.show = val;
        })
      }
    },
    methods: {
    },
    beforeDestroy() {
      if(this._layers){
        this._layers.forEach((item) => {
          if(item.imageryProvider){
            Viewer.imageryLayers.remove(item, true);
          } else if(item._isSct){
            Viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider({});
          } else {
            Viewer.scene.layers.remove(item.name)
          }
        })
      }
    }
  }
</script>
