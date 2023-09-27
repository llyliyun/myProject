<template>
  <div class="content-list" v-show="geojsonDataFlag">
    <!-- <div class="change-wrap clearfix" v-show="geojsonDataFlag || !firstClick">
      <el-tooltip class="item" effect="dark" content="展开收起查询结果" placement="left">
        <span class="item-span"><i :class="['fa',geojsonDataFlag?'fa-hand-o-down':'fa-hand-o-up']" @click="changeState"></i></span>
      </el-tooltip>
    </div> -->
    <i class="el-icon-close" title="关闭" @click="removeResult"></i>
  	<el-tabs type="border-card"  v-show="geojsonDataFlag" @tab-click="changeTab">
  	  <el-tab-pane v-for="(item,index) in resultList" :key="index" :label="item.name" style="position: relative;height: 100%;">
        <template>
          <statistical-geojson
            ref="table"
            class="result-table"
            :geojsonData="item.data"
            @l-row-click="dataClick"
            :name="item.name"
            :dataType="item.dataType"
          >
          </statistical-geojson>
        </template>
  	  </el-tab-pane>
  	</el-tabs>
  </div>
</template>

<script>
import {
  mapState,
  mapMutations,
  mapActions
} from 'vuex'
import StatisticalGeojson from './StatisticalGeojson'
import Vue from 'vue'

let queryLayer = null;
export default {
  inject: [],
	components: {
    StatisticalGeojson
  },
  data(){
  	return {
  		staData:[],
  		firstClick: true,
      resultList:[],
  	}
  },
  props: {
    isStatis: { //是否需要统计、默认开启
      type: Boolean,
      default: true
    },
  },
  mounted(){
    EventBus.$on("query-geo",this.renderData)
    EventBus.$on('toolbar-clearAll', this.removeResult);
    this.changeGeoJsonDataFlag(false);
    // EventBus.$emit('result-list',this.resultList)
  },
  beforedestroy(){
    EventBus.$off("query-geo",this.renderData)
  },
  computed: {
    ...mapState({
      geojsonDataFlag: state => state.map.geojsonDataFlag,
    })
  },
  methods: {
    ...mapMutations([
      'changeGeoJsonDataFlag'
    ]),
    changeState() {
      this.firstClick = false;
      this.changeGeoJsonDataFlag(!this.geojsonDataFlag)
    },
    dataClick(item, flag){
      if(flag){
        this.queryByID(item)
      }
    },
    changeTab(tab){
      let data = this.resultList.filter((res) =>{
        return tab.label == res.name
      })
      if(data && data.length){
        //this.genaGeoLayer(data[0])
      }
    },
    renderData(recodeset){
      this.resultList = [];
      const list = [];
      // console.log(recodeset,890);
      if(recodeset && recodeset.length){
        for (let i = 0; i < recodeset.length; i++) {
          if (recodeset[i].features && recodeset[i].features.features  && recodeset[i].features.features.length) {
            list.push({
              name: recodeset[i].captionName,
              data: recodeset[i].features
            })
            // console.log(this.resultList,9999);
          }
          EventBus.$emit('result-list',list)

        }
        if (list && list.length) {
          this.changeGeoJsonDataFlag(true);
          //this.genaGeoLayer(this.resultList[0])
        }
      }
      this.resultList = list;
    },
    queryByID(e) {
      let id = e[0].SmID || e[0].SMID || e[0].ID;
      if (queryLayer) {
        queryLayer.eachLayer((layer) => {
          if ((layer.feature.properties.SmID || layer.feature.properties.SMID) === id) {
            layer.bindPopup(new Vue({
              render(h) {
                return ( <
                  FunctionTable
                  objData = {
                    layer.feature.properties
                  }
                  >
                  </FunctionTable>
                )
              }
            }).$mount().$el,
            {
              minWidth: '400',
              keepInView: false
            }).openPopup()

            if (layer.setStyle) {
              layer.setStyle({
                color: 'red',
                fillOpacity: 0.9
              });
            }
            //平面fitBounds有bug
            // this.$refs.map.leaflet.fitBounds(layer.getBounds());

          } else {
            queryLayer.resetStyle(layer);
          }
        })
      }
    },
    genaGeoLayer(data){
      let geojsonData = data.data;
      if (queryLayer) {
        queryLayer.clearLayers();
      }
      var baseballIcon = L.icon({
        iconUrl: './static/img/marker.png',
        iconSize: [32, 37],
        iconAnchor: [16, 37],
        popupAnchor: [0, -28]
      });
      queryLayer = L.geoJSON(geojsonData, {
        onEachFeature(feature, layer) {
          layer.on({
            click(e) {
              if(layer && feature){
                queryLayer.eachLayer((layer) => {
                  queryLayer.resetStyle(layer)
                })
                let targetLayer = e.target;
                targetLayer && targetLayer.setStyle && targetLayer.setStyle({
                  weight: 5,
                  color: 'red',
                  dashArray: '',
                  fillOpacity: 0.9
                })
                EventBus.$emit("result-active",feature.properties);
              }
            }
          })
        },
        style: function() {
          return {
            color: "red",
            fillOpacity: 0.5,
          };
        },
        pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {
            icon: baseballIcon
          });
        }
      }).bindPopup((layer) => {
        return new Vue({
          render(h) {
            return ( <
              FunctionTable objData = {
                layer.feature.properties
              }
            >
            </FunctionTable>)
          }
        }).$mount().$el;
      }, {
        minWidth: '400',
        keepInView: false
      });
      if (this.getMap()) {
        queryLayer.addTo(this.getMap());
      }
      ////默认只有一个对象的情况下打开Popup
      if (geojsonData.features.length == 1) {
        queryLayer.openPopup();
      }
    },
    removeResult(){
      this.resultList = [];
      this.changeGeoJsonDataFlag(false);
      if (queryLayer) {
        queryLayer.clearLayers();
      }
    },
  }
}
</script>

<style lang="scss" scoped>
  .content-list{
    position: absolute;
    bottom: 0;
    width: 70%;
    z-index: 999;
    left: 15%;
    // .el-tabs--border-card {
    //   background: #1d4470;
    // }
    // .el-tabs--border-card>.el-tabs__header{
    //   background: #1d4470;
    // }
    .el-icon-close{
      color: black;
      float: right;
      z-index: 9999999999;
      position: relative;
      padding: 10px;
      cursor: -webkit-grab;
    }
  }
</style>

