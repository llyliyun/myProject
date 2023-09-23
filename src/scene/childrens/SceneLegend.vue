<template>
  <div :class="showMapLegend?'maplegend-box expansion':'maplegend-box shrink'" v-show="legends.length > 0">
    <div v-if='showMapLegend' class="map-legend-wrapper">
      <div class="map-legend-header" style="background: rgba(121, 142, 162, 0.1);">
        <span style="font-weight: bold;color: #1664ac;">图例</span>
        <i class="fa fa-compress secene-icon"  @click="miniMapLegend"></i>
      </div>
      <div class="map-legend-content">
        <div v-for="(item, index) in legends" :key="item.url+index">
          <span class="name-span" :title="item.name">
            <span class="text">{{item.name}}</span>
          </span>
          <template v-if="!item.legend.length">
            <div class="block">
              暂无配置图例
            </div>
          </template>
          <template v-else>
            <ul class="map-legend-ul">
              <li v-for="(le, index) in item.legend" style="line-height:30px;" :key="index" class="map-legend-list">
                <template v-if="le.color !== undefined">
                  <span class="legend-back" :style="{
                    background:'rgba('+le.color.red+','+le.color.green+','+le.color.blue+','+le.color.alpha+')'
                  }"></span>
                </template>
                <template v-else>
                  <img  :src="le.imgurl" style="width:30px;height:20px;"/>
                </template>
                <span :title="le.caption">{{le.caption}}</span>
              </li>
            </ul>
          </template>
        </div>
      </div>
    </div>
    <div class="shrink-maplegeng" v-if="!showMapLegend">
      <div class="maplegend-num">
        <i class="fa  fa-area-chart" style="color: #1664ac;"></i>
        <span>图例({{layerNum}})</span>
      </div>
      <i class="fa  fa-expand maplegend-max" @click="maxMapLegend"></i>
    </div>
  </div>
</template>
<script>
import {
  mapState,
  mapMutations
} from 'vuex'
import {
  serviceMgr
} from '@/utils/serviceMeta.js';
export default {
  data(){
    return{
      legends: [],
      showMapLegend:true,
      layerNum:0
    }
  },
  watch: {
    cSpecialLayer: {
      handler(val, oldVal) {
        let afterleg = [];
        let leg = []
        val.forEach((item) => {
          if(!item.noClear){
            leg.push(item)
          }
        })
        this.layerNum = leg.length
        let self = this;
        for (var i = leg.length - 1; i >= 0; i--) {
          if(leg[i].layerType === 'SMRESTMAP' || leg[i].restLayer){
            if(leg[i].url.indexOf("rest") === -1) leg[i].url = leg[i].restLayer
            if(!leg[i].noClear)
            afterleg.push(leg[i])
          }
        }
        afterleg = JSON.parse(JSON.stringify(afterleg));
        this.legends = afterleg;
        if(self.legends.length){
          for(let i=0; i<self.legends.length; i++){
            if((self.legends[i].restLayer || self.legends[i].layerType.indexOf("REST") > -1) && self.legends[i].legend && self.legends[i].legend.length == 0){
              serviceMgr.getLegend(self.legends[i].url, function(res) {
                if(self.legends.length > 0)
                self.legends[i].legend = res;
              })
            }
          }
        }
      },
      deep: true
    }
  },

  computed: {
    ...mapState({
      //cSpecialLayer: state => state.scene.cSpecialLayers,
      cSpecialLayer: state => state.scene.cSpecialLayers,
    })
  },
  mounted(){
    console.log(this.cSpecialLayer)
  },
  methods:{
    miniMapLegend(){
      this.showMapLegend = false
    },
    maxMapLegend(){
      this.showMapLegend = true
    }
  }
}
</script>
<style lang="scss">
.maplegend-box{
  position: absolute;
  bottom: 10px;
  left: 51px;
  z-index: 999;
  background-color: #F5F7FA;
  /*box-shadow: 0 0 8px #ddd;*/
  .map-legend-wrapper{
    width: 462px;
    font-size: 14px;
    /*background: rgba(1, 25, 50, 0.6) !important;*/
    .map-legend-header{
      width: 100%;
      height: 42px;
      line-height: 42px;
      background: rgba(251, 253, 255, 0.1);
      padding:0 10px;
      .secene-icon{
        float: right;
        margin-top: 14px;
        color: #1664ac;
        cursor: pointer;
      }
    }
    .map-legend-content{
      max-height: 218px;
      overflow-y: auto;
      padding: 0 10px;
      .name-span{
        line-height: 34px;
      }
      .map-legend-ul{
        overflow: hidden;
        .map-legend-list{
          width: 33%;
          float: left;
          span{
            float: right;
            width: 66%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
    }
  }
  .shrink-maplegeng{
    width: 114px;
    height: 30px;
    padding:10px;
    overflow: hidden;
    // background: rgba(1, 40, 79, 0.8);
    font-size: 12px;
    .maplegend-num{
      float: left;
      border-right: 1px solid rgba(22, 100, 172, 0.7);
      //border-right: 1px solid #1664ac;
      padding-right: 10px;
      color: #1664ac;
      font-weight: bold;
    }
    .maplegend-max{
      float:right;
      color: #1664ac;
      cursor: pointer;
    }
  }
}
.maplegend-box.expansion{
  /*border:2px solid #0BABD1!important;*/
  border-radius: 3px;
  bottom:10px!important;
  left:260px!important;
}
.maplegend-box.shrink{
  border:0!important;
  border-radius: 3px;
  bottom:0!important;
  left:130px!important;
}
</style>

