<template>
  <div class="l-timeline"></div>
</template>

<script>
  import {
      mapState,
      mapMutations,
      mapActions
    } from 'vuex'
  const events = [
    'click',
    'change',
    'timelinechanged',
  ]
  const publicPrefix = 'l-';
  import echarts from "echarts";
  export default {
    name: 'LTimeline',
    mixins: [],
    props: {
      timeline: {
        type: Object,
        default: {}
      },
    },
    mounted() {
      //timeline.data 中的每一项，对应于 options 数组中的每个 option。
      this.chart = echarts.init(this.$el);
      this.option = {
        timeline: {
          //symbol:标记的图形，symbolSize：标记的大小，symbolRotate：旋转角度，symbolKeepAspect：symbol 是 path:// 的形式，是否在缩放时保持该图形的长宽比
          //{ name:'2003-01-01', symbol:'arrow', symbolSize:8 }
          data: this.timeline.data,
          axisType:'category',//轴类型：value:数值轴,category:类目轴,默认—time:时间轴
          currentIndex:this.timeline.currentIndex || 0, //默认显示data中的哪项
          //时间轴标签文本
          label: {
            show: true,
            interval: 0, //label 的间隔
            // rotate: 16,  //倾斜角度
            formatter: function(data) {
              let res = '';
              // 长度除以4并向上取整,获取需要显示几行
              let rowNum = Math.ceil(data.length/4);
              let indexNum = 0;  //每次循环加四
              for(let i = 0; i<rowNum; i++) {
                if(i+1 == rowNum){
                  res += data.substring(indexNum,data.length);
                }else{
                  res += data.substring(indexNum,indexNum+4)+ '\n';
                }
                indexNum = indexNum + 4;
              }
              return res
            },
            // formatter: function(time) {
              // let date = new Date(time)
              // let y = date.getFullYear();
              // let MM = date.getMonth() + 1;
              // MM = MM < 10 ? ('0' + MM) : MM;
              // let d = date.getDate();
              // d = d < 10 ? ('0' + d) : d;
              // return y + '-' + MM + '-' + d
              // let html = '';
              // for(let i = 0;i<time.length;i=i+2){
              //   html += time.substr(i,2) + "\n"
              // }
            //   return time
            // },
            //lable文字的颜色
            color: 'rgb(176 241 255)',
            borderColor: '#f3f1f1',
            fontSize: 11,
            emphasis: {
              color: '#1e90ff',
              borderColor: '#1e90ff',
            }
          },
          inverse: false, //是否反向放置,首尾颠倒
          orient: 'horizontal', //时间轴摆放位置:'vertical'：竖直放置;'horizontal'：水平放置。
          padding: [5, 5, 5, 5], //内边距
          left: '26px', //距离容器左侧的距离
          right: '26px', //距离容器右侧的距离
          controlPosition: 'left', //播放按钮显示位置
          realtime: true, //点击时间点的是否，是否更新视图
          loop: true, //是否循环播放
          rewind: false, //是否反向播放
          autoPlay: false, //自动播放
          playInterval: 4000, //播放间隔时间
          /*width:'100%',
          height:'100%',*/
          lineStyle: {
            show: true, //是否显示轴线
            // 线性渐变，前四个参数分别是 x0, y0, x2, y2, 范围从 0 - 1，相当于在图形包围盒中的百分比，如果 globalCoord 为 `true`，则该四个值是绝对的像素位置
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0,
                color: 'rgb(30 144 255)' // 0% 处的颜色
              }, {
                offset: 1,
                color: 'rgb(30 144 255)' // 100% 处的颜色
              }],
              globalCoord: false // 缺省为 false
            },
            width: 1, //线宽
            type: 'dashed', //线的类型：'solid'、'dashed'、'dotted'
            /*shadowBlur:{
              shadowColor: 'rgba(0, 0, 0, 0.5)',
              shadowBlur: 10
            },*/
            //shadowColor:阴影颜色。支持的格式同color。
            //shadowOffsetX:阴影水平方向上的偏移距离。
            //shadowOffsetY:阴影垂直方向上的偏移距离。
            //opacity:透明度
          },
          itemStyle: { //timeline 时间点图形样式。
            // 线性渐变，前四个参数分别是 x0, y0, x2, y2, 范围从 0 - 1，相当于在图形包围盒中的百分比，如果 globalCoord 为 `true`，则该四个值是绝对的像素位置
            opacity: 1,
            color: '#1e90ff',
            borderColor: '#1e90ff',
            emphasis: {
              color: '#1e90ff',
              borderColor: '#1e90ff'
            }
          },
          checkpointStyle: { //选中当前时间点的样式
            symbol: 'circle',
            symbolSize: 8,
            color: '#1e90ff',
            borderColor: '#1e90ff',
          },
          controlStyle: { //控制按钮样式
            show:false, //所有控制按钮是否显示
            // showPrevBtn: false,
            // itemSize: 16,
            // color: '#f3f1f1',
            // borderColor: '#f3f1f1',
            // emphasis: {
            //   color: '#1e90ff', //内颜色
            //   borderColor: '#1e90ff' //外颜色
            // }
          },
        },
      }
      this.chart.setOption(this.option);
      this.chart.resize();
      this.addEventHook(this.chart, events);
    },
    computed: {
      ...mapState({
        specialLayers:state=>state.map.specialLayers,
      })
    },
    watch: {
      timeline: {
        handler(val, oldVal) {
          if(val.data.length>1){//解决时间轴上两个时间点时候第二个label不显示问题
            //EventBus.$emit("init-time-line");
          }
          this.chart.setOption({timeline:this.timeline})
          this.chart.resize()
        },
        deep:true
      },
    },
    methods: {
      ...mapMutations([

        ]),
      addEventHook(l, events) {
        events.forEach((event, index) => {
          let eventName = `${publicPrefix}${event}`;
          l.on(event, (e) => {
            this.$emit(eventName, e);
          })
        })
      },
    }
  }
</script>