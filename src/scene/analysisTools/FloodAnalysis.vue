<template>
  <div>
    <div class="tabs shadow">
      <span class="demonstration">最大高度(米)</span>
      <el-input v-model="bottomHeight" placeholder="10"></el-input>
    </div>
    <div class="tabs shadow">
      <span class="demonstration">最小高度(米)</span>
      <el-input v-model="extrudeHeight" placeholder="10"></el-input>
    </div>
    <div class="tabs">
      <span class="demonstration">淹没速度(米/秒)</span>
      <el-slider v-model="controlspeed" :min=" 0.01" :max="100" :step="5" show-input></el-slider>
    </div>
    <div style="position: relative;margin: 10px;float: right;">
      <el-button plain type="info" @click="floodAnalysis">淹没分析</el-button>
      <el-button plain type="info" @click="clearVS">清除</el-button>
    </div>
  </div>
</template>

<script>
import $ from "jquery";
import {mapState,} from 'vuex'
export default {
  computed: {
    ...mapState({
      currentBaseMap: state => state.map.baseMapLayersGroup[0]
    }),
  },
  data() {
    return {
      date: new Date(),
      bottomHeight: 150,
      extrudeHeight:50,
      starttime: "06:00",
      endtime: "18:00",
      points: [],
      shadow: {},
      modelArr: [],
      polygon: Object,
      nTimer: 0.0,
      currentBaseMapurl:"",
      controlspeed: 5,
      intt: null,
      currentHeight:0,
    };
  },

  mounted() {
    EventBus.$on('clearAll',this.clearVS);
  },
  destroyed() {
    EventBus.$off('clearAll',this.clearVS);
  },
  methods: {
    floodAnalysis() {
      Viewer.entities.removeAll();
      this.clearVS();
      let _this = this;
      if (_this.modelArr.length != 0 && _this.currentBaseMap.url==_this.currentBaseMapurl) {
        //
        _this.showFloodAnalysis();
      } else {
        _this.currentBaseMapurl=_this.currentBaseMap.url;
        //查询下面的图层
        $.ajax({
          type: "GET",
          url: _this.currentBaseMapurl + "/scenes.json",
          dataType: "json",
          async: false,
          success: function(data) {
            $.ajax({
              type: "GET",
              url: data[0].path + ".json",
              dataType: "json",
              async: false,
              success: function(datas) {
                let dataLayers = datas.layers;
                for (let index = 0; index < dataLayers.length; index++) {
                  let element = dataLayers[index].dataName;
                  _this.modelArr.push(element);
                }
                _this.showFloodAnalysis();
              }
            });
          }
        });
      }
    },
    showFloodAnalysis() {
      let _this = this;
      _this.currentHeight=0;
      _this.intt = setInterval(function(){
        _this.ShowFlood()
      }, 100);
    },
    //淹没开始
    ShowFlood(){
      let _this = this;
      if (_this.currentHeight >_this.bottomHeight) {
         clearInterval(_this.intt);
         return;
      }
      for (let index = 0; index < _this.modelArr.length; index++) {
        let elements =_this.modelArr[index];
        // var layer = scene.layers.find("sci_park");
        let layer =Viewer.scene.layers.find(elements);
        try {
          let hyp = new Cesium.HypsometricSetting();
          //创建分层设色对象   设置最大/最小可见高度   颜色表  显示模式   透明度及线宽
          let colorTable = new Cesium.ColorTable();
          hyp.MaxVisibleValue = _this.currentHeight-20;
          hyp.MinVisibleValue = _this.extrudeHeight;
          _this.setColorTable(colorTable, "1");
          hyp.ColorTable = colorTable;
          hyp.DisplayMode = Cesium.HypsometricSettingEnum.DisplayMode.FACE;
          hyp.Opacity = 0.5;
          hyp.LineInterval = 10.0;
          //设置图层分层设色属性
          layer.hypsometricSetting = {
            hypsometricSetting: hyp,
            analysisMode:
              Cesium.HypsometricSettingEnum.AnalysisRegionMode.ARM_ALL
          };
          _this.currentHeight +=  (parseInt(_this.controlspeed)+"")/10;
        } catch (error) {}
      }
    },
    setColorTable(colorTable, key) {
      switch (key) {
        case "1":
          colorTable.insert(71, new Cesium.Color(0, 39 / 255, 148 / 255));
          colorTable.insert(0, new Cesium.Color(149 / 255, 232 / 255, 249 / 255));
          break;
        case "2":
          colorTable.insert(71, new Cesium.Color(162 / 255, 251 / 255, 194 / 255));
          colorTable.insert(0, new Cesium.Color(1, 103 / 255, 103 / 255));
          break;
        case "3":
          colorTable.insert(71, new Cesium.Color(230 / 255, 198 / 255, 1));
          colorTable.insert(0, new Cesium.Color(157 / 255, 0, 1));
          break;
        case "4":
          colorTable.insert(71, new Cesium.Color(210 / 255, 15 / 255, 15 / 255));
          colorTable.insert(54, new Cesium.Color(221 / 255, 224 / 255, 7 / 255));
          colorTable.insert(36, new Cesium.Color(20 / 255, 187 / 255, 18 / 255));
          colorTable.insert(18, new Cesium.Color(0, 161 / 255, 1));
          colorTable.insert(0, new Cesium.Color(9 / 255, 9 / 255, 212 / 255));
          break;
        case "5":
          colorTable.insert(71, new Cesium.Color(186 / 255, 1, 229 / 255));
          colorTable.insert(0, new Cesium.Color(26 / 255, 185 / 255, 156 / 255));
          break;
        default:
          break;
      }
    },
    clearVS() {
      Viewer.entities.removeAll();
      for (let index = 0; index <this. modelArr.length; index++) {
        try {
          let elements = this.modelArr[index];
          let layer = Viewer. scene.layers.find(elements);
          let hyp = new Cesium.HypsometricSetting();
          hyp.MaxVisibleValue = 0;
          layer.hypsometricSetting = {
              hypsometricSetting: hyp,
              analysisMode: Cesium.HypsometricSettingEnum.AnalysisRegionMode.ARM_ALL
          };
        } catch (error) {

        }
      }
    }
  }
};
</script>

<style lang="scss">
.tabs {
  margin: 10px;
}
.shadow {
  .el-input {
    width: 67%;
  }
}
</style>
