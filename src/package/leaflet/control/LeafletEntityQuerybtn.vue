<template>
</template>

<script>
  import './../plugins/leaflet-entity-querybtn.js'
  import './../plugins/leaflet-entity-querybtn.css'

  export default {
    name: 'LEntityQuerybtnControl',
    mounted() {
      this.leaflet = L.control.querybtn2({fn: this.initEvent})
      if (this.$parent._isMounted) {
        this._initHooks(this.$parent);
      }
    },
    props: {
      fn: {
        type: Function
      }
    },
    methods: {
      _initHooks($parent) {
        this.leaflet.addTo($parent);
        // this.initEvent($parent);
      },
      initEvent(map) {
        this.$emit('l-entity-query-compelete');
      },
    },
    beforeDestroy() {
      this.leaflet.remove();
      // this.leaflet = null;
    },
  }
</script>

<style lang="css">
</style>
