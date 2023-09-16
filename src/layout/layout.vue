<template>
  <el-container>
    <v-map class="v-map" v-if="compareMapShow" />
    <v-map2 class="v-map2" v-if="!compareMapShow" />
    <tab-list class="result-table"></tab-list>
    <div class="base-map-control" @mouseover="mapiconMouseOver()" @mouseout="mapiconMouseOut()">
      <ul>
        <div class="base-back"></div>
        <li v-for="(item, index) in baseMapLayersGroup" :key="index" style="position: absolute;right: 0;" :index="index" :value='item.pkid' @click="changeBaseMap(index,item)">
          <div><img :src="item.imgUrl"></div>
          <span :class='item.icon'>
            <div class='map-icons-font' :title='item.name'>{{item.name}}</div>
          </span>
        </li>
      </ul>
    </div>
    <div class="time-line" v-show="selectLayer.openTime&&showLine">
      <!-- <div class="layer-title">多期影像</div> -->
      <time-line style="height: 50px;width: 100%" :timeline="timeline" @l-timelinechanged="timelineChanged"></time-line>
    </div>
    <div v-show="selectLayer.openTime" class="colseImg">
      <img src="../../static/img/next.png" alt="" class="timeImg"  v-show="showLine" @click="showTimeLine(false)">
      <img src="../../static/img/left.png" alt="" class="timeImg" v-show="!showLine" @click="showTimeLine(true)">
    </div>
    <el-main>
      <!--      <el-header>-->
      <!-- <v-header class="v-header" /> -->
      <!--      </el-header>-->
      <div class="v-content">
        <!-- <v-tool /> -->
        <seachart ref="seachart" :compareMapShow="compareMapShow" />

        <!-- <router-view></router-view> -->
      </div>
    </el-main>
  </el-container>
</template>

<script>
import map from "./map.vue";
import map2 from "./map2.vue";
import tool from "./tool.vue";
import seachart from "./seachart.vue";
import header from "./header.vue";
import timeLine from "./timeLine.vue";
import TabList from "./commont/TabList.vue";

import { 
  mapMutations, mapState
} from 'vuex'
export default {
  components: {
    "v-header": header,
    "v-map": map,
    "v-tool": tool,
    seachart,
    "v-map2": map2,
    timeLine,
    TabList
  },
  data() {
    return {
      compareMapShow: false,
      laymaplist: null,
      selectLayer:{},
      timeline:{},
	  showLine:true,
      mIndex:0,
      resultList:[]
    };
  },

  created() {
    this.compareMapShow = false;
  },
  computed:{
    ...mapState({
      baseMapLayersGroup:state => state.map.baseMapLayersGroup,
    })
  },
  watch: {
      selectLayer(newVal, oldVal) {
        this.timeline = {};
        const dataArr = [];
        if(newVal.openTime){
          newVal.verLayers.map(item=>{
            dataArr.push(item.version)
          })
        }
        this.timeline.data = dataArr;
        this.timeline.currentIndex = 0;
      },
  },
  methods: {
    ...mapMutations([
	   'changeMapMode',
      'changeCurrentBaseMapIndex',
      'handleMiniMapIndex',
    ]),
    /**日期切换事件 */
    timelineChanged(item){
      EventBus.$emit('baseMapChange',this.baseMapLayersGroup.length-1,item.currentIndex);
    },

    //底图列表切换
    changeBaseMap(index, item) {
      this.selectLayer = item;
      this.selectLayer.mapIndex = index;
      if(item.verLayers.length > 1){
        this.selectLayer.openTime = true
      }else{
        this.selectLayer.openTime = false
      }
      // console.log(this.baseMapLayersGroup)
      // let newMap = this.laymaplist[index];
      // this.laymaplist.splice(index,1)
      // this.laymaplist.push(newMap);
      
      let type = item.type;
      EventBus.$emit('baseMapChange',index,this.mIndex);
      // this.changeSplitScreen(false);
      if (type == 'scene') {
        this.changeMapMode('3d');
        this.changeCurrentBaseMapIndex(this.baseMapLayersGroup.length - index - 1);
      } else {
        this.changeMapMode('2d');
        this.changeCurrentBaseMapIndex(this.baseMapLayersGroup.length - index - 1);
      }
    },

    laymapclick(index,item) {
      this.selectLayer = item;
      if (item.index == 1) {
        this.compareMapShow = false;
        setTimeout(() => {
          let wmts = {
            center: {
              x: 113.61923217773438,
              y: 34.739112854003906,
              maxZoom: 18,
              zoom: 7,
            },
            url: "http://t0.tianditu.gov.cn/vec_c/wmts?tk=685315d34dfbdae548cd4a33dffa55c4",
            options: {
              layer: "vec",
              style: "default",
              tilematrixSet: "c",
              format: "tiles",
            },
            zjurl:
              "http://t0.tianditu.gov.cn/cva_c/wmts?tk=685315d34dfbdae548cd4a33dffa55c4",
            zjoptions: {
              layer: "cva",
              style: "default",
              tilematrixSet: "c",
              format: "tiles",
            },
            resolutions: [
              1.40625, 0.703125, 0.3515625, 0.17578125, 0.087890625,
              0.0439453125, 0.02197265625, 0.010986328125, 0.0054931640625,
              0.00274658203125, 0.001373291015625, 0.0006866455078125,
              0.00034332275390625, 0.000171661376953125, 0.0000858306884765625,
              0.00004291534423828125, 0.000021457672119140625,
              0.000010728836059570312, 0.000005364418029785156,
              0.000002682209014892578, 0.000001341104507446289,
            ],
          };
          wmtsyxlayer = new L.supermap.TiandituTileLayer({
            key: "1d109683f4d84198e37a38c442d68311",
          }).addTo(hcmap);
          wmtszjlayer = new L.supermap.TiandituTileLayer({
            isLabel: true,
            key: "1d109683f4d84198e37a38c442d68311",
          }).addTo(hcmap);
        }, 50);
      } else if (item.index == 2) {
        setTimeout(() => {
          this.compareMapShow = false;
          const layerObj = item.historyLayer[0];
          wmtsyxlayer = new L.supermap.TiandituTileLayer({
            key: "1d109683f4d84198e37a38c442d68311",
          }).addTo(hcmap);
        }, 50);
      } else {
        this.compareMapShow = true;
      }
      this.$bus.$emit("compareMap", this.compareMapShow);
    },
    mapiconMouseOver() {
      let iconlist = this.$el.children[2].children[0].getElementsByTagName("li");
      for (let i = 0; i < iconlist.length; i++) {
        let iconhtml = iconlist[i];
        let rightPX = ((iconlist.length - iconhtml.getAttribute("index") - 1) * 66) + "px";
        iconhtml.style.right = rightPX;
      }
      document.getElementsByClassName("base-back")[0].style.width = iconlist.length*66 + "px";
    },
    mapiconMouseOut() {
      let iconlist = this.$el.children[2].children[0].children;
      for (let i = 0; i < iconlist.length; i++) {
        let iconhtml = iconlist[i];
        iconhtml.style.right = 0;
      }
      document.getElementsByClassName("base-back")[0].style.width = 0 + "px";
    },
    showTimeLine(val){
      this.showLine = val;
    }
  },
};
</script>

<style lang="scss" scoped>
* {
  font-family: "hndpfont" !important;
}
.el-container {
  position: relative;
  height: 100vh;

  .laymap {
    position: fixed;
    bottom: 4%;
    right: 4%;
    z-index: 3;
    display: flex;

    li {
      width: 70px;
      position: relative;
      margin: 0 6px;
      cursor: pointer;
      border: 1px solid #1d4470;
      img {
        width: 100%;
      }

      p {
        width: 100%;
        text-align: center;
        position: absolute;
        bottom: 0;
        background: #1d4470;
      }
    }
  }

  .v-map {
    width: 100vw;
    height: 100vh;
    position: absolute;
    z-index: 1;
  }

  .v-map2 {
    width: 100vw;
    height: 100vh;
    position: absolute;
    z-index: 1;
  }

  .el-main {
    width: 100vw;
    padding: 0;
    position: absolute;
    z-index: 2;

    .el-header {
      width: 100%;
      height: 9vh !important;
      color: #333;
      text-align: center;
      padding: 0;
      background-color: rgba(0, 0, 0, 0);
    }

    .v-content {
      box-sizing: border-box;
      position: fixed;
    }
  }
  .base-map-control {
      position: absolute;
      top: 833px;
      width: 60px;
      height: 60px;
      z-index: 999;
      right: 50px;
      transition: 0.5s;
      .base-back{
        height: 60px;
        position:absolute;
        background-color: rgba(255, 255, 255, 0);
      }
      li {
        list-style-type: none;
        width: 60px;
        height: 60px;
        text-align: center;
        font-size: 12px;
        color: white;
        border: 2px #b3d6f1 solid;
        //border-radius: 5px;
        overflow: hidden;
        cursor: pointer;
        transition: 1s;
        .base-note-layer{
          position: absolute;
          top: 0;
          width: 100%;
          background: rgba(0,0,0,.5);
          //visibility: hidden;
          height: 24px;
          line-height: 24px;
          .el-checkbox__inner{
            width: 12px;
            height: 12px;
            border-radius: 0;
          }
          .el-checkbox__label {
            color: #fff;
            padding-left: 4px;
            font-size: 12px;
          }
          .el-checkbox__inner::after{
            left: 3px;
            top: 0px;
          }
        }
        /*&:hover .base-note-layer{
          visibility:visible;
        }*/
      }
      .active {
          border: 2px #67c23a solid !important;
      }
      .map-icons-font {
        background: #178af5;
        opacity: .8;
        width: 56px;
        padding: 2px;
        position: absolute;
        bottom: 4px;
        height: 16px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
  }
  .colseImg {
    z-index: 99;
    width: 20px;
    height: 20px;
    position: absolute;
    top: 774px;
    right: 35px;
  }
  .timeImg{
    width: 20px;
    height: 20px;
  }
}
</style>

<style>
.leaflet-touch .leaflet-control-attribution {
  display: none;
}

.el-radio-button:first-child {
  border-left: none;
}

.el-radio-button__inner {
  border: none !important;
}
.time-line .layer-title{
  padding: 10px 0 0 10px;
}
.time-line{
    max-width: 500px;
    min-width: 200px;
    /* height: 77px; */
    z-index: 99;
    background: #0c293b30;
    float: right;
    right: 51px;
    position: absolute;
    bottom: 112px;
    border-radius: 5px;
    border: #62b4d8 solid 1px;
}
</style>
