<template>
  <section class="fly-line-manager-panel">
    <!-- 面板标题 -->
    <h3 class="fly-panel-title">飞行路线列表
      <span class="fly-panel-close-btn el-icon-close" @click="closeFlyManagerPanel" title="关闭"></span>
    </h3>
    <!-- 路线列表 -->
    <div class="fly-line-list" v-if="flyLineManage">
      <div v-if="flyLineManage&&flyLineManage.lines&&flyLineManage.lines.length" v-for="i in Math.ceil(flyLineManage.lines.length/3)">
         <span @click="changeFlyLine(item,n)" v-if="Math.ceil((n+1)/3)==i" v-for="(item,n) in flyLineManage.lines" :title="item.name" :key="n" :class="activeIndex==n?'fly-item active':'fly-item'">
           <i v-if="activeIndex == n&&playState" class="el-icon-caret-right play-flag flash animated"/>
           <i v-if="item.icon" :class="item.icon"/>
           {{item.name}}
         </span>
        <hr class="split-line"/>
      </div>
    </div>
    <!-- 控制器 -->
    <transition name="el-zoom-in-bottom">
      <div class="fly-line-control" v-show="activeIndex!=-1">
        <div class="split-bg">
          <span>节点：</span>
          <el-select class="fly-node-select"  v-model="selectNode" default-first-option size="mini" popper-class="flyNodesSection" placeholder="选择节点">
            <el-option v-for="item in flyNodes" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </div>
        <div class="fly-controls">
          <span class="i-block pl-10 v-text">当前速率：{{thisRate}}</span>
          <!-- 减速控件 -->
          <span class="fly-control-btn min-btn" title="减速" @click="changeRate(false)">
             <i class="fa fa-fast-backward"/>
            </span>
          <!-- 开始控件 -->
          <span class="fly-control-btn" @click="playState?flyPlay('pause'):flyPlay('play')" :title="playState?'暂停':'开始'">
            <i class="fa fa-play ml-3" v-show="!playState"/>
            <i class="fa fa-pause" v-show="playState"/>
            </span>
          <!-- 加速控件 -->
          <span class="fly-control-btn min-btn"title="加速" @click="changeRate(true)">
            <i class="fa fa-fast-forward"/>
            </span>
          <!-- 停止控件 -->
          <span class="text-right mr5 stop-btn" @click="flyPlay('stop')" title="停止">
              <i class="fa fa-refresh"/>
            </span>
        </div>
      </div>
    </transition>
  </section>
</template>
<script>
import {
  mapState,
} from 'vuex'
let flyManager,routes;
const CrsMap = {
  "L.CRS.EPSG4490": L.CRS.TianDiTu_WGS84,
  "L.CRS.EPSG4326": L.CRS.EPSG4326,
  "L.CRS.EPSG3857": L.CRS.EPSG3857,
  "L.CRS.EPSG900913": L.CRS.TianDiTu_Mercator
};
export default {
  data() {
    return {
      panelName:'flyLineManage',//面板名称
      flyLineManage:APPCONFIG.Analysis.default.flyLineManage,//飞行路线列表管理配置
      activeIndex:-1,//选中的路线序号
      playState:false,//播放状态
      maxRate:2.0,//最大速率
      minRate:0.1,//最小速率
      tempNode:-1,//临时站点
      thisRate:'1.0',//当前速率
      flyNodes: [],//飞行节点数组
      selectNode:0,//选中的飞行节点
    };
  },
  computed: {
    ...mapState({
      baseMapLayersGroup: state => state.map.baseMapLayersGroup
    }),
    currentBaseMap() {
      return this.baseMapLayersGroup[0];
    },
  },
  watch:{
    selectNode(val){
      if(flyManager&&this.tempNode!=val){
        flyManager.stop();
        flyManager.currentStopIndex = val;
        if(this.playState)flyManager.play();
      }
    },
    tempNode(val){
      (val!=-1)&&(this.selectNode = val);
    },
    thisRate(val){
      if(flyManager){
        flyManager.stop();
        flyManager.playRate = parseFloat(val);
        if(this.playState)flyManager.play();
      }
    }
  },
  methods:{
    initFlying(item){
      let that = this;
      if(flyManager) {
        flyManager.routes._entityCollection.removeAll();
        flyManager.stop();
        that.playState = false;
      }
      routes = new Cesium.RouteCollection(Viewer.entities);
      flyManager = new Cesium.FlyManager({
        scene: Viewer.scene,
        routes: routes
      });
      flyManager.currentStopIndex = 0;
      //注册站点到达事件
      flyManager.stopArrived.addEventListener(function (routeStop) {
        routeStop.waitTime = 0; // 在每个站点处停留1s
        that.palyState = true;
        that.tempNode = routeStop.index;
        let index = flyManager.getAllRouteStops().length - 1;
        if(routeStop.index == index) {
          flyManager.stop();
          that.playState = false;
          if(flyManager.afterEvent&&typeof flyManager.afterEvent == "function"){flyManager.afterEvent();};
        }
      });
    },
    changeFlyLine(item,n){
      let that = this;
      this.restParam();
      this.initFlying();
      flyManager.routes.fromFile(item.file);
      flyManager.readyPromise.then(() => {
        var currentRoute = flyManager.currentRoute;
        let routeStops = flyManager.getAllRouteStops();
        currentRoute.isLineVisible = false;
        currentRoute.isStopVisible = false;
        that.flyNodes = routeStops.map(item=>{
          return {label:item._stopName,value:item._index}
        });
      });
      this.activeIndex = n;
    },
    flyPlay(cmd,param){
      try{(flyManager&&flyManager[cmd])&&(flyManager[cmd](param));}catch(e){}
      (cmd == 'stop')&&(this.restParam());
      this.playState = cmd!='stop'&&cmd!='pause';
    },
    changeRate(model){
      if(flyManager){
        if(model){//加速
          flyManager.playRate += flyManager.playRate.toFixed(1)<this.maxRate?0.1:0;
        }else{//减速
          flyManager.playRate -= flyManager.playRate.toFixed(1)>this.minRate?0.1:0;
        }
        this.thisRate = flyManager.playRate.toFixed(1)+'';
      }
    },
    restParam(){
      this.palyStatu = false;
      this.thisRate = 1.0;
      this.tempNode = -1;
      this.selectNode = 0;
    },
    closeFlyManagerPanel(){
      this.flyPlay("stop");
      this.$emit("flyClose");
    }
  }
};
</script>
<style lang="scss">
  .text-right {
    float: right;
  }
  .mr5 {
    margin-right: 5%;
  }
  .fly-line-manager-panel{
    user-select:none;
    position: absolute;
    width: 392px;
    height: 300px;
    right: 10px;
    z-index: 10;
    top: 70px;
    border-radius: 5px;
    border: none;
    font-size: 10pt;
    padding: 1em;
    background-color: #f5f7fa;
    box-shadow: 0 0 8px #ddd;
    /*box-shadow: 0 0 0 8px #E4E7ED;*/
    .split-line{
      border: 0;
      border-top: 1px dashed #909399;
    }
    .fly-panel-title{
      font-weight:bolder;
      height: 40px;
      line-height: 40px;
      padding: 0px 20px;
      border-bottom: 2px solid #E4E7ED;
      background:rgba(251,253,255,0.1);
      .fly-panel-close-btn{
        display:inline-block;
        float:right;
        line-height:40px;
        cursor:pointer;
      }
    }
    .fly-line-list{
      padding:0px 20px;
      span.fly-item{
        width: 33.33%;
        display: inline-block;
        overflow: hidden;
        word-break: break-all;
        padding: 15px 5px;
        font-size: 14px;
        cursor: pointer;
        text-overflow: ellipsis;
        white-space: nowrap;
        .play-flag{
          color:#409EFF;
          animation-iteration-count: infinite;
        }
      }
      span.fly-item.active{
        color:#409EFF
      }
    }
    .fly-line-control{
      border-top: 1px solid #E4E7ED;
      padding-top: 5px;
      position: absolute;
      height: 90px;
      width: 100%;
      left: 0;
      bottom: 0;
      .v-text{
        font-size: 12px;
        padding-left: 10px;
        box-sizing: border-box;
        margin-right: 40px;
        width: 100px;
        color:#409EFF;
        /*color:rgb(64,164,179);*/
      }
      .split-bg{
        line-height: 35px;
        padding-left: 10px;
        font-size:13px;
        height: 65%;
        .fly-node-select{
          width:100px;
          .el-input__inner{
            background-color: transparent;
            border-color: rgba(199, 204, 206, 0.4);
            border-radius: 0;
          }
        }
      }
      .fly-controls{
        bottom: 7px;
        width:100%;
        position: absolute;
        .fly-control-btn{
          width: 35px;
          height: 35px;
          border: 1px solid #389BEE;
          /*border: 1px solid #5f88c3;*/
         //background-color: rgb(46,212,250);
          background-color: #389BEE;
          border-radius: 50%;
          -webkit-box-shadow: 0px 0px 15px 4px #389BEE inset;
          box-shadow: 0px 0px 15px 4px #389BEE inset;
          color: #fff;
          cursor: pointer;
          margin: 0 5px;
          text-align: center;
          vertical-align: middle;
          display: inline-block;
          text-shadow: 0px 0px 8px #2264a0;
          line-height: 30px;
          &:hover{
            color: #005aff;
          }
        }
        .fly-control-btn.min-btn{
          width: 25px;
          height: 25px;
          font-size: 10px;
          line-height: 20px;
        }
        .stop-btn{
          font-size: 20px;
          margin-top: 9px;
          color: #409EFF;
        }
      }
    }
  }
</style>

