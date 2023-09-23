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
      <el-col :span="12" class="block-content">
        <el-col :span="10" class="block-content-txt">
          <label>天际线颜色</label>
        </el-col>
        <el-col :span="14" class="block-content-input">
          <el-input
            placeholder=""
            size="small"
            v-model="skyCorlr"
          >
            <el-color-picker v-model="skyCorlr" size="small" slot="suffix" @change="getColor('changeColor')"></el-color-picker>
          </el-input>
        </el-col>
      </el-col>
    </el-row>
    <!--<el-row class="row-block">
      <el-col :span="12" class="block-content">
        <el-col :span="10" class="block-content-txt">
          <span class="demonstration">显示模式</span>
        </el-col>
        <el-col :span="14" class="block-content-input">
          <el-select v-model="skyOption" @change="skylineChange">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-col>
      </el-col>
    </el-row>-->
    <el-row class="row-block">
      <el-col :span="12" class="block-content">
        <el-col :span="10" class="block-content-txt">
          <span class="demonstration">选择宽度</span>
        </el-col>
        <el-col :span="14" class="block-content-input">
          <el-select v-model="skyOption" placeholder="请选择" @change="skylineChange">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
              <div class="skyLineWidth" :style="{backgroundColor:item.color, height:item.height}"></div>
            </el-option>
          </el-select>
        </el-col>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24" style="text-align: center">
        <el-button type="primary" size="small" @click="skyLine">天际线</el-button>
        <el-button type="primary" size="small" @click="getSkyline2D">二维显示</el-button>
        <el-button size="small" class="btn-none" @click="clearLine">&nbsp;&nbsp;&nbsp;清除&nbsp;&nbsp;&nbsp;</el-button>
      </el-col>
    </el-row>


  </div>
</template>

<script>

	// import echarts from 'echarts'
	//import $ from 'jquery'

	let skyline;
	export default {
		data() {
      return {
        pointX: '',
				pointY: '',
				pointZ: '',
				skyCorlr: 'rgb(234,32,32)',
        lineWidth: 3,
        options: [
          {
            value: '3',
            label: '3像素',
            color: "#ea2020",
            height: "3px"
          },
          {
            value: '4',
            label: '4像素',
            color: "#ea2020",
            height: "4px"
          },
          {
            value: '5',
            label: '5像素',
            color: "#ea2020",
            height: "5px"
          }
          ,
          {
            value: '6',
            label: '6像素',
            color: "#ea2020",
            height: "6px"
          }
        ],
        skyOption: '3像素',
				/*options: [
					{
						value: 'line',
						label: '线显示'
					},
					{
						value: 'surface',
						label: '面显示'
					}
				],
				skyOption: '线显示',*/
      }
		},
		mounted() {
			EventBus.$on('skyLine', this.initializing);
			EventBus.$on('clearAll',this.clearLine);
		},
		destroyed() {
			EventBus.$off('skyLine', this.initializing);
			EventBus.$off('clearAll',this.clearLine);
		},
		methods: {
			initializing(tab) {
        skyline = new Cesium.Skyline(Viewer.scene);
        this.getColor();
			},
			skyLine() {
				let scene = Viewer.scene;
				this.clearLine();
				this.getColor();
				//skyline = new Cesium.Skyline(scene);
				var cartographic = scene.camera.positionCartographic;
        var longitude = Cesium.Math.toDegrees(cartographic.longitude);
        var latitude = Cesium.Math.toDegrees(cartographic.latitude);
        var height = cartographic.height;
        //天际线分析的视口位置设置成当前相机位置
        skyline.viewPosition = [longitude, latitude, height];
        //设置俯仰和方向
        skyline.pitch = Cesium.Math.toDegrees(scene.camera.pitch);
        skyline.direction = Cesium.Math.toDegrees(scene.camera.heading);
        skyline.radius = 10000; // 天际线分析半径设置为10000米
        skyline.lineWidth = this.lineWidth;
        skyline.build();
        this.pointX = longitude;
        this.pointY = latitude;
        this.pointZ = height;
			},
			clearLine() {
				Viewer.entities.removeAll();
				this.pointX = '';
        this.pointY = '';
        this.pointZ = '';
				if(skyline) {
					skyline.clear();
				}
        if(document.getElementById('map')) {
          document.getElementById('map').style.display="none";
        }
			},
			getSkyline2D() {
				if(!document.getElementById("map")){
          this.addElementDiv();
        };
        //获取二维天际线对象
        var object = skyline.getSkyline2D();
        this.getColor();
        //用echarts绘制二维天际线
        var myChart = echarts.init(document.getElementById("map"));

        var option = {
            backgroundColor : "rgba(73,139,156,0.9)",
            title : {
                text : "二维天际线"
            },

            tooltip : {
                trigger : "axis"
            },

            calculable : true,
            xAxis : [
                {
                    type : "category",
                    boundaryGap : false,
                    data : object.x,
                    show : false
                }
            ],

            yAxis : [
                {
                    type : "value",
                    min : 0,
                    max : 1
                }
            ],

            series : [
                {
                    name : "",
                    type : "line",
                    data : object.y,
                    color: this.skyCorlr,
                }
            ]
        }
        myChart.setOption(option);
        document.getElementById('map').style.display="block";
			},
			addElementDiv() {
  　　　var parent = document.getElementsByTagName("body");
  　　　//添加 div
  　　　var div = document.createElement("div");

  　　　//设置 div 属性，如 id
  　　　div.setAttribute("id", "map");

  　　　div.style.width = '450px';
        div.style.height = '400px';
        div.style.bottom = '5%';
        div.style.left = '24%';
        div.style.position = 'absolute';
        parent[0].appendChild(div);
  　　},
    	remove() {
	        if(skyline){
	            skyline.destroy();
	            skyline = undefined;
	        }
	    },
	    skylineChange(data) {
        this.lineWidth = data;
        this.clearLine();
        this.skyLine();
	    	/*if(data === 'line') {
	    		skyline.displayStyle = 0;
	    		this.getColor();
	    	}else if(data === 'surface') {
	    		skyline.displayStyle = 1;
	    		this.getColor();
	    	}*/
	    },
	    getColor(param) {
	    	var color = Cesium.Color.fromCssColorString(this.skyCorlr);
        skyline.color = color;
        if(param == "changeColor"){
          this.clearLine();
          this.skyLine();
        }
	    }
		}
	}
</script>

<style lang="scss" scope>
  .skyLineWidth{
    margin-top: 16px;
  }

</style>
