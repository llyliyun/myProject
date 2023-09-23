<template>
  <div>
    <el-row class="row-title">
      <el-col :span="24">
        <span class="row-title-text">观察点位置</span>
      </el-col>
    </el-row>
    <el-row class="row-block">
      <el-col :span="12" class="block-content">
        <el-col :span="10" class="block-content-txt">
          <span class="demonstration">X位置</span>
        </el-col>
        <el-col :span="14" class="block-content-input">
          <el-input size="small" v-model="pointX" ></el-input>
        </el-col>
      </el-col>
      <el-col :span="12" class="block-content">
        <el-col :span="10" class="block-content-txt">
          <span class="demonstration">Y位置</span>
        </el-col>
        <el-col :span="14" class="block-content-input">
          <el-input size="small" v-model="pointY" ></el-input>
        </el-col>
      </el-col>
    </el-row>
    <el-row class="row-block">
      <el-col :span="12" class="block-content">
        <el-col :span="10" class="block-content-txt">
          <span class="demonstration">Z高度</span>
        </el-col>
        <el-col :span="14" class="block-content-input">
          <el-input size="small" v-model="pointZ"></el-input>
        </el-col>
      </el-col>
    </el-row>
    <el-row class="row-block" >
      <el-col :span="12" class="block-content">
        <el-col :span="10" class="block-content-txt">
          <label>可视域颜色</label>
        </el-col>
        <el-col :span="14" class="block-content-input">
          <el-input
            placeholder=""
            size="small"
            v-model="trueColor"
          >
            <el-color-picker v-model="trueColor" size="small" slot="suffix" ></el-color-picker>
          </el-input>
        </el-col>
      </el-col>
      <el-col :span="12" class="block-content">
        <el-col :span="10" class="block-content-txt">
          <label>不可视颜色</label>
        </el-col>
        <el-col :span="14" class="block-content-input">
          <el-input
            placeholder=""
            size="small"
            v-model="errorColor"
          >
            <el-color-picker v-model="errorColor" size="small" slot="suffix"></el-color-picker>
          </el-input>
        </el-col>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24" style="text-align: center">
        <el-button type="primary" size="small" @click="addViewpoint">添加观察点</el-button>
        <el-button type="primary" size="small" @click="addTargetPoint">添加目标点</el-button>
        <el-button size="small" class="btn-none" @click="clearSL">&nbsp;&nbsp;&nbsp;清除&nbsp;&nbsp;&nbsp;</el-button>
      </el-col>
    </el-row>
  </div>
</template>
<script>
  let sightline,
      sgPointHandler, 
      viewPointFlag = false; //是否已经添加了
  import {
    mapState,
    mapMutations
  } from 'vuex'

  export default {
    data() {
      return {
        pointX: '',
        pointY: '',
        pointZ: '',
        trueColor: 'rgb(0,255,0)',
        errorColor: 'rgb(255,0,0)',
      }
    },
    mounted() {
      EventBus.$on('sightLine', this.sightInitializing);
      EventBus.$on('clearAll',this.clearSL);
    },
    destroyed() {
      EventBus.$off('sightLine', this.sightInitializing);
      EventBus.$off('clearAll',this.clearSL);
    },
    methods: {
      sightInitializing(tab) {
        sightline = new Cesium.Sightline(Viewer.scene);
        sightline.couldRemove = false;
        sgPointHandler = new Cesium.PointHandler(Viewer);

        let that = this;

        sgPointHandler.drawCompletedEvent.addEventListener((point) => {
          if (!viewPointFlag) {
            this.$message.warning('未添加观察点！');
            return;
          }
          let pointS = point.object;
          pointS.show = false;
          let position = point.object.position;
          sightline.build();
          //将获取的点的位置转化成经纬度
          let cartographic = Cesium.Cartographic.fromCartesian(position);
          let longitude = Cesium.Math.toDegrees(cartographic.longitude);
          let latitude = Cesium.Math.toDegrees(cartographic.latitude);
          let height = cartographic.height;

          if(Viewer.scene.viewFlag) {
            Viewer.entities.add({
              position: position,
              point: {
                pixelSize: 10,
                color: Cesium.Color.WHITE
              }
            });
            //设置视口位置
            sightline.viewPosition = [longitude, latitude, height];
            // Viewer.scene.viewFlag = false;

            that.pointX = longitude;
            that.pointY = latitude;
            that.pointZ = height;
          } else {
            if (sightline.couldRemove) {
              sightline.removeAllTargetPoint();
            }

            Viewer.entities.remove(point.object);
            //添加视点
            sightline.addTargetPoint({
                position : [longitude, latitude, height],
                name : "point" + new Date()
            });
            
            sightline.couldRemove = true;
          }
          let tcolor = Cesium.Color.fromCssColorString(that.trueColor);
          sightline.visibleColor = tcolor;

          let utcolor = Cesium.Color.fromCssColorString(that.errorColor);
          sightline.hiddenColor = utcolor;
        });
      },
      removeSight() {
        if(sgPointHandler){
          sgPointHandler.deactivate();
        }
        Viewer.entities.removeAll();
        if(sightline){
          sightline = sightline.destroy();
          sightline = undefined;
        }
      },
      addViewpoint() {
        viewPointFlag = true;
        if(sgPointHandler.active) {
          return;
        }
        Viewer.scene.viewFlag = true;
        Viewer.entities.removeAll();
        if(sightline.couldRemove) {
          sightline.removeAllTargetPoint();
        }
        sgPointHandler.activate();
      },
      addTargetPoint() {
        Viewer.scene.viewFlag = false;
        sgPointHandler.activate();
      },
      clearSL() {
        Viewer.entities.removeAll();
        this.pointX = '';
        this.pointY = '';
        this.pointZ = '';
        if(sightline && sightline.couldRemove){
          sightline.removeAllTargetPoint();
          sightline.couldRemove = false;
        }
      }
    }
  }
</script>
<style type="text/css">

</style>
