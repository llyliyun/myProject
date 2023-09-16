<template>
  <div class="realtime-container">
    <p
      ref="changeMapTypeBtn"
      class="changeMapTypeBtn"
      style="position: absolute; bottom: 30px;left: 100px;z-index: 100000;display:none;"
    >
      <el-radio-group @change="changeMapType" size="small" v-model="nowMapTypeCn">
        <el-radio-button label="实时位置"></el-radio-button>
        <el-radio-button label="格网"></el-radio-button>
        <el-radio-button label="热力"></el-radio-button>
        <el-radio-button label="动态轨迹"></el-radio-button>
      </el-radio-group>
    </p>
    <div class="bustime-line" v-show="showBusTimeline">
      <timeline :timeline="timeline" @l-timelinechanged="timelineChanged"></timeline>
    </div>
  </div>
</template>
<script>
  import Vue from 'vue'
  // import L from 'leaflet'
  import axios from 'axios'
  axios.defaults.withCredentials = true;
  import moment from 'moment'
  import mixin from './../mixins/mixin'
  import MapPopup from '@/components/common/MapPopup'
  import RealtimeMixin from '@/components/extension/mixin/RealtimeMixin.vue'
  import Timeline from  './../echarts/Timeline'
  import { getESAggregations, clearAll } from "@/components/extension/realtime-layer/EsMap.js";
  import { getDatasetById } from "@/components/extension/service/apiService.js";
  import { ServiceConfig } from '@/config/app-config'
  let baseMarkerUrl = "./static/img/marker/",
  normalPoint = L.icon({
    iconUrl: baseMarkerUrl+"realtimeMarker/normal.png",
    iconSize: [30, 30]
  }),
  errorPonit = L.icon({
    iconUrl: baseMarkerUrl+"realtimeMarker/error.png",
    iconSize: [30, 30]
  }),
  busPoint = L.icon({
    iconUrl: baseMarkerUrl + "realtimeMarker/bus.png",
    iconSize: [30, 30]
  });
  import { DFC,  } from '@/config/app-config'
  const props = {
    url: {
      type: String,
    },
    opacity: {
      type: Number,
    },
    zIndex: {
      type: Number,
    },
  }
  export default {
    components: {
      Timeline
    },
    name: 'LRealTimeLayer',
    mixins: [mixin, RealtimeMixin],
    props: {
      ...props,
      url: {
        type: String,
        default: '',
        required: true
      },
    },
    mounted() {
      let self = this
      if (self.$parent._isMounted && self.$parent.$parent._isMounted) {
        self.initRealTimeLayer(self.$parent.leaflet)
        /*self.realTimeClData = setInterval(function() {
          self.initRealTimeLayer(self.$parent.leaflet)
        }, 3000);*/
      }
    },
    watch: {
      url(newVal, oldVal) {
      this.initRealTimeLayer(this.$parent.leaflet, "", "");
      },
      opacity(newVal, oldVal) {
        this.leaflet.setOpacity(newVal);
      },
      zIndex(newVal, oldVal) {
        if(this.leaflet){
          this.leaflet.setZIndex(newVal);
        }
      },
    },
    beforeDestroy() {
      let parent = this.$parent.leaflet;
      //clearInterval(this.realTimeClData);
      if (parent) {
        parent.removeLayer(this.leaflet);
        this.leaflet = null;
        clearAll(this.$parent.leaflet._map);
      }
    },
    data() {
      return {
        deviceId:'',
        dataflowDataid:'',
        tooltipArr:[],
        tooltipFieldList:[],
        fieldList:[],
        tooltipAliasArr:{},
        moniterId: "",
        layerId: "",
        nowMapType: "marker",
        nowMapTypeCn: "实时位置",
        allReadyTime: 0,
        timerT: null,
        timeline: {
          // data:[6, 9 ,12, 15 ,18 ,21],
          // currentIndex:0
        },
        showBusTimeline: false
    };
    },
    methods: {
    async initRealTimeLayer(parent, nowTime, oldTime) {
        if (this.leaflet) {
          parent.removeLayer(this.leaflet);
        }
        const options = this.mixinPropOption(this._props, props);
        const result = await axios({
        type: "get",
        url: ServiceConfig.httpproxy + "?url=" + options.url
        });
        if(result.data.success){
          let datasetId = result.data.data.metaData.dataSetId;
          this.deviceId = result.data.data.metaData.deviceId;
          this.dataflowDataid = result.data.data.metaData.dataflowDataid;
          this.layerId = result.data.data.metaData.layerId
          this.tooltipArr = result.data.data.data ? result.data.data.data : [];
          this.fieldList = result.data.data.fieldList;
          this.tooltipAliasArr = result.data.data.headers;
          let layerType = result.data.data.metaData.layerType;
          let sparkConfig = result.data.data.metaData.sparkConfig;
          if (layerType != 1) {
            const dataResult = await getDatasetById(this.layerId);
            this.leaflet = await this.generateLayers(
              dataResult.data.data.rows,
              null
            );
            this.leaflet.addTo(parent);
          } else {
            var arr = [];
            var datadata = result.data.data.data;
            for (let index = 0; index < datadata.length; index++) {
              const element = datadata[index];
              arr.push({
                id: element.busid,
                x: element.location.lon,
                y: element.location.lat
              });
            }
            this.leaflet = await this.generateBusLayers(arr, sparkConfig);
            try {
              this.leaflet.addTo(parent);
            } catch (error) {}
          }
        }
      },
      generateLayers(markerArr, markerAliasArr) {
        return new Promise(async (resolve, reject) => {
          let self = this
          let layers = []
          let _layerGroup = []
          for(let i=0; i<markerArr.length; i++){
            let find = self.tooltipArr.find(function (tooltip) {
              return markerArr[i][self.deviceId] === tooltip[self.dataflowDataid]
            })
            if(find){
              layers.push({
                marker:markerArr[i],
                tooltip:find
              })
            }else{
              layers.push({
                marker:markerArr[i],
                tooltip:''
              })
            }
          }
          for(let i=0; i<layers.length; i++){
            let _marker = self.transObj(layers[i].marker,markerAliasArr)
            let _tooptipData = layers[i].tooltip
            let _icon;
            let _tooltip = []
            if (_tooptipData.status) {
              if (_tooptipData.status == 3) {
                _icon = errorPonit;
              } else {
                _icon = normalPoint;
              }
            } else {
              _icon = normalPoint;
            }
            if (_tooptipData.createdate) {
              _tooltip.push("<li>" + "监测时间：" + moment(Number(_tooptipData.createdate)).format('YYYY-MM-DD HH:mm:ss') + "</li>");
            }
            for (let index = 0; index < self.fieldList.length; index++) {
              let element = self.fieldList[index];
              if(element!="createdate"){
                if (_tooptipData[element]) {
                  _tooltip.push(
                    "<li style='color:red;'>" +
                    self.tooltipAliasArr[element] +
                    "：" +
                    _tooptipData[element] +
                    "</li>"
                  );
                } else {
                  _tooltip.push(
                    "<li style='color:red;'>" +
                    self.tooltipAliasArr[element] +
                    "：暂无" +
                    "</li>"
                  );
                }
            }
          }
          let tempMarker = L.marker(
            [_marker.SMY || _marker.SmY, _marker.SMX || _marker.SmX],
            {
              icon: _icon
            }
          );
          tempMarker.moniterId = layers[i].marker[self.deviceId] || "";
          _layerGroup.push(
            tempMarker.bindPopup(layer => {
              return new Vue({
                render(h) {
                      return <MapPopup objData={_marker}> </MapPopup>;
                }
              }).$mount().$el;
                },
                {
                  minWidth: "400"
                }
              ).on("click", function(e) {
              if(this.moniterId && self.layerId){
                  self.moniterId = this.moniterId;
                  self.initData(self.layerId, self.moniterId);
              }
              })
              .bindTooltip(_tooltip.join(""), {
                permanent: false,
                offset: [0, 0], // 偏移位置
                direction: "right", // 放置位置
                className: "anim-tooltip" // CSS控制
              }).openTooltip()
          );
          }
          resolve(L.layerGroup(_layerGroup));
        })
      },
      generateBusLayers(datas, sparkConfig, nowTime, oldTime) {
        let self = this;
        let _layerGroup = [];
        let myIcon;
        let marker;
        let parent = this.$parent.leaflet;
        var sparkConfigOld = JSON.parse(sparkConfig);

        document.getElementsByClassName("changeMapTypeBtn")[0].style.display = "block";
        document.getElementsByClassName("changeMapTypeBtn")[0].parentNode.parentNode.style.display = "block";
        try {
          sparkConfig = {
            circle: sparkConfigOld.sparkParameter.interval,
            ip: sparkConfigOld.stream.nodeDic.EsAppendSender.url,
            directoryPath:
              sparkConfigOld.stream.nodeDic.EsAppendSender.directoryPath,
            queueName: sparkConfigOld.stream.nodeDic.EsAppendSender.queueName
          };
        } catch (error) {}
        if (this.nowMapType == "marker") {
          for (var i = 0; i < datas.length; i++) {
            myIcon = busPoint;
            var popUrl = [];
            marker = L.marker([datas[i].y, datas[i].x], {
              icon: myIcon
            });
            _layerGroup.push(marker);
          }
          return L.layerGroup(_layerGroup);
        } else {
          return getESAggregations(
            parent._map.getZoom(),
            parent._map.getBounds(),
            parent._map,
            this.nowMapType,
            sparkConfig,
            nowTime,
            oldTime
          );
        }
      },
      transObj(obj,keysArr){
        keysArr = [{fldname:"STCD",fldalias:"设备编码"},{fldname:"STNM",fldalias:"设备名称"},{fldname:"STLC",fldalias:"地址"}];
        let _keys = [];
        if (keysArr == null) {
          return obj;
        } else {
          for(let i = 0 ; i < keysArr.length;i++){
            _keys[keysArr[i].fldname] = keysArr[i].fldalias;
          }
          let fea = {};
          for(let key in obj){
            if(_keys[key]){
              fea[_keys[key]] = obj[key];
            } else if(key.toUpperCase().indexOf('SM')>-1){
              fea[key] = obj[key];
            }
          }
          return fea;
        }
    },
    changeMapType(type) {
      let parent = this.$parent.leaflet;
      let nowHours = new Date().getHours();
      let currentIndex = 0;
      if (8 <= nowHours && nowHours <= 10) {
        currentIndex = 1;
      }
      if (11 <= nowHours && nowHours <= 13) {
        currentIndex = 2;
      }
      if (14 <= nowHours && nowHours <= 16) {
        currentIndex = 3;
      }
      if (17 <= nowHours && nowHours <= 19) {
        currentIndex = 4;
      }
      if (nowHours >= 20) {
        currentIndex = 5;
      }
      var timeObject = {
        data: [6, 9, 12, 15, 18, 21],
        currentIndex: currentIndex
      };
      if (type == "格网") {
        var currentDate = new Date();
        var currentHours = currentDate.getHours();
        this.timeline = timeObject;
        this.showBusTimeline = true;
        this.nowMapType = "grid";
      } else if (type == "实时位置") {
        this.showBusTimeline = false;
        this.nowMapType = "marker";
        clearAll(parent._map);
      } else if (type == "热力") {
        if (this.timeline == null) {
          this.timeline = timeObject;
        }
        this.showBusTimeline = true;
        this.nowMapType = "heat";
      } else if (type == "动态轨迹") {
        this.showBusTimeline = false;
        this.nowMapType = "trajectory";
      }
      this.initRealTimeLayer(parent, "", "");
    },
    timelineChanged(val) {
      let parent = this.$parent.leaflet;
      let currentPropIndex = this.timeline.data[val.currentIndex];
      var currentTime = new Date().getHours();
      var currentYear = new Date().getFullYear();
      var currentMonth = new Date().getMonth() + 1;
      var currentDate = new Date().getDate();
      var nowTime, oldTime;
      var dataStr = currentYear + "-" + currentMonth + "-" + currentDate + " ";
      if (currentPropIndex > currentTime) {
        currentDate = new Date().getDate() - 1;
      }
      var currentHours = (parseInt(currentPropIndex) + 1).toString();
      nowTime = new Date(dataStr + currentHours + ":59:59").getTime();
      var oldHours = (parseInt(currentPropIndex) - 1).toString();
      oldTime = new Date(dataStr + oldHours + ":00:00").getTime();
      this.initRealTimeLayer(parent, nowTime, oldTime);
    }
  }
};
</script>
<style lang="scss">
  .realtime-container {
    .bustime-line {
      min-width: 400px;
      position: absolute;
      bottom: 30px;
      right: 80px;
      outline: none;
      cursor: pointer;
      z-index: 100000;
      border-radius: 4px;
      >timeline{
        width: 100%;
        min-height: 50px;
        background: white !important;
      }
    }
  }
</style>
