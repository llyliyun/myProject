<template>
  <div class="shadows-legend">
    <div class="color-panel">
      <div class="color-item" v-for="(item, index) in legendArr">
        <div :style="{backgroundColor:item.changeColor}" class="itemcolor"></div>
        <!-- <span>{{item.value}}</span> -->
        <span>光照时间：{{item.value}}</span>
      </div>
    </div>
  </div>
</template>
<script>
import {
  mapState,
  mapMutations,
  mapActions
} from 'vuex'
export default {
  data(){
    return {
      isShow: false,
      legendArr:[{
          changeColor: "#0000FF",
          value: "0",
          lightRate: "0"
        },{
          changeColor: "#00FFFF",
          value: "0",
          lightRate: "0.25"
        },{
          changeColor: "#00FF00",
          value: "0",
          lightRate: "0.50"
        },{
          changeColor: "#FFFF00",
          value: "0",
          lightRate: "0.75"
        },{
          changeColor: "#FF0000",
          value: "0",
          lightRate: "1"
        }
      ]
    }
  },
  watch:{
    
  },
  computed: {
    
  },
  mounted(){
    
  },
  destroyed() {
    
  },
  methods:{
    shadowsLegend(starttime, endtime){
      let that = this;
      if(starttime && endtime){
        let timeDiff = parseInt(endtime.split(":")[0]) - parseInt(starttime.split(":")[0]);
        that.legendArr.forEach((item, index) => {
          let lightHour = item.lightRate * timeDiff;
          if(lightHour == 0){
            item.value = 0;
          }else if(lightHour > 0 && lightHour < 1){
            let lightMin = lightHour * 60;
            item.value = lightMin + "分";
          }else if(lightHour >= 1 && lightHour % 1 === 0){
            item.value = lightHour + "时";
          }else if(lightHour > 1){
            item.value = parseInt(lightHour / 1) + "时" + lightHour % 1 * 60 + "分"
          }
        })
      }
    }
  }
}
</script>

<style lang="scss">
  .shadows-legend {
    position: fixed;
    left: 451px;
    bottom: 20px;
    z-index: 9999 !important;
    font-size: 12px;
    .color-panel {
      float: right;
      .color-item {
        color: #fff;
        font-size: 14px;
        padding: 5px;
        .itemcolor {
          float: left;
          width: 33px;
          height: 13px;
          margin-right: 5px;
        }
      }
    }
  } 
</style>

