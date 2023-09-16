<template>
  
</template>

<script>
  let terrainProvider,originTerrain;
  const props = {
    url: {
      type: String,
      default: '',
      required: true
    },
    isSct: {
      type: Boolean,
      default: true
    },
    visible: {
      type: Boolean
    },
    opacity: {
      type: Number
    },
    zIndex: {
      type: Number
    }
  }

  export default {
    name: 'CesiumTerrain',
    props: {
      ...props,
      options: {
        type: Object,
        default: () => {}
      }
    },
    mounted() {
      originTerrain = Viewer.terrainProvider;
      
      terrainProvider = new Cesium.CesiumTerrainProvider({
        url :this.url,
        isSct : this.isSct//地形服务源自SuperMap iServer发布时需设置isSct为true
      })

      if (this.$parent._isMounted) {
        Viewer.terrainProvider = terrainProvider
      }
    },
    watch: {
      visible(val) {
        if(val){
          terrainProvider = new Cesium.CesiumTerrainProvider({
            url :this.url,
            isSct : this.isSct//地形服务源自SuperMap iServer发布时需设置isSct为true
          })
          Viewer.terrainProvider = terrainProvider
        } else {
          Viewer.terrainProvider = originTerrain;
        }
      }
    },
    beforeDestroy() {
      Viewer.terrainProvider = originTerrain;
    }
  }
</script>
