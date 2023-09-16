<template>

</template>

<script>
  import mixin from './../mixins/mixin'
  const events = []
  const props = {
    options: {
      type: Object,
    },
  }
  export default {
    name: 'ChartLine',
    mixins: [mixin],
    props: {
      ...props,
      options: {
        type: Object,
        default: {}
      },
      xData: {
        type: Array,
        default: []
      },
      legendData: {
        type: Array,
        default: []
      },
      seriesData: {
        type: Array,
        default: []
      },
      title:{
        type: String,
        default: ''
      }
    },
    mounted() {
      this.initChart()
      this.addEventHook(this.chart, events);
    },
    watch: {
      options: {
        handler(newVal, oldVal) {
          this.chart.setOption(newVal)
          this.chart.resize()
        },
        deep:true
      },
      seriesData: {
        handler(newVal, oldVal) {
          this.initChart()
          this.chart.resize()
        },
        deep:true
      }
    },
    beforeDestroy() {
      if (this.chart) {
        this.chart.clear()
      }
    },
    methods: {
      initChart(){
        this.chart = echarts.init(this.$el);
        this.option = {
          tooltip: {
            trigger: 'axis',
            /*position: function (pt) {
              return [pt[0], '10%'];
            }*/
          },
          title: {
            left: 'left',
            text: this.title,
            show: this.title ? true : false
          },
          legend: {
            data:this.legendData
          },
          toolbox: {
            feature: {
              dataZoom: {
                yAxisIndex: 'none'
              },
              restore: {},
              saveAsImage: {}
            },
            orient:'vertical'
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: this.xData
          },
          yAxis: {
            type: 'value',
            boundaryGap: [0, '100%']
          },
          dataZoom: [
            {
              show: true,
              realtime: true,
              start: 65,
              end: 85
            },
            {
              type: "inside",
              realtime: true,
              start: 65,
              end: 85
            }
          ],
          series: this.formatSeries()
        };
        this.chart.setOption(this.option);
        this.chart.resize()
      },
      formatSeries(){
        let _arr = []
        for(let i=0; i<this.seriesData.length; i++){
          _arr.push({
            name:this.legendData[i],
            type:'line',
            smooth:true,
            symbol: 'none',
            sampling: 'average',
            itemStyle: {
              color: 'rgb(255, 70, 131)'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: 'rgb(255, 158, 68)'
              }, {
                offset: 1,
                color: 'rgb(255, 70, 131)'
              }])
            },
            data: this.seriesData[i]
          })
        }
        return _arr
      }
    }
  }
</script>
