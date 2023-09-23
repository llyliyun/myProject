<template>
</template>
<script>
  export default {
    mounted() {
      EventBus.$on("startBuildSimulate", this.startBuildSimulate);
      EventBus.$on("cancelBuildSimulate", this.cancelBuildSimulate);
    },
    beforeDestroy(){
      EventBus.$off("startBuildSimulate", this.startBuildSimulate);
      EventBus.$off("cancelBuildSimulate", this.cancelBuildSimulate);
    },
    data() {
      return {
        isShowH: false,
      }
    },
    methods: {
      cancelBuildSimulate() {
        if (this.isShowH) {
          let polygonEntity = Viewer.entities.getById(this.buildingId); //Viewer.entities.values[0];
          polygonEntity.polygon["extrudedHeight"] = 95;
        } else {
          Viewer.entities.removeById(this.buildingId);
        }
        EventBus.$emit("showBuildigHeightValue", 0);
      },
      async startBuildSimulate() {
        var polygonEntity = Viewer.entities.getById(this.buildingId);
        //Viewer.entities.values[0];
        if (this.isShowH) {
          let toHeight = this.buildingHeight + 95;
          let currentHeight = 95;
          let interHeight = (toHeight - currentHeight) / 5;
          var intervalId = window.setInterval(function() {
            try {
              if (toHeight - currentHeight <= interHeight) {
                polygonEntity.polygon["extrudedHeight"] = toHeight;
                EventBus.$emit("showBuildigHeightValue", toHeight - 95);
                window.clearInterval(intervalId);
              } else {
                currentHeight = currentHeight + interHeight;
                polygonEntity.polygon["extrudedHeight"] = currentHeight;
              }
            } catch (e) {
              window.clearInterval(intervalId);
            }
          }, 1000);
        } else {
          Viewer.entities.removeById(this.buildingId);
        }
      },
    }
  }
</script>
