<template>
  <div>
    <div class="shadowPanel">
      <el-row class="row-block">
        <el-col :span="12" class="block-content">
          <el-col :span="10" class="block-content-txt">
            <span class="demonstration">日期选择</span>
          </el-col>
          <el-col :span="14" class="block-content-input">
            <el-date-picker
              format="yyyy/MM/dd"
              value-format = "yyyy/MM/dd"
              v-model="date"
              type="date"
              size="small"
              placeholder="选择日期">
            </el-date-picker>
          </el-col>
        </el-col>
        <el-col :span="12" class="block-content">
          <el-col :span="10" class="block-content-txt">
            <span class="demonstration">开始时间</span>
          </el-col>
          <el-col :span="14" class="block-content-input">
            <el-time-select
              size="small"
              v-model="starttime"
              @change='startTimeChange'
              :picker-options="{
              start: '00:00',
              step: '02:00',
              end: '22:00'
            }"
              placeholder="选择开始时间">
            </el-time-select>
          </el-col>
        </el-col>
      </el-row>
      <el-row class="row-block">
        <el-col :span="12" class="block-content">
          <el-col :span="10" class="block-content-txt">
            <span class="demonstration">结束时间</span>
          </el-col>
          <el-col :span="14" class="block-content-input">
            <el-time-select
              size="small"
              v-model="endtime"
              @change='endTimeChange'
              :picker-options="{
              start: '02:00',
              step: '02:00',
              end: '24:00'
            }"
              placeholder="选择结束时间">
            </el-time-select>
          </el-col>
        </el-col>
        <el-col :span="12" class="block-content">
          <el-col :span="10" class="block-content-txt">
            <span class="demonstration">底部高程(米)</span>
          </el-col>
          <el-col :span="14" class="block-content-input">
            <el-input size="small" v-model="bottomHeight" placeholder="20" @change='bottomHeightChange'></el-input>
          </el-col>
        </el-col>
      </el-row>
      <el-row class="row-block">
        <el-col :span="12" class="block-content">
          <el-col :span="10" class="block-content-txt">
            <span class="demonstration">拉伸高度(米)</span>
          </el-col>
          <el-col :span="14" class="block-content-input">
            <el-input size="small" v-model="extrudeHeight" placeholder="20" @change='extrudeHeightChange'></el-input>
          </el-col>
        </el-col>
      </el-row>
      <el-row class="row-block">
        <el-col :span="6" class="block-content">
          <el-col :span="24" class="block-content-txt">
            <span class="demonstration">日照速率(毫秒)</span>
          </el-col>
        </el-col>
        <el-col :span="18">
          <el-slider input-size="small" v-model="controlspeed" :min='20' :max='100' @change='HeiChange' :step="20" show-input></el-slider>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24" style="text-align: center">
          <el-button size="small" type="primary" @click="shadowAnalysis" class="btn-view">阴影分析</el-button>
          <el-button size="small" type="primary" @click="sunlight" class="btn-view">日照效果</el-button>
          <el-button size="small" class="btn-none" @click="clearVS">&nbsp;&nbsp;&nbsp;清除&nbsp;&nbsp;&nbsp;</el-button>
        </el-col>
      </el-row>
    </div>
    <shadows-legend v-show="isShow" ref="shadowsLegend"></shadows-legend>
  </div>
</template>

<script>
import { Loading } from 'element-ui'
import shadowsLegend from './ShadowsLegend.vue'
let layers,shadowQuery,handlerPolygon,startTime,endTime,pointsArr

  export default {
    components:{
      shadowsLegend,
    },
    data() {
      return {
        // date: new Date(),
        date: "2020-01-20",
        bottomHeight:20,
        extrudeHeight:20,
        starttime:'08:00',
        endtime:'16:00',
        points:[],
        shadow :{

        },
        polygon:Object,
        nTimer:0.0,
        controlspeed:40,
        isShow: false,
      }
    },
    mounted() {
      EventBus.$on('shadows', this.initBase);
      // EventBus.$on('sightLine', this.clearVS);
      EventBus.$on('clearAll',this.clearVS);
    },
    destroyed () {
      EventBus.$off('shadows', this.initBase);
      // EventBus.$off('sightLine', this.clearVS);
      EventBus.$off('clearAll',this.clearVS);
    },
    methods:{
      initBase(){
        let scene = Viewer.scene;
        if(APPCONFIG.darknessValue){
          scene.shadowMap.darkness = APPCONFIG.darknessValue;  //设置第二重烘焙纹理的效果（明暗程度）
        }
        layers = scene.layers.layerQueue;
        //创建阴影查询对象
        shadowQuery = new Cesium.ShadowQueryPoints(scene);
      },
      init(){
        Viewer.shadows = true;
        Viewer.scene.globe.enableLighting = true;
        this.initBase();
        //设置图层的阴影模式
        shadowQuery.build();
        this.setCurrentTime();
        handlerPolygon = new Cesium.DrawHandler(Viewer,Cesium.DrawMode.Polygon,0);
        try{Cesium.USERHANDEL.deactivate();Cesium.USERHANDEL = null;}catch(e){};
        Cesium.USERHANDEL = handlerPolygon;
        handlerPolygon.activeEvt.addEventListener(function(isActive){
          try{Cesium.TIPSTR = isActive?'<p>左键选取位置</p><p>右键取消或完成绘制</p>':'';}catch(e){};
          try{Cesium.STATE.ISDRAWING = isActive;}catch(e){};
        });
        let points = this.points;
        let that = this;
        handlerPolygon.drawEvt.addEventListener(function(result){
          points.length = 0 ;
          let polygon = Object.assign({}, result.object);
          if(!polygon){
            return ;
          }
          polygon.show = false;
          handlerPolygon.polygon.show = false;
          handlerPolygon.polyline.show = false;
          let positions = [].concat(polygon.positions);
          positions = Cesium.arrayRemoveDuplicates(positions,Cesium.Cartesian3.equalsEpsilon);
          //遍历多边形，取出所有点
          for(var i = 0, len = positions.length; i < len; i++) {
            //转化为经纬度，并加入至临时数组
            var cartographic = Cesium.Cartographic.fromCartesian(polygon.positions[i]);
            var longitude = Cesium.Math.toDegrees(cartographic.longitude);
            var latitude = Cesium.Math.toDegrees(cartographic.latitude);
            points.push(longitude);
            points.push(latitude);
          }
          pointsArr = [];
          pointsArr = points;
          //设置分析对象的开始结束时间
          startTime = new Date(that.date);
          startTime.setHours(parseInt(that.starttime));
          shadowQuery.startTime = Cesium.JulianDate.fromDate(startTime).clone();

          endTime = new Date(that.date);
          endTime.setHours(parseInt(that.endtime));
          shadowQuery.endTime = Cesium.JulianDate.fromDate(endTime).clone();

          //设置当前时间
          that.setCurrentTime();

          shadowQuery.spacing = 10;
          shadowQuery.timeInterval = 60;
          //设置分析区域、底部高程和拉伸高度
          var bh = parseInt(that.bottomHeight);
          var eh = parseInt(that.extrudeHeight);
          shadowQuery.qureyRegion({
              position : points,
              bottom : bh,
              extend : eh
          });
          shadowQuery.build();
          document.oncontextmenu = function(){
          　return false;
          }
          let loading = that.$loading({text: '正在分析，请稍后......', background: 'rgba(0, 0, 0, 0.8)'});
          setTimeout(function(){
            loading.close();
            that.isShow = true;
            that.$refs.shadowsLegend.shadowsLegend(that.starttime, that.endtime);
          }, 5000);

        });
      },
      HeiChange(val) {
        this.controlspeed = val;
      },
      shadowAnalysis(){
        Viewer.entities.removeAll();
        if (!shadowQuery.startTime) {
          this.$message.error('请选择开始时间');
          return;
        }
        if (!shadowQuery.endTime) {
          this.$message.error('请选择结束时间');
          return;
        }
        if(shadowQuery){
          shadowQuery.qureyRegion({
            position : [0,0],
            bottom : 0,
            extend : 0
          });
          shadowQuery =  shadowQuery.destroy();
          shadowQuery = undefined;
        }
        this.init();
        for(var i = 0;i < layers.length;i++){
          layers[i].shadowType = 2;
        };
        handlerPolygon.deactivate();
        handlerPolygon.activate();
      },
      sunlight(){
        var dateVal = this.date;
        startTime = new Date(dateVal);
        endTime = new Date(dateVal);
        var shour = parseInt(this.starttime);
        var ehour = parseInt(this.endtime);
        for(var i = 0;i < layers.length;i++){
          layers[i].shadowType = 2;
        };
        if(shour > ehour) {
          this.$message.error('开始时间不能大于结束时间！');
          return;
        }
        shadowQuery.qureyRegion({
            position : [0,0],
            bottom : 0,
            extend : 0
        });
        this.init();
        let nTimer = 0.0;
        let that = this;
        var nIntervId = setInterval(function() {
          if(shour < ehour) {
            startTime.setHours(shour);
            startTime.setMinutes(nTimer);
            Viewer.clock.currentTime = Cesium.JulianDate.fromDate(startTime).clone();
            nTimer += 10.0;
            if(nTimer > 60.0){
              shour += 1.0;
              nTimer = 0.0;
            }
          }else {
            clearInterval(nIntervId);
            if(that.isShow){
              startTime = new Date(that.date);
              startTime.setHours(parseInt(that.starttime));
              shadowQuery.startTime = Cesium.JulianDate.fromDate(startTime).clone();

              endTime = new Date(that.date);
              endTime.setHours(parseInt(that.endtime));
              shadowQuery.endTime = Cesium.JulianDate.fromDate(endTime).clone();
              //设置当前时间
              that.setCurrentTime();

              shadowQuery.spacing = 10;
              shadowQuery.timeInterval = 60;
              shadowQuery.qureyRegion({
                position : pointsArr,
                bottom : parseInt(that.bottomHeight),
                extend : parseInt(that.extrudeHeight)
              });
            }
          }
        }, 120-that.controlspeed);
      },
      clearVS(){
        // if (layers) {
        //   for(var i = 0;i < layers.length;i++){
        //     layers[i].shadowType = 0;
        //   };
        // }
        // this.shadow.isStart = false;
        this.isShow = false;
        if(!handlerPolygon){
          return;
        }
        else{
          handlerPolygon.deactivate();
        };
        if(handlerPolygon.polygon){
          handlerPolygon.polygon.show = false;
        }
        if(handlerPolygon.polyline){
          handlerPolygon.polyline.show = false;
        }
        Viewer.entities.removeAll();
        if(Object.keys(shadowQuery).length){
          shadowQuery.qureyRegion({
              position : [0,0],
              bottom : 0,
              extend : 0
          });
          shadowQuery.destroy();
          // shadowQuery = {};
        }
        Viewer.scene.globe.enableLighting = false;
        Viewer.shadows = false;
        this.initBase();
      },
      setCurrentTime() {
        endTime = new Date(this.date);
        endTime.setHours(parseInt(this.endtime));
        Viewer.clock.currentTime = Cesium.JulianDate.fromDate(endTime).clone();
        Viewer.clock.multiplier = 1;
        Viewer.clock.shouldAnimate = true;
      },
      startTimeChange(val){
        startTime = new Date(this.date);
        startTime.setHours(parseInt(val));
        shadowQuery.startTime = Cesium.JulianDate.fromDate(startTime).clone();
        this.$refs.shadowsLegend.shadowsLegend(this.starttime, this.endtime);
      },
      endTimeChange(val){
        endTime = new Date(this.date);
        endTime.setHours(parseInt(val));
        shadowQuery.endTime = Cesium.JulianDate.fromDate(endTime).clone();
        this.setCurrentTime();
        this.$refs.shadowsLegend.shadowsLegend(this.starttime, this.endtime);
      },
      bottomHeightChange(){
        var bh = parseInt(this.bottomHeight);
        var eh = parseInt(this.extrudeHeight);
        shadowQuery.qureyRegion({
          position : this.points,
          bottom : bh,
          extend : eh
        });
      },
      extrudeHeightChange(){
        var bh = parseInt(this.bottomHeight);
        var eh = parseInt(this.extrudeHeight);
        shadowQuery.qureyRegion({
          position : this.points,
          bottom : bh,
          extend : eh
        });
      },
    }
  }
</script>

<style lang="scss">
  .shadowPanel {
    .el-date-editor.el-input {
      width: 100%;
    }
  }
</style>
