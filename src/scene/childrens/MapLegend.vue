<template>
<div id="legend" v-show="cShowLegend">
  <el-collapse @change="openLegend" accordion v-model="activeNames">
    <div id="legend-title">图层
      <i class="icon-close" @click="iscShowLegend()"></i>
    </div>
    <div class="legend-cont">
      <el-collapse-item v-for="(item, index) in legends" :name="index" :key="item.url+index">
        <template slot="title">
          <span class="name-span" :title="item.name">
              <span class="text">{{item.name}}</span>
          </span>
          <span class="btn-span">
              <template v-if="item.visible">
                <i class="header-icon green el-icon-circle-check" @click.stop="hideLayer(item)"></i>
              </template>
              <template v-else>
                <i class="header-icon gray el-icon-circle-check" @click.stop="hideLayer(item)"></i>
              </template>
              <i class="el-icon-caret-top" title="图层上移" @click.stop="layerUp(item)" style="font-size: 20px"></i>
              <i class="el-icon-caret-bottom" title="图层下移" @click.stop="layerDown(item)" style="font-size: 20px"></i>
              <i class="el-icon-delete" title="删除" @click.stop="deleteLayer(item)" style="font-size: 15px"></i>
          </span>
        </template>
        <template v-if="!item.legend">
          <div class="block">
            <div class="demonstration">透明度</div>
            <el-slider :max="1"  :step="0.01" class="right-slider" @change="changeOpacity" v-model="item.opacity" :format-tooltip="formatTooltip"></el-slider>
          </div>
        </template>
        <template v-else>
          <div class="block">
            <el-row>
              <el-col :span="4">
                <div style="line-height:40px">透明度</div>
              </el-col>
              <el-col :span="18">
                <el-slider  :max="1"  :step="0.01" class="right-slider" @change="changeOpacity" v-model="item.opacity" :format-tooltip="formatTooltip"></el-slider>
              </el-col>
            </el-row>
          </div>
      </template>
        <template>
          <div style="line-height:40px">图例</div>
            <ul class='right-slider'>
              <li v-for="(le, index) in item.legend" :key='index' :class="{legendOne:item.legend.length==1}">
                <div v-if="item.layerType.toLowerCase().indexOf('arcgis') === -1">
              <template v-if="le.color !== undefined">
                <span class="legend-back" :style="{
                  background:'rgba('+le.color.red+','+le.color.green+','+le.color.blue+','+le.color.alpha+')'
                }"></span>
              </template>
              <template v-else>
                <img  :src="le.imgurl"/>
              </template>
                  <span class="legend-name" :title="le.caption.substring(0,le.caption.indexOf('@'))" v-if="le.caption.indexOf('@')>0">{{le.caption.substring(0,le.caption.indexOf('@'))|ellipsis(item.legend,5)}}</span>
                  <span class="legend-name" :title="le.caption" v-else>{{le.caption|ellipsis(item.legend,7)}}</span>
                </div>
                <div v-else>
                  <img :src="'data:image/png;base64,'+le.imageData">
                  <span class="legend-name" :title="le.label">{{le.label|ellipsis(item.legend,7)}}</span>
                </div>
            </li>
          </ul>
      </template>
      </el-collapse-item>
    </div>
  </el-collapse>
</div>
</template>
<script type="text/javascript">
import {
  mapState,
  mapMutations
} from 'vuex'
import {
  serviceMgr
} from './../../map/serviceMeta.js';
import {
  dragFunc
} from '@/components/common/utils'

export default {
  data() {
    return {
      openItem: {},
      legends: [],
      activeNames:""
    }
  },
  filters:{
    ellipsis(value, legends, limit){
      if(!value) return '';
      if(legends.length <= 1) return value;
      if(value.length>limit){
        return value.slice(0,limit)+'...';
      }
      return value;
    }
  },
  watch: {
    cSpecialLayer: {
      handler(val, oldVal) {
        let afterleg = [];
        let leg = val;
        //this.activeNames = "";
        for (var i = leg.length - 1; i >= 0; i--) {
          if(leg[i].layerType === 'SMRESTMAP' || leg[i].restLayer ||leg[i].arcgisRestLayer){
            if(leg[i].url&&leg[i].url.toLowerCase().indexOf("rest") === -1) leg[i].url = leg[i].restLayer
          }
          if(!leg[i].noClear)
          afterleg.push(leg[i])
        }
        afterleg = JSON.parse(JSON.stringify(afterleg));
        this.legends = afterleg;
        if(this.legends.length > 0){
          this.activeNames = 0;
          this.openLegend(this.activeNames);
        }
      },
      deep: true
    }
  },
  computed: {
    ...mapState({
      cShowLegend: state => state.scene.cShowLegend,
      cSpecialLayer: state => state.scene.cSpecialLayers,
      showLegend: state => state.map.isShowLegend,
    })
  },
  mounted() {
    dragFunc("legend", "legend-title");
  },
  methods: {
    ...mapMutations([
      'cChangeLayerZIndex',
      'cChangeLayerOpacity',
      'cRemoveLayer',
      'cShowHideLayer',
      'cShowHideLegend',
      'cAddLegend'
    ]),
    hideLayer(item) {
      let self = this;
      let e = event.target;
      var flag = true;
      for (let i = 0; i < self.legends.length; i++) {
        if (self.legends[i] === item) {
          self.cShowHideLayer({
            layer: item,
            flag: !self.legends[i].visible
          })
        }
      }
      event.stopPropagation();
    },
    layerUp(data) {
      let self = this;
      for (var i = 0; i < this.legends.length; i++) {
        if (this.legends[i] === data) {
          if (i == 0) {
            return
          } else {
            let objlayer = this.legends[i];
            let lastlayer = this.legends[i - 1];
            self.cChangeLayerZIndex({
              downLayer: lastlayer,
              upLayer: objlayer
            });
            return;
          }
        }
      };
      event.stopPropagation();
    },
    layerDown(data) {
      let self = this;
      for (let i = 0; i < this.legends.length; i++) {
        if (this.legends[i] === data) {
          if (i == this.legends.length - 1) {
            return
          } else {
            let objlayer = this.legends[i];
            let nextlayer = this.legends[i + 1];
            self.cChangeLayerZIndex({
              downLayer: objlayer,
              upLayer: nextlayer
            });
            return;
          }

        }
      };
      event.stopPropagation();
    },
    deleteLayer(item) {
      let self = this;
      if (this.legends.length == 1) {
        self.cShowHideLegend(false);
      }
      self.cRemoveLayer(item)
      EventBus.$emit('tree-removelayer',item);
      EventBus.$emit('priTree-removelayer',item);
      event.stopPropagation();
    },
    openLegend(activeNames) {
      let self = this;
      this.openItem = self.legends[activeNames];
      if (self.legends[activeNames] && (self.legends[activeNames].restLayer || self.legends[activeNames].layerType.indexOf("REST") > -1) && self.legends[activeNames].legend.length == 0) {
        serviceMgr.getLegendWithoutLABEL(self.legends[activeNames], function(res) {
          self.legends[activeNames].legend = res;
          /*self.cAddLegend({
            layer: self.legends[activeNames],
            legend: res
          });*/
        })
      }
    },
    formatTooltip(val) {
      //return val * 100;
    },
    changeOpacity(e) {
      this.cChangeLayerOpacity({
        layer: this.openItem,
        opacity: e
      })
    },
    iscShowLegend() {
      this.cShowHideLegend(!this.cShowLegend)
    },
  },
  destroy() {

  }
}
</script>
<style lang="scss" scoped>
#legend {
  position: absolute;
  top: 60px;
  right: 60px;
  z-index: 1500;
  line-height: 30px;
  background-color: #f5f7fa;
  padding: 7px;
  min-width: 200px;
  max-height: 450px;
  overflow-y: auto;
  overflow-x: hidden;
  user-select: none;
  width: 300px;
  max-height: 668px;
  .demonstration {
    width: 24%;
    float: left;
    height: 38px;
    text-align: center;
    line-height: 38px;
  }

  .right-slider {
    width: calc(100% - 10px);
    img {
      height: 20px;
      width: 20px;
      vertical-align: middle;
    }
    .legend-name {
      max-width: calc(100% - 29px);
      overflow: hidden;
      text-overflow:ellipsis;
      white-space:nowrap;
    }
    .legend-back{
      width:20px;
      height: 20px;
      display: inline-block;
      vertical-align: middle;
    }
  }
  ul{
    max-height: 300px;
    overflow: auto;
  }
  li{
    list-style: none;
    float: left;
    width: 50%;
    height:40px;
  }
  .legendOne{
    width: 100%;
  }
  .legend-cont{
    max-height: 620px;
    overflow-y: auto;
  }
  .el-form-item{
    margin-bottom:0px;
  }
  .el-collapse-item__content {
    padding-bottom: 0;
  }
  .el-collapse-item:last-child {
    margin-bottom: 0;
  }
  #legend-title {
    font-size: 16px;
    .icon-close{
      width: 20px;
      height:20px;
      margin-top:5px;
      background-size: 100%;
      display: inline-block;
      float: right;
      background-image:url('./../../../../static/img/icon-close.png');
      cursor: pointer;
    }
  }

  .green {
    color: green
  }

  .gray {
    color: gray
  }

  .btn-span {
    float: right;
    padding-right: 10px;
  }

  .name-span {
    display: inline-block;
    width: 156px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .block{
    overflow: hidden;
  }
}
</style>
