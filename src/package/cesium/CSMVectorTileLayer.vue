<template>

</template>

<script>
  import mixin from './mixins/mixin'

  let layer = null,provider = null;

  export default {
    name: 'CSMVectorTileLayer',
    mixins: [mixin],
    props: {
      url: {
        type: String,
        default: '',
        required: true
      }
    },
    mounted() {
      if (this.$parent._isMounted) {
        this._initHooks();
      }
    },
    beforeDestroy() {
      Viewer.scene && Viewer.scene.removeVectorTilesMap(this.url);
      layer = null;
    },
    methods: {
      _initHooks() {
        layer = Viewer.scene.addVectorTilesMap({
          url: this.url,
          canvasWidth: 512,
          name: this.url,
          viewer: Viewer
        });
      }
    }
  }
</script>
