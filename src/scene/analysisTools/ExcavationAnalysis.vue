<template>
  <div>
    <el-row class="row-block">
      <el-col :span="12" class="block-content">
        <el-col :span="10" class="block-content-txt">
          <span class="demonstration">透明度：</span>
        </el-col>
        <el-col :span="14" class="block-content-slider">
          <el-slider v-model="opacity" @change="opacityChange" ></el-slider>
        </el-col>
      </el-col>
      <el-col :span="12" class="block-content">
        <el-col :span="10" class="block-content-txt">
          <span class="demonstration">开挖深度：</span>
        </el-col>
        <el-col :span="14" class="">
          <el-input-number size="small" v-model="num1" :min="0" label="描述文字"></el-input-number>
        </el-col>
      </el-col>
    </el-row>
    <el-row class="row-block">
      <el-col :span="12" class="block-content">
        <el-col :span="10" class="block-content-txt">
          <span class="demonstration">挖方体积：</span>
        </el-col>
        <el-col :span="14" >
          <p>
          <span class="badge">{{VolumeArea}}</span>
          <span>m³</span>
          </p>
        </el-col>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24" style="text-align: center">
        <el-button size="small" type="primary" @click="startExc" class="btn-view">开挖</el-button>
        <el-button size="small" class="btn-none" @click="cancle">&nbsp;&nbsp;&nbsp;清除&nbsp;&nbsp;&nbsp;</el-button>
      </el-col>
    </el-row>
  </div>
</template>
<script type="text/javascript">
  import { changeUnderGroundAlpha } from '@/components/common/sceneUtil'

  let handlerPolygon, scene;
  export default {
    data() {
      return {
        num1: 20,
        opacity:100,
        evaHeight:APPCONFIG.ExcavateHeight,
	      area: 0,
      	VolumeArea: 0
      }
    },
    mounted() {
      EventBus.$on('excavation', this.initDraw);
      EventBus.$on("toolbar-VolumeDataVm", this.VolumeData);
      EventBus.$on('clear-excavation',this.cancle);
    },
    beforeDestroy(){
      EventBus.$off('excavation', this.initDraw);
      EventBus.$off("toolbar-VolumeDataVm", this.VolumeData);
      EventBus.$off('clear-excavation',this.cancle);
    },
    methods: {
      opacityChange(opacity){
        // Viewer.scene.globe.globeAlpha  = opacity/100;
        changeUnderGroundAlpha(opacity/100, Viewer);
      },
      VolumeData(area) {
        this.area = area;
        var Areas = area * this.num1;
        this.VolumeArea = Areas.toFixed(2);
      },
      clearVS() {
        try {
          EventBus.$emit("toolbar-clearAll");
        } catch (e) {}
      },
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
      startExc() {
        if (handlerPolygon) {
          EventBus.$emit(
            "toolbar-measured",
            "polyline",
            true,
            true,
            "excavation"
          );
          handlerPolygon.activate();
        }
      },
      cancle() {
        this.VolumeArea = 0;
      
        Viewer.scene.globe.removeAllExcavationRegion();
        var layers3Ds = Viewer.scene.layers._layers._array;
        for(var i=0;i<layers3Ds.length;i++){
          layers3Ds[i].removeExcavationRegion('ggg');
        };
        // Viewer.scene.screenSpaceCameraController.minimumZoomDistance = 10;
        try{
          //关闭深度检测
          //scene.globe.depthTestAgainstTerrain = false;
          handlerPolygon.polygon.show=false;
          handlerPolygon.polyline.show=false;
          handlerPolygon.deactivate();
        }catch(e){};
      },
    }
  }
</script>
<style lang="scss" scoped>
</style>
