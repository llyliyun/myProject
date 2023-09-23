<template>
  <div>
    <el-row class="row-block">
      <el-col :span="12" class="block-content">
        <el-col :span="12" class="block-content-txt">
          <span class="demonstration">新增范围</span>：</span>
        </el-col>
        <el-col :span="12" class="">
          <el-button size="small" @click="drawLayer">绘制范围</el-button>
        </el-col>
      </el-col>
    </el-row>
    <el-row class="row-block">
      <el-col :span="12" class="block-content">
        <el-col :span="12" class="block-content-txt">
          <span class="demonstration">设计标高(海拔)：</span>
        </el-col>
        <el-col :span="12" class="block-content-slider">
          <el-slider v-model="baseHeight" :min="minHeight" :max="maxHeight" style="width: 100%;display: inline-block;height: 20px;"></el-slider>
          <!-- <el-slider v-model="opacity" @change="opacityChange" ></el-slider> -->
        </el-col>
      </el-col>
      <el-col :span="12" class="block-content">
        <el-col :span="10" class="block-content-txt">
          <!-- <span class="demonstration">开挖深度：</span> -->
        </el-col>
        <el-col :span="14" class="">
          <el-input-number v-model="baseHeight" size="small" style="display: inline-block;" ref="input"  :min="minHeight"  :max="maxHeight" label="设计标高"></el-input-number>
          <!--<el-input-number size="small" v-model="num1" :min="0" label="描述文字"></el-input-number>-->
        </el-col>
      </el-col>
    </el-row>
    <el-row class="row-title">
      <el-col :span="24">
        <span class="row-title-text">结果</span>
      </el-col>
    </el-row>
    <el-row class="row-block">
      <el-col :span="12" class="block-content">
        <el-col :span="10" class="block-content-txt">
          <span class="label-bg label-bg-red"></span>
          <span class="demonstration">挖方体积：</span>
        </el-col>
        <el-col :span="14" >
          <p><span class="badge">{{resultData.excavation || 0}}</span><span>m³</span></p>
        </el-col>
      </el-col>
      <el-col :span="12" class="block-content">
        <el-col :span="10" class="block-content-txt">
          <span class="demonstration">挖方面积：</span>
        </el-col>
        <el-col :span="14" >
          <p><span class="badge">{{resultData.cutArea || 0}}</span><span>m²</span></p>
        </el-col>
      </el-col>
    </el-row>
    <el-row class="row-block">
      <el-col :span="12" class="block-content">
        <el-col :span="10" class="block-content-txt">
          <span class="label-bg label-bg-green"></span>
          <span class="demonstration">填方体积：</span>
        </el-col>
        <el-col :span="14" >
          <p><span class="badge">{{resultData.fill || 0}}</span><span>m³</span></p>
        </el-col>
      </el-col>
      <el-col :span="12" class="block-content">
        <el-col :span="10" class="block-content-txt">
          <span class="demonstration">填方面积：</span>
        </el-col>
        <el-col :span="14" >
          <p><span class="badge">{{resultData.fillArea || 0}}</span><span>m²</span></p>
        </el-col>
      </el-col>
    </el-row>
    <el-row class="row-block">
      <el-col :span="12" class="block-content">
        <el-col :span="10" class="block-content-txt">
          <span class="demonstration">未填挖地面积：</span>
        </el-col>
        <el-col :span="14" >
          <p><span class="badge">{{resultData.remainderArea || 0}}</span><span>m²</span></p>
        </el-col>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24" style="text-align: center">
        <!-- <el-button size="small" type="primary" @click="initDrawHandle">开挖</el-button> -->
        <el-button size="small" type="primary" @click="analysis">开始分析</el-button>
        <el-button size="small" class="btn-none" @click="clearAll">&nbsp;&nbsp;&nbsp;清除&nbsp;&nbsp;&nbsp;</el-button>
        <!--<el-button size="small" class="btn-none" @click="cancle(true)">&nbsp;&nbsp;&nbsp;清除&nbsp;&nbsp;&nbsp;</el-button>-->
      </el-col>
    </el-row>
  </div>
</template>
<script type="text/javascript">
  import { changeUnderGroundAlpha } from '@/components/common/sceneUtil'
  let handlerPolygon, scene;
  import {mapMutations, mapState} from "vuex";
  import {earthworkAnalysis,earthworkAnalysisByIServerServer} from "@/apis/analysis-api.js";
  import {Loading} from 'element-ui';
  import { toLineString } from '@/components/common/polygonToLine'
  let drawHandle,tempResult,drawHandler,polygon,geojsonUtil,_geojsonUtil,geojsonUtils;
  let tempR = new Object();

  export default {
    data() {
      return {
        //海拔
        baseHeight:30,
        maxHeight:APPCONFIG.maxExcavationAltitude||500,
        minHeight:0,
        IServerParams:{
          cutFillType:'REGIONANDALTITUDE',
          baseAltitude:0,//基面高度
          region:{},
          resultDataset:"",
          buildPyramid:false,
          deleteExistResultDataset:true
        },
        resultData:{}
      }
    },
    beforeDestroy(){
      this.cancelDraw();
    },
    /*watch:{
      baseHeight(val){
        this.IServerParams.baseAltitude = val;
        this.clearAll();
        // this.drawResultToScene();
      }
    },*/
    computed: {
      cHasHeightLayer(){
        return Viewer&&Viewer.scene&&Viewer.scene.terrainProvider?!!Viewer.scene.terrainProvider._layers:false;
      }
    },
    mounted() {
      this.initParams();
      EventBus.$on('excavation');
      // EventBus.$on("toolbar-VolumeDataVm", this.VolumeData);
      EventBus.$on('toolbar-clearAll', this.clearAll);
      EventBus.$on('clearAll',this.clearAll);
    },
    beforeDestroy(){
      EventBus.$off('excavation');
      // EventBus.$off("toolbar-VolumeDataVm", this.VolumeData);
      EventBus.$off('toolbar-clearAll', this.clearAll);
      EventBus.$off('clearAll',this.clearAll);
    },
    methods: {
      ...mapMutations([
        'cChangeIsDrawing'
      ]),
      drawLayer(){
        let self = this,positions = [],height = 0,num = 0
        drawHandler =  drawHandler || new CesiumApp.DrawHandler(Viewer)
        drawHandler.drawPolygon(0,(result, latlngArr) => {
          polygon = L.polygon(latlngArr).toGeoJSON();
          let _geojsonData = {
            type:"FeatureCollection",
            features:[polygon]
          }
          geojsonUtils = geojsonUtils || new CesiumApp.GeojsonUtil({stroke: Cesium.Color.RED.withAlpha(.5),strokeWidth: 3})
          geojsonUtils.load(Viewer,this.polygonToPolyline(_geojsonData),'drawLayer',{clearOnAdd:false,focus:false})
          if(this.cHasHeightLayer){
            latlngArr.forEach((point) => {
              positions.push(Cesium.Cartographic.fromDegrees(point.lng, point.lat))
            })
            let prom = Cesium.sampleTerrainMostDetailed(Viewer.scene.terrainProvider, positions);
            Cesium.when(prom, function (updatedPositions) {
              if(updatedPositions.length){
                updatedPositions.forEach((val) => {
                  if(val.height != undefined){
                    num = num + 1
                    height += val.height
                  }
                })
                if(num){
                  self.baseHeight = + Math.ceil(height/num)
                }else{
                  self.baseHeight = 30
                }
              }else{
                self.baseHeight = 30
              }
            })
          }else{
            self.baseHeight = 30
          }
          drawHandler.destory()
        })
      },
      polygonToPolyline(geojsonData){
        let _geojsonData = JSON.parse(JSON.stringify(geojsonData))
        let resLine = []
        if(_geojsonData.type == "FeatureCollection" && _geojsonData.features.length){
          _geojsonData.features.forEach((item) => {
            if(item.geometry.type != "MultiLineString"){
              resLine = toLineString(item);
              item.geometry.coordinates = resLine;
              item.geometry.type = 'MultiLineString';
            }
          })
        }
        return _geojsonData
      },
      async analysis(){
        let self = this,wallPositions=[]
        if(!polygon){
          this.$message.warning('请先绘制范围')
          return
        }
        let _geojsonData = {
          type:"FeatureCollection",
          features:[polygon]
        }
        const loading = this.$loading({
          lock: true,
          text: '正在分析...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });

        let params = {
          cutFillType:'REGIONANDALTITUDE',
          baseAltitude:this.baseHeight,//基面高度
          region:new SuperMap.Format.GeoJSON().fromGeoJSON(_geojsonData)[0].geometry,
          resultDataset:"",
          buildPyramid:false,
          deleteExistResultDataset:true
        }
        let res = await earthworkAnalysisByIServerServer({params}).catch(e=>{
          if(loading&&loading.close)loading.close();
          self.$message.warning("你绘制的区域可能不在有效的高程数据范围内，请重新绘制一块地块试试。");
        })
        if(res.data.succeed){
          geojsonUtil = geojsonUtil || new CesiumApp.GeojsonUtil({fill: Cesium.Color.RED.withAlpha(.5),hightLightColor:null})
          geojsonUtil.load(Viewer, _geojsonData,'userHeightPolygonUp', {
            // polygonOutline: true,
            focus: false
          })
          let tempR = {};
          tempR.excavation = res.data.cutVolume.toFixed(2);
          tempR.fill = res.data.fillVolume.toFixed(2);
          tempR.cutArea = (res.data.cutArea/667).toFixed(2);
          tempR.fillArea = (res.data.fillArea/667).toFixed(2);
          tempR.remainderArea = (res.data.remainderArea/667).toFixed(2);
          this.resultData = tempR;
          let _geojson = JSON.parse(JSON.stringify(_geojsonData))
          _geojson.features.forEach((item) => {
            if(item.geometry.coordinates[0].length == 1){
              item.geometry.coordinates[0][0].forEach((val) => {
                val.push(self.baseHeight)
              })
            }else{
              item.geometry.coordinates[0].forEach((val) => {
                val.push(self.baseHeight)
              })
            }

          })
          _geojsonUtil = _geojsonUtil || new CesiumApp.GeojsonUtil({fill: Cesium.Color.GREEN.withAlpha(.5),hightLightColor:null})
          _geojsonUtil.load(Viewer, _geojson,'userHeightPolygonDown', {
              // polygonOutline: true,
              focus: false
            })
        }
        loading.close();
      },
      initParams(){
        tempResult = null;
        this.IServerParams = {
          cutFillType:'REGIONANDALTITUDE',
          baseAltitude:this.baseHeight,//基面高度
          region:{},
          resultDataset:"",
          buildPyramid:false,
          deleteExistResultDataset:true
        };
      },
      //修改透明度
      // opacityChange(opacity){
      //   // Viewer.scene.globe.globeAlpha  = opacity/100;
      //   changeUnderGroundAlpha(opacity/100, Viewer);
      // },
      // VolumeData(area) {
      //   this.area = area;
      //   var Areas = area * this.num1;
      //   this.excavation = Areas.toFixed(2);
      // },
      // clearVS() {
      //   try {
      //     EventBus.$emit("toolbar-clearAll");
      //   } catch (e) {}
      // },
      initDraw() {
        let that = this;
        scene = window.Viewer.scene;
        //开启深度检测
        scene.undergroundMode = true;
        handlerPolygon = new Cesium.DrawHandler(Viewer, Cesium.DrawMode.Polygon, 0);
        /*handlerPolygon = new Cesium.DrawHandler(Viewer,Cesium.DrawMode.Polygon,Cesium.ClampMode.Ground);*/
        handlerPolygon.clampMode = 1;
        handlerPolygon.deactivate();
        handlerPolygon.activeEvt.addEventListener(function(isActive) {
          if (isActive == true) {
            Viewer.enableCursorStyle = false;
            Viewer._element.style.cursor = '';
          } else {
            Viewer.enableCursorStyle = true;
          }
        });
        handlerPolygon.drawEvt.addEventListener(function(result) {
          if (!result.object.positions) {
            handlerPolygon.polygon.show = false;
            handlerPolygon.polyline.show = false;
            handlerPolygon.deactivate();
            //handlerPolygon.activate();
            return;
          };
          var array = [].concat(result.object.positions);
          var positions = [];
          for (var i = 0, len = array.length; i < len; i++) {
            var cartographic = Cesium.Cartographic.fromCartesian(array[i]);
            var longitude = Cesium.Math.toDegrees(cartographic.longitude);
            var latitude = Cesium.Math.toDegrees(cartographic.latitude);
            var h = cartographic.height;
            if (positions.indexOf(longitude) == -1 && positions.indexOf(latitude) == -1) {
              positions.push(longitude);
              positions.push(latitude);
              positions.push(h);
            }
          }
          var dep = that.num1;
          var excavationOptions = {
            name : 'ggg' ,
            position : positions,
            height : dep,
            transparent : false
          };
          Viewer.scene.globe.removeAllExcavationRegion();
          Viewer.scene.globe.addExcavationRegion(excavationOptions);
          var layers3Ds = Viewer.scene.layers._layers._array;
          layers3Ds = layers3Ds.filter((item, index) => {
            return item.height >= that.evaHeight
          });
          for (var i = 0; i < layers3Ds.length; i++) {
            layers3Ds[i].removeExcavationRegion('ggg');
            layers3Ds[i].addExcavationRegion({
              name: 'ggg',
              position: positions
            });
          };
          Viewer.scene.screenSpaceCameraController.minimumZoomDistance = -1000;
          handlerPolygon.polygon.show = false;
          handlerPolygon.polyline.show = false;
          handlerPolygon.deactivate();
          //handlerPolygon.activate();
        });
        if (!scene.pickPositionSupported) {
          alert('不支持深度纹理,无法绘制多边形，地形开挖功能无法使用！');
        }
      },
      // startExc() {
      //   if (handlerPolygon) {
      //     EventBus.$emit("toolbar-measured", "polyline", true, true, "excavation");
      //     handlerPolygon.activate();
      //   }
      // },
      //绘制多边形
      initDrawHandle(){
        if(!drawHandle){
          drawHandle = new Cesium.DrawHandler(Viewer,Cesium.DrawMode.Polygon,0);
          drawHandle.clampMode = Cesium.ClampMode.Ground;
          Viewer.entities.removeAll();
          this.initDrawEvent();
        }
        try{Cesium.USERHANDEL = drawHandle;}catch(e){};
        drawHandle.activate();
      },
      //绘制多边形 添加提示信息
      initDrawEvent(){
        if(!drawHandle)return;
        let that = this;
        document.oncontextmenu = function(){
          return false;
        };
        drawHandle.activeEvt.addEventListener(function(isActive){
          try{Cesium.TIPSTR = isActive?'<p>在场景绘制项目建设的区域</p><br/><p>右键单击结束或取消绘制</p>':''}catch(e){};
          try{Cesium.STATE.ISDRAWING = isActive;}catch(e){};
          that.cChangeIsDrawing(isActive);
        });
        drawHandle.drawEvt.addEventListener(that.soilQuantity);
      },
      soilQuantity(result){
        let that = this;
        if(!result)return;
        if(!result.object.positions){return;}
        result = result||tempResult;
        that.clearAll();
        tempResult = Cesium.clone(result);
        that.quantityAnalysis(tempResult);
        // that.drawResultToScene(tempResult);
        if(drawHandle){
          drawHandle.polygon.polygon.material = Cesium.Color.GREEN.withAlpha(0.8);
          drawHandle.polyline&&(drawHandle.polyline.show = false);
          drawHandle.deactivate();
          drawHandle = null;
        }
      },
      drawResultToScene(result){
        let that = this;
        result = result||tempResult;
        var array = [].concat(result.object.positions);
        if(array.length<3){that.$message({message: '绘制一个区域最少需要绘制三个点！',type: 'info'});return;};
        var polygonOptions = {},wallPositions=[],result={};
        for(var i = 0, len = array.length; i < len; i ++){
          var cartographic = Cesium.Cartographic.fromCartesian(array[i]);
          var longitude = Cesium.Math.toDegrees(cartographic.longitude);
          var latitude = Cesium.Math.toDegrees(cartographic.latitude);
          var h = cartographic.height + that.baseHeight;
          wallPositions.push(longitude,latitude,that.baseHeight);
          if(polygonOptions.coordinates instanceof Array)
            polygonOptions.coordinates.push([latitude,longitude,that.baseHeight]);
          else
            polygonOptions.coordinates = [[latitude,longitude,that.baseHeight]];
        };
        wallPositions.push(wallPositions[0],wallPositions[1],wallPositions[2]);
        Cesium.drawWall(wallPositions,'static/imgs/parts/r-b.png');
        if(polygonOptions.coordinates && polygonOptions.coordinates.length) polygonOptions.coordinates.push(polygonOptions.coordinates[0]);
        if(polygonOptions.coordinates.length<4){console.log("最少三个点才能构造一个面。");return;}
        let polygon = L.polygon([polygonOptions.coordinates]).toGeoJSON();
        Cesium.superpositionGeoJsonData(polygon,{fill:Cesium.Color.RED.withAlpha(0.8),name:'userHeightPolygon'});
      },
      //控制海拔变化
      quantityAnalysis(result){
        let that = this,positions = [],height = 0,num = 0,newPoint = [];
        that.loading = Loading.service({
          target: document.body,
          background: 'rgba(0, 0, 0, 0.8)',
          text: '正在分析中，请稍后...',
          spinner: 'el-icon-loading'
        });
        result = result||tempResult;
        var array = [].concat(result.object.positions);
        if(array.length<3){that.$message({message: '绘制一个区域最少需要绘制三个点！',type: 'info'});return;};
        var points = [];
        try {
          for(var i = 0, len = array.length; i < len; i ++){
            var cartographic = Cesium.Cartographic.fromCartesian(array[i]);
            var longitude = Cesium.Math.toDegrees(cartographic.longitude);
            var latitude = Cesium.Math.toDegrees(cartographic.latitude);
            // var h = cartographic.height + that.baseHeight;
            points.push({x:longitude,y:latitude});
          };
          points.forEach((item) => {
            newPoint.push({lng:item.x,lat:item.y})
          })
          let polygon = L.polygon(newPoint).toGeoJSON();
          Cesium.superpositionGeoJsonData(polygon,{fill:Cesium.Color.RED.withAlpha(0.8),name:'userHeightPolygondown'});
          points.forEach((point) => {
            positions.push(Cesium.Cartographic.fromDegrees(point.x, point.y))
          })
          let prom = Cesium.sampleTerrainMostDetailed(Viewer.scene.terrainProvider, positions);
          Cesium.when(prom, function (updatedPositions) {
            if(updatedPositions.length){
              updatedPositions.forEach((val) => {
                if(val.height != undefined){
                  num = num + 1
                  height += val.height
                }
              })
              if(num){
                that.baseHeight = + Math.ceil(height/num)
              }else{
                that.baseHeight = 30
              }
            }else{
              that.baseHeight = 30
            }
            that.$refs.input.handleInputChange()
            that.IServerParams.baseAltitude = + Math.ceil(that.baseHeight);
            that.IServerParams.region = {"type":"REGION","points":points};
            earthworkAnalysisByIServerServer({params:that.IServerParams}).then(res=>{
              if(that.loading && that.loading.close)that.loading.close();
              tempR.excavation = res.data.cutVolume.toFixed(2);
              tempR.fill = res.data.fillVolume.toFixed(2);
              tempR.cutArea = res.data.cutArea.toFixed(2);
              tempR.fillArea = res.data.fillArea.toFixed(2);
              tempR.remainderArea = res.data.remainderArea.toFixed(2);
              that.resultData = Object.assign(tempR,that.resultData);
            })
            let _geojson = JSON.parse(JSON.stringify({type: "FeatureCollection",features:[polygon]}))
            _geojson.features.forEach((item) => {
              item.geometry.coordinates[0].forEach((val) => {
                val.push(that.baseHeight)
              })
            })
            Cesium.superpositionGeoJsonData(_geojson,{fill:Cesium.Color.GREEN.withAlpha(0.8),name:'userHeightPolygonup'});
          })
        } catch (e){
          if(that.loading&&that.loading.close)that.loading.close();
          that.$message.warning("你绘制的区域可能不在有效的高程数据范围内，请重新绘制一块地块试试。");
        }
      },
      clearAll(){
        _geojsonUtil && _geojsonUtil.removeDatasouceByName('userHeightPolygonDown');
        geojsonUtil && geojsonUtil.removeDatasouceByName('userHeightPolygonUp');
        geojsonUtils && geojsonUtils.removeDatasouceByName('drawLayer');
        // Viewer.entities.removeAll();
        //this.cancelDraw();

      },
      destroyDrawHandle(){
        drawHandle && drawHandle.deactivate();
        try{drawHandle.clear();}catch(e){};
        drawHandle = null;
        tempResult = null;
        this.cChangeIsDrawing(false);
      },
      cancelDraw(){
        this.destroyDrawHandle();
        this.cChangeIsDrawing(false);
      },
      //取消绘制
      // cancle(isClearAll) {
      //   this.excavation = 0;
      //   Viewer.scene.globe.removeAllExcavationRegion();
      //   var layers3Ds = Viewer.scene.layers._layers._array;
      //   for(var i=0;i<layers3Ds.length;i++){
      //     layers3Ds[i].removeExcavationRegion('ggg');
      //   };
      //   // Viewer.scene.screenSpaceCameraController.minimumZoomDistance = 10;
      //   try{
      //     //关闭深度检测
      //     //scene.globe.depthTestAgainstTerrain = false;
      //     handlerPolygon.polygon.show=false;
      //     handlerPolygon.polyline.show=false;
      //     handlerPolygon.deactivate();
      //   }catch(e){};
      //   if(isClearAll) EventBus.$emit("toolbar-clearAll");
      // }
    }
  }
</script>
<style lang="scss" scoped>
</style>
