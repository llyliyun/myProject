<template>
	<!-- <section>可视域分析</section> -->
	<div id='content1' class="view-shed-3d-root">
    <el-row class="row-title">
      <el-col :span="24">
        <span class="row-title-text">观察者信息</span>
      </el-col>
    </el-row>
    <el-row class="row-block">
      <el-col :span="12" class="block-content">
        <el-col :span="10" class="block-content-txt">
          <span class="demonstration">方向(度)</span>
        </el-col>
        <el-col :span="14" class="block-content-slider">
          <el-slider v-model="params.direction" size="small" :min='0' :max='360' @change='DirChange'></el-slider>
        </el-col>
      </el-col>
      <el-col :span="12" class="block-content">
        <el-col :span="10" class="block-content-txt">
        <span class="demonstration">翻转(度)</span>
        </el-col>
        <el-col :span="14" class="block-content-slider">
          <el-slider v-model="params.pitch" :min='-90' :max='90' @change='PitChange'></el-slider>
        </el-col>
      </el-col>
    </el-row>
    <el-row class="row-block" >
      <el-col :span="12" class="block-content">
        <el-col :span="10" class="block-content-txt">
        <span class="demonstration">距离(米)</span>
        </el-col>
        <el-col :span="14" class="block-content-slider">
        <el-slider v-model="params.distance" :min='1' :max='2000' @change='DisChange'></el-slider>
        </el-col>
      </el-col>
      <el-col :span="12" class="block-content">
        <el-col :span="10" class="block-content-txt">
        <span class="demonstration">水平视角(度)</span>
        </el-col>
        <el-col :span="14" class="block-content-slider">
          <el-slider v-model="params.horizonalFov" :min='1' :max='120' @change='HorChange'></el-slider>
        </el-col>
      </el-col>
    </el-row>
    <el-row class="row-block" >
      <el-col :span="12" class="block-content">
        <el-col :span="10" class="block-content-txt">
        <span class="demonstration">垂直视角(度)</span>
        </el-col>
        <el-col :span="14" class="block-content-slider">
          <el-slider v-model="params.verticalFov" :min='1' :max='90' @change='VerChange'></el-slider>
        </el-col>
      </el-col>
    </el-row>
    <el-row class="row-block" >
      <el-col :span="12" class="block-content">
        <el-col :span="10" class="block-content-txt">
          <label>可见域颜色</label>
        </el-col>
        <el-col :span="14" class="block-content-input">
        <el-input
          placeholder=""
          size="small"
          v-model="params.looked"
        >
          <el-color-picker v-model="params.looked" size="small" slot="suffix" @change='lookChange' ></el-color-picker>
        </el-input>
        </el-col>
      </el-col>
      <el-col :span="12" class="block-content">
        <el-col :span="10" class="block-content-txt">
          <label>不可见域颜色</label>
        </el-col>
        <el-col :span="14" class="block-content-input">
        <el-input
          placeholder=""
          size="small"
          v-model="params.unlooked"
        >
          <el-color-picker v-model="params.unlooked" size="small" slot="suffix" @change='unlookChange' ></el-color-picker>
        </el-input>
        </el-col>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24" style="text-align: center">
        <el-button type="primary" size="small" @click="chooseView">添加可视域</el-button>
        <el-button size="small" class="btn-none" @click="clearVS">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;清除&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</el-button>
      </el-col>
    </el-row>
	</div>
</template>

<script>
	let pointHandler,viewshed3D,handler,viewPosition
	export default {
		data() {
      return {
        params:{
          direction:0.0,
          pitch:0.0,
          distance:0.0,
          horizonalFov:0.0,
          verticalFov:0.0,
          looked:'#00FF00',
          unlooked:'#FF0000',
        },
      }
		},
		
		mounted() {
			EventBus.$on('clearAll',this.clearVS);
		},
		destroyed() {
			EventBus.$off('clearAll',this.clearVS);
		},
		methods:{
			init(){
				let scene = Viewer.scene;
				let params = this.params;
				scene.viewFlag = true;
				// pointHandler = new Cesium.PointHandler(Viewer);
				pointHandler = new Cesium.DrawHandler(Viewer, Cesium.DrawMode.Point);
        	//创建可视域分析对象
          viewshed3D= new Cesium.ViewShed3D(scene);
        	handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
          viewshed3D.visibleAreaColor = Cesium.Color.fromCssColorString(this.params.looked);
          viewshed3D.hiddenAreaColor = Cesium.Color.fromCssColorString(this.params.unlooked);
          /*params.looked = viewshed3D.visibleAreaColor.toCssColorString();
          params.unlooked = viewshed3D.hiddenAreaColor.toCssColorString();*/
          
          //鼠标移动事件回调
          handler.setInputAction(function(e){
            //若此标记为false，则激活对可视域分析对象的操作
            if (!scene.viewFlag) {
              //获取鼠标屏幕坐标,并将其转化成笛卡尔坐标
              var position = e.endPosition;
              var last = scene.pickPosition(position);

              //计算该点与视口位置点坐标的距离
              var distance = Cesium.Cartesian3.distance(viewPosition, last);

              if(distance > 0 ){
                //将鼠标当前点坐标转化成经纬度
                var cartographic = Cesium.Cartographic.fromCartesian(last);
                var longitude = Cesium.Math.toDegrees(cartographic.longitude);
                var latitude = Cesium.Math.toDegrees(cartographic.latitude);
                var height = cartographic.height;

                //通过该点设置可视域分析对象的距离及方向
                if(viewshed3D){
                  viewshed3D.setDistDirByPoint([longitude, latitude, height]);
                }
              }
            }
          },Cesium.ScreenSpaceEventType.MOUSE_MOVE);

          handler.setInputAction(function(e){
            //鼠标右键事件回调，不再执行鼠标移动事件中对可视域的操作
            scene.viewFlag = true;
            // $("#wrapper").show();
            if(viewshed3D){
              params.direction = viewshed3D.direction;
              params.pitch = viewshed3D.pitch;
              params.distance = viewshed3D.distance;
              params.horizontalFov = viewshed3D.horizontalFov;
              params.verticalFov = viewshed3D.verticalFov;
              // params.looked = viewshed3D.visibleAreaColor;
              // params.unlooked = viewshed3D.hiddenAreaColor;
            }
          },Cesium.ScreenSpaceEventType.RIGHT_CLICK);

          pointHandler.drawEvt.addEventListener(function(result){
            var point = result.object;
            var position = point.position
            viewPosition = position;
            //将获取的点的位置转化成经纬度
            var cartographic = Cesium.Cartographic.fromCartesian(position);
            var longitude = Cesium.Math.toDegrees(cartographic.longitude);
            var latitude = Cesium.Math.toDegrees(cartographic.latitude);
            var height = cartographic.height + 2;
            point.position = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
            if(scene.viewFlag) {
              //设置视口位置
              viewshed3D.viewPosition = [longitude, latitude, height];
              viewshed3D.build();
              //将标记置为false以激活鼠标移动回调里面的设置可视域操作
              scene.viewFlag = false;
            }
          });

			},
			DirChange(val) {
        this.params.direction = val;
        viewshed3D.direction = parseFloat(val); 
      },
      PitChange(val){
        this.params.pitch = val;
        viewshed3D.pitch = parseFloat(val);
      },
      DisChange(val){
        this.params.distance = val;
        viewshed3D.distance = parseFloat(val);
      },
      HorChange(val){
        this.params.horizonalFov = val;
        viewshed3D.verticalFov = parseFloat(val);
      },
      VerChange(val){
        this.params.verticalFov = val;
        viewshed3D.horizontalFov = parseFloat(val);
      },
      lookChange(val){
        this.params.looked = val;
        //viewshed3D.visibleAreaColor = Cesium.Color.fromCssColorString(val);
      },
      unlookChange(val){
        this.params.unlooked = val;
        //viewshed3D.hiddenAreaColor = Cesium.Color.fromCssColorString(val);
      },

      chooseView(){
        this.clearVS();
        if(pointHandler){
          pointHandler.deactivate();
        }

				this.init();
        if(pointHandler.active) {
            return;
        }
				//先清除之前的可视域分析
        Viewer.entities.removeAll();
        viewshed3D.distance = 0.1;
        Viewer.scene.viewFlag = true;
        
        //先清除之前的可视域分析
        Viewer.entities.removeAll();
        viewshed3D.distance = 0.1;
        Viewer.scene.viewFlag = true;
        //激活绘制点类
        pointHandler.activate();
      },

	    clearVS(){
	      Viewer.entities.removeAll();
				Viewer.scene.viewFlag = true;
	      // pointHandler.deactivate();
	      if(pointHandler){
		      pointHandler.deactivate();
					pointHandler.point.show = false;
		    }
        if(viewshed3D){
          viewshed3D.distance = 0.1;
          viewshed3D.destroy();
          viewshed3D= undefined;
        }
	    },
		},
	}
</script>

<style lang="scss" >

</style>
