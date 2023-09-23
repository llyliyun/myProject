<template>
  <section class="terrain-height-wrapper" @click="changeTerrainHeightPanel" v-if="showPanel">
    {{terrainHeight}}
  </section>
</template>
<script>
export default {
  data(){
    return {
      terrainHeight:0,
      showPanel:false
    }
  },
  mounted(){
    let self = this
    EventBus.$on('current-terrain-height',(height) => {
      self.terrainHeight = height.toFixed(2)
      self.showPanel = true
    })
  },
  beforeDestroy(){
    EventBus.$off('current-terrain-height',(height) => {
      self.terrainHeight = height.toFixed(2)
      self.showPanel = true
    })
  },
  methods:{
    changeTerrainHeightPanel(){
      this.showPanel = false
      EventBus.$emit('remove-input-action')
    }
  }
}
</script>

<style lang="scss">
.terrain-height-wrapper{
  position: absolute;
  right: 10px;
  top: 110px;
  padding: 5px 10px;
  background-color: rgba(40, 40, 40, 0.7);;
  border-radius: 5px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
}
</style>
