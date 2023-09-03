<script>
  import {
    mapState,
    mapMutations,
    mapActions
  } from 'vuex'
  import {serviceMgr} from "@/utils/serviceMetaUtil"
  import UploadCoords from "@/components/map/mixin/UploadCoords"
  import { measureRingArea,transAreaUnitToMu,convertStrToLayer, convertLayerToBufferParams} from '@/utils/dfcUtil'
  import {uploadSurveyCoordinates,complianceAnalysis} from '@/apis/special-api.js'
  import {
    smRestAnalyisFindGeometry,smRestMapFindByGeometry, smRestMapFindByBounds
  } from '@/utils/supermapService'
  import {apiTranSpitalFileToGeoJson, apiGetDFCUploadResult} from '@/apis/geoesb-api.js'

  let geometry;
  export default {
    mixins:[UploadCoords],
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
      drawLayer(type){
        let self = this;
        EventBus.$emit("toolbar-clearAll");
        EventBus.$emit("draw-Layer",type,(layer)=>{
          let tempLayer = convertLayerToBufferParams(layer);
          geometry = convertStrToLayer(tempLayer)
          this.rendBuffer(geometry)
        })
      },

      async analysisByGeoesbmengine(restLayer,thematicBool){
        if(!restLayer.length){
          this.$message.warning('请选择审查因子')
          return;
        }
        if(!geometry){
          this.$message.warning('请选择选址分析范围')
          return;
        }
        let self=this
        //定义空间分析参数模版
        let queryParam={
          queryDataList:[],
          sumArea:true
        }
        //组织空间分析模版具体参数
        queryParam.queryDataList=restLayer.map(item=>({
          queryMode:item.overlayertype,//图层对应分析方法
          datasetname:item.dataSet,//图层对应数据集
        }))
        //geometry对象转geojson
        let polygon = L.polygon(geometry._latlngs).toGeoJSON();
        let geojsonData = {
          type:"FeatureCollection",
          features:[polygon]
        }
        if(this.makeBuffer){
          queryParam.buffer={
            distance:this.bufferDistance,
            semicircleLineSegment: 10
          }
        }
        queryParam.inputdata=JSON.stringify(geojsonData)
        EventBus.$emit("send-geometry-data",geometry)
        if(!thematicBool){//说明走的是单选分析，不是多项专题分析
          this._loadingService = this.$loading({
            lock: true,
            text: '正在分析...',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          }); 
        }
        
        //因为在分析配置下所有应用的分析服务地址一样，所以直接去第0项
        let result=await complianceAnalysis(restLayer[0].analysisService,queryParam).catch(() => {
          self.$message.warning('分析失败！')
          self._loadingService && this._loadingService.close();
        });
        let recode=[]
        if(result.data && result.data.success){
          let analysisData=result.data.data
          //序列化分析数据
          recode = this.transToGeoJson(analysisData)
          if(!thematicBool){
            this._loadingService && this._loadingService.close();
            EventBus.$emit("query-finish-geo", recode, geometry, this.currentBaseMap.projection)
          } else {
            recode.map((item,index)=>{
              item.status = 'success';
              item.parentPkid = restLayer[index].parentPkid;
              item.captionName = restLayer[index].name;
            })
            EventBus.$emit("query-finish-geo-thematicAnalysis", recode, geometry, this.currentBaseMap.projection);
          }
        } else {
          if(!thematicBool){
            this._loadingService && this._loadingService.close();
            EventBus.$emit("query-finish-geo", recode, geometry, this.currentBaseMap.projection)
          } else {
            restLayer.map((item,index)=>{
              recode.push({
                features:[],
                status:'error',
                parentPkid:item.parentPkid,
                captionName: item.name,
              })
            })
            EventBus.$emit("query-finish-geo-thematicAnalysis", recode, geometry, this.currentBaseMap.projection);
          }
        }
      },
      async analysis(restLayer,thematicBool){
        if(!restLayer.length){
          this.$message.warning('请选择审查因子')
          return;
        }
        if(!geometry){
          this.$message.warning('请选择分析范围')
          return;
        }
        EventBus.$emit("send-geometry-data",geometry)
        if(!thematicBool){
          this._loadingService = this.$loading({
            lock: true,
            text: '正在分析...',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          }); 
        }
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
              url: restLayer[i].analysisRestUrl || APPCONFIG.SpecialToolConfig.AnalysisRestUrl,
              params: datasetOverlayAnalystParameters
            })
          }else{
            d = await serviceMgr.getAnalysisRestResult(restLayer[i],options)
          }
          if(d && d.recordsets){
            if(thematicBool){
              const recodeLayer = {
                features:d.recordsets[0].features,
                status:'success',
                parentPkid:restLayer[i].parentPkid,
                captionName: restLayer[i].name,
                eraseLayer: restLayer[i].eraseLayer
              };
              EventBus.$emit("query-finish-geo-thematicAnalysis", recodeLayer, geometry, this.currentBaseMap.projection);    
            } else {
              d.recordsets.forEach((item) => {
                if(restLayer[i].name || restLayer[i].sourceDataset){
                  item.captionName = restLayer[i].name || restLayer[i].sourceDataset
                }else{
                  item.captionName = item.datasetName
                }
                item.eraseLayer = restLayer[i].eraseLayer
              })
              recode = recode.concat(d.recordsets);
            }
          } else {
            if(thematicBool){
              const recodeLayer = {
                features:[],
                status:d&&d.error &&d.error.code == 400 ?'success':'error',
                parentPkid:restLayer[i].parentPkid,
                captionName: restLayer[i].name,
                eraseLayer: restLayer[i].eraseLayer
              };
              EventBus.$emit("query-finish-geo-thematicAnalysis", recodeLayer, geometry, this.currentBaseMap.projection);
            } else {
              recode.push({
                captionName: restLayer[i].name,
                datasetName: "",
                features: [],
                eraseLayer: restLayer[i].eraseLayer
              })
            }
          }
        }
        if(!thematicBool){
          this._loadingService && this._loadingService.close();
          EventBus.$emit("query-finish-geo", recode, geometry, this.currentBaseMap.projection)
        }
      },
      transToGeoJson(resultData){
        let recode=[]
        resultData.forEach(item=>{
          if(item.features){
            let recodeItem={
              captionName:item.datasetName,
              datasetName:item.datasetName,
              datasetType:"REGION",
              sumArea:item.sumArea,
              overlapsumArea:item.overlapsumArea,
              features:{
                type:"FeatureCollection",
                features:[]
              }
            }
            item.features.forEach(fea=>{
              let feaObj={}
              feaObj.type="Feature"
              feaObj.geometry=JSON.parse(fea.overlapgeometry)
              feaObj.properties=JSON.parse(fea.properties)
              // feaObj.geometry.coordinates=[feaObj.geometry.coordinates]
              // feaObj.geometry.type="MultiPolygon"
              recodeItem.features.features.push(feaObj)
            })
            recode.push(recodeItem)
          }
        })
        // recode=resultData.map(item=>({
        //   captionName:item.datasetName,
        //   datasetName:item.datasetName,
        //   datasetType:"REGION",
        //   features:{
        //     type:"FeatureCollection",
        //     features:item.features
        //   }
        // }))
        return recode
      },
      
      getGeometry() {
        return geometry;
      },

      /**控制线检查，针对分析控规图层的处理 */
      async geometryAnalysisThreeLine(analysisList){
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
              sourceGeometry:geometry,
              operateGeometry: targetRegion,
              operation:"ERASE"
            })
            let res = await smRestAnalyisFindGeometry({
              url: APPCONFIG.SpecialToolConfig.AnalysisRestUrl,
              params: param
            }).catch(() => {
              this.$message.warning('请求失败');
            });
            if(res && res.resultGeometry){
              if(res.resultGeometry.geometry){
                let ls = L.geoJSON(res.resultGeometry).getLayers()[0].getLatLngs();
                conflictGeo = this.buildGeojson(ls,res.resultGeometry,this.currentBaseMap.projection)
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
            conflictGeo = this.buildGeojson([geometry.getLatLngs()],geometry.toGeoJSON(),this.currentBaseMap.projection)
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
