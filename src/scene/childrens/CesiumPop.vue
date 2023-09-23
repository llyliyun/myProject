<template>
  <div class="cesium-pop">
    <functional-table
      
    ></functional-table>
  </div>
</template>

<script>
  import FunctionalTable from './FunctionalTabel'

  export default {
    components: {
      FunctionalTable
    },
    objData: {
      type: Object,
      default () {
        return {}
      }
    },
    //是否过滤sm默认系统字段
    filterSM: {
      type: Boolean,
      default: true
    },
    //是否过滤非中文字段
    filterChinese: {
      type: Boolean,
      default: false
    },
  }
</script>

<style lang="scss">
  .cesium-pop {
    
  }
</style>