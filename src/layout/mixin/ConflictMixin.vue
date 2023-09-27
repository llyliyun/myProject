<script>
  import {
    mapState,
    mapMutations,
    mapActions
  } from 'vuex'
  import {serviceMgr} from "@/utils/serviceMetaUtil"
  //import UploadCoords from "@/components/map/mixin/UploadCoords"
  import { measureRingArea} from '@/utils/dfcUtil'
  import {
    smRestAnalyisFindGeometry
  } from '@/utils/supermapService'

  let geometry;
  export default {
    mixins:[],
    data() {
      return {
        bufferDistance:50,
        makeBuffer:false,
        currentGeoType:""
      }
    },
    computed: {
      ...mapState({
        baseMapLayersGroup: state => state.map.baseMapLayersGroup,
      }),
      currentBaseMap() {
        return this.baseMapLayersGroup[0];
      },
    },
    methods:{
      ...mapMutations([
        'addLayer',
        'removeAllSLayer',
        'removeLayer'
      ]),
      checkLayer(layer){
        if(layer.url.indexOf("geoesb/proxy") > -1){
          let arr = layer.url.split("/")
          let serviceId = arr[arr.length - 2]
          let userkey = arr[arr.length - 1]
          if(arr.length && serviceId){
            if(!event || event.target.checked === undefined ||event.target.checked){
              EventBus.$emit('load-layer-service', serviceId, false, userkey);
            } else {
              this.removeLayer(JSON.parse(JSON.stringify(layer)));
            }
          }else{
            this.$message.warning("图层地址不正确")
          }
        }else{
          if(!layer.resID){
            layer.resID = Math.round(Math.random()*1000000)
            layer.key = Math.round(Math.random()*1000000)
            layer.id = Math.round(Math.random()*1000000)
          }
          if(!layer.layerType){
            layer.layerType = "SMRESTMAP"
            layer.legend = []
          }
          if(!layer.visible){
            layer.visible = true
          }
          if(!layer.opacity){
            layer.opacity = 1
          }
          if(!event || event.target.checked === undefined ||event.target.checked){
            this.addLayer(JSON.parse(JSON.stringify(layer)))
          } else {
            this.removeLayer(JSON.parse(JSON.stringify(layer)));
          }
        }
      },

      async analysis(restLayer,geometry){
        if(!restLayer.length){
          this.$message.warning('请选择审查因子')
          return;
        }
        // if(!geometry){
        //   this.$message.warning('请选择分析范围')
        //   return;
        // }
          this._loadingService = this.$loading({
            lock: true,
            text: '正在分析...',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          }); 
        let recode = [];
        for (var i = 0; i < restLayer.length; i++) {
          let d,options
          options = {
              operation:restLayer[i].overlayertype || restLayer[i].overLay || "CLIP",
              operateRegions:geometry._layers ? geometry.getLayers() :[geometry],
              sourceDatasetFilter:new SuperMap.FilterParameter(restLayer[i].filterParam ? restLayer[i].filterParam : {}),
          }
          if(restLayer[i].sourceDataset){
            options.sourceDataset = restLayer[i].sourceDataset
            let datasetOverlayAnalystParameters = new SuperMap.DatasetOverlayAnalystParameters(options);
            d = await smRestAnalyisFindGeometry({
              url: restLayer[i].analysisRestUrl || APPCONFIG.AnalysisRestUrl,
              params: datasetOverlayAnalystParameters
            })
          }else{
            d = await serviceMgr.getAnalysisRestResult(restLayer[i],options)
          }
          if(d && d.recordsets){
              d.recordsets.forEach((item) => {
                if(restLayer[i].name || restLayer[i].sourceDataset){
                  item.captionName = restLayer[i].name || restLayer[i].sourceDataset
                }else{
                  item.captionName = item.datasetName
                }
                item.eraseLayer = restLayer[i].eraseLayer
              })
              recode = recode.concat(d.recordsets);
          } else {
              recode.push({
                captionName: restLayer[i].name,
                datasetName: "",
                features: [],
                eraseLayer: restLayer[i].eraseLayer
              })
          }
        }
          this._loadingService && this._loadingService.close();
          EventBus.$emit("query-finish-geo", recode)
      },
      
      getGeometry() {
        return geometry;
      },

      /**控制线检查，针对分析控规图层的处理 */
      async geometryAnalysisThreeLine(analysisList,operateRegions){
        let recode = analysisList;
        let cityRegion = recode.find((re) => {
          return re.eraseLayer;
        })
        let conflictGeo = null;
        if(cityRegion){
          recode.splice(recode.indexOf(cityRegion),1);
          if(cityRegion && cityRegion.features && cityRegion.features.features && cityRegion.features.features.length){
            let coords = [];
            cityRegion.features.features.forEach((item) => {
              coords = coords.concat(item.geometry.coordinates)
            })
            let fea = cityRegion.features.features[0];
            fea.geometry.coordinates = coords;
            let feature =  {
              type:"FeatureCollection",
              features:[fea]
            }
            let targetRegion = L.geoJSON(feature);
            let param = new SuperMap.GeometryOverlayAnalystParameters({
              sourceGeometry:operateRegions,
              operateGeometry: targetRegion,
              operation:"ERASE"
            })
            let res = await smRestAnalyisFindGeometry({
              url: APPCONFIG.AnalysisRestUrl,
              params: param
            }).catch(() => {
              this.$message.warning('请求失败');
            });
            if(res && res.resultGeometry){
              if(res.resultGeometry.geometry){
                let ls = L.geoJSON(res.resultGeometry).getLayers()[0].getLatLngs();
                conflictGeo = this.buildGeojson(ls,res.resultGeometry,"")
              } else {
                conflictGeo = {
                  features:{
                    type:"FeatureCollection",
                    features:[]
                  }
                }
              }
            }else{
              conflictGeo = {
                features:{
                  type:"FeatureCollection",
                  features:[fea]
                }
              }
              EventBus.$emit("query-geo", [conflictGeo])
            }
          }else{
            conflictGeo = this.buildGeojson([operateRegions.getLatLngs()],operateRegions.toGeoJSON(),"")
          }
          conflictGeo.captionName = cityRegion.captionName
          conflictGeo.status = 'success';
          conflictGeo.parentPkid = cityRegion.parentPkid;
          conflictGeo.eraseLayer = true;
          if(conflictGeo){
            recode.push(conflictGeo)
          }
        }
        return recode;
      },
      buildGeojson(ls,geojson,epsg){
      	let area = 0;
      	ls.forEach((latlng) => {
      		area += measureRingArea(latlng[0],epsg.split(":")[1])
      	})
      	geojson.properties = {"超出面积":area.toFixed(4)}
      	let conflictGeo = {
      		features:{
      			type:"FeatureCollection",
      			features:[geojson]
      		}
      	}
      	return conflictGeo
      },
    }
  }
</script>
