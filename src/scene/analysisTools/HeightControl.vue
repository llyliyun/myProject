<template>
	<div>
    <el-row class="row-block">
      <el-col :span="6" class="block-content">
        <el-col :span="24" class="block-content-txt">
          <span class="demonstration">高度(米)</span>
        </el-col>
      </el-col>
      <el-col :span="18">
        <el-slider input-size="small" v-model="controlHeight" :min='1' :max='800' @change='HeiChange' show-input></el-slider>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24" style="text-align: center">
        <el-button size="small" type="primary" @click="init">开始绘制</el-button>
        <el-button size="small" class="btn-none" @click="clearVS">&nbsp;&nbsp;&nbsp;清除&nbsp;&nbsp;&nbsp;</el-button>
      </el-col>
    </el-row>
	</div>
</template>

<script>
	let textEntity,boxEntity,handlerPoint_box,pointOne,centerX,centerY
	export default {
		data() {
      return {
        baseHeight:0,
        controlHeight:20.0,
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
				Viewer.entities.removeAll();
        var viewModel = {
          length:this.length,
          width:this.width,
          controlHeight:this.controlHeight
        };
				let that = this;
        handlerPoint_box = new Cesium.DrawHandler(Viewer,Cesium.DrawMode.Polygon,Cesium.ClampMode.Ground);
        
        var entities = Viewer.entities;
        //注册绘制长方体事件
        handlerPoint_box.drawEvt.addEventListener(function(res){
          var points = res.object.positions;
          let orderPoint = JSON.parse(JSON.stringify(points)).sort((a,b) => a.z - b.z)
          var cartographic=Cesium.Cartographic.fromCartesian(orderPoint[0])
          that.baseHeight = Math.ceil(Viewer.scene.globe.getHeight(cartographic));

          var colorItem = Cesium.Color.byteToFloat(222);
          var alpha = Cesium.Color.byteToFloat(150);
          var color = new Cesium.Color(colorItem,colorItem,colorItem,alpha);
          boxEntity = new Cesium.Entity({
            polygon: {
              hierarchy:new Cesium.PolygonHierarchy(points),
              //height:that.controlHeight,
              extrudedHeight:that.baseHeight+that.controlHeight,
              outline:false,
              outlineColor:Cesium.Color.ANTIQUEWHITE ,
              closeTop:true,
              closeBottom:true,
              fill:true,
              material:color
            },
          });
          handlerPoint_box.polyline.show = false;
          Viewer.entities.add(boxEntity);
          pointOne = points[Math.ceil(points.length/2)];
          centerX = pointOne.x+points[points.length-1].x;
          centerY = pointOne.y+points[points.length-1].y;
          /*textEntity = new Cesium.Entity({
            position:(centerX/2,centerY/2,that.controlHeight+20),
            label:{
                text:"当前高度约为 : " + that.controlHeight.toFixed(2) + " (米)",
                //heightReference:Cesium.HeightReference.RELATIVE_TO_GROUND,
                font:'50px sans-serif',
            }
          });
          Viewer.entities.add(textEntity);*/
        });
        handlerPoint_box.activate();
			},
			HeiChange(val) {
        this.controlHeight = val;
        boxEntity && boxEntity.polygon && boxEntity.polygon.extrudedHeight.setValue(this.baseHeight+val);
        //textEntity.position.label.text = "当前高度约为 : " + val + " (米)";
      },

			clearVS(){
				Viewer.entities.removeAll();
			}
		}
	}
</script>

<style lang="scss" scoped>
	
</style>
