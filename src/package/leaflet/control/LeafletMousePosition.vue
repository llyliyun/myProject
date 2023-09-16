<template>
  <div class="mouse-position" :class="{'bottomright':position === '' || position === 'bottomright','bottomleft':position === 'bottomleft',
  'topright':position === 'topright','topleft':position === 'topleft'}"></div>
</template>

<script>

export default {
  name: 'LeafletMousePosition',
  mounted() {
    if (this.$parent._isMounted) {
      this._initHooks();
    }
  },
  props: {
    position: {
      type: String,
      default: ''
    },
    fixed: {
      type: Number,
      default: 0
    }
  },
  methods: {
    _initHooks() {
      let self = this
      this.fn = function (e) {
        self.$el.innerText = e.latlng.lng.toFixed(2) + ', ' + e.latlng.lat.toFixed(2);
      }
      this.fn = this.$parent.leaflet.on('mousemove', this.fn);
    },
  },
  beforeDestroy() {
    this.$parent.leaflet.off('mousemove',this.fn)
  },
}
</script>

<style lang="scss">
  .mouse-position{
    position: absolute;
    font-family: Arial,'Microsoft YaHei',sans-serif;
    font-size: smaller;
    z-index: 499
  }
  .bottomright{
    right: 0;
    bottom: 0;
    background-color: rgba(255,255,255,0.7);
    padding: 0px 6px;

  }
  .bottomleft{
    left: 0;
    bottom: 0
  }
  .topright{
    right: 0;
    top: 0
  }
  .topleft{
    top: 0;
    left: 0
  }
</style>
