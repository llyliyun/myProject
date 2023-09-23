// import L from 'leaflet';
import Vue from 'vue';
// import { apiPrjCoordSysList } from "@/apis/api";
const state = {
  currentBaseMapIndex: 0, //当前激活地图集合图层索引
  baseMapLayersGroup: [], //底图图层集合数据
  specialLayers: [], //专题图层数据
  mapMode: '2d', //地图模式 2d/3d/23d三种模式,
  isShowAllScreen: false, //是否全屏
  isShowLegend: false, //是否显示图例
  isShowMenu: true, //是否显示左侧菜单
  geojsonDataFlag: true, //底部查询详情列表是否显示
  isShowUploadBtn: false,
  currentActiveLayerIndex: null, //当前默认激活layerId vuex不适合存放复杂对象
  showBufferFlag: false,  //是否显示缓冲区分析
  showListPop:false,
  acitveDis:APPCONFIG.InitDis, //初始化时的行政区划
  districtLayer:null, //行政区划图层
  currentMapState: null, //当前地图CRS,
  curMap:null, //编辑地图时激活的地图,
  isShowMapEditPanel: false ,//是否显示在线制图面板,
  //坐标系信息
  prjCoordSysList: [],
  selectLayer:{
    layerType:null,
    id:null,
    dataSetType:null
  },//地图编辑选中图层的id和themesetting的layerType
  isShowSpaceTime: false,
  showRightButtonControl: true,
  lastMapPosition: {
    mapMode: '2d',
    center: null,
    zoom: 0
  }, //用以保存在地图切换时地图的上一个最终位置
  mapView:{
    centerX: 0,
    centerY: 0,
    zoom: 1
  },//记录地图的中心点和缩放级别
  mapTags:[],//在线制图地图标签
  mapName:"无标题",//在线制图地图的名字
  serverList:[],//属性与文档服务数据
  mapIndex:0,  //底图列表将要切换到的索引
  historyIndex:0,  //历史影像索引
  isFirst:true, //
}
const actions = {
  // getPrjCoordSys({ commit }) {
  //     return new Promise(async(resolve, reject) => {
  //         const { data } = await apiPrjCoordSysList();
  //         if (data.resultInfo.success) {
  //             commit("addPrjCoordSys", data.resultInfo.data);
  //             resolve(data.resultInfo.data);
  //         } else {
  //             reject();
  //         }
  //     });
  // }
};
const getters = {

}

const mutations = {
  changeManageMap(state,layer){
    state.curMap = layer;
  },
  addDistrictLayer(state,layer){
    state.districtLayer = layer;
  },
  addPrjCoordSys(state, list) {
    state.prjCoordSysList = list;
  },
  removeDistrictLayer(state){
    state.districtLayer = null;
  },
  changeDistrict(state,district){
    state.acitveDis = district
  },
  changListShow(state,flag){
    state.showListPop = flag;
  },
  changeCurrentActiveLayer(state, index) {
    state.currentActiveLayerIndex = index;
  },
  changeUploadBtn(state, flag) {
    if (flag && state.showBufferFlag) {
      state.showBufferFlag = false;
    }
    state.isShowUploadBtn = flag;
  },
  changeGeoJsonDataFlag(state, flag) {
    state.geojsonDataFlag = flag;
  },
  changeShowMenu(state, isShowMenu) {
    state.isShowMenu = isShowMenu
  },
  showHideLegend(state, isShowLegend) {
    state.isShowLegend = isShowLegend;
  },
  changeMapMode(state, mapMode) {
    state.mapMode = mapMode;
  },
  changeShowAllScreen(state, isShowAllScreen) {
    state.isShowAllScreen = isShowAllScreen;
  },
  addBaseMapLayersGroup(state, baseMapLayersGroup) {
    state.baseMapLayersGroup = baseMapLayersGroup;
  },
  addLegend(state, {
    layer,
    legend
  }) {
    for (let i = 0; i < state.specialLayers.length; i++) {
      if (state.specialLayers[i].id == layer.id) {
        state.specialLayers[i].legend = legend;
        break;
      }
    }
  },
  removeLegend(state,id){
    let layer = state.specialLayers.find((item)=>item.id==id);
    if(layer){
      layer.legend = [];
    }
    
  },
  addLayer(state, layer) {
    let flag = state.specialLayers.filter((item)=>{
      //原始唯一标识应使用key，为向下兼容保留resID
      return item.resID == layer.resID && item.key == layer.key;
    })
    if(flag.length == 0){
      layer.zIndex = state.specialLayers.length == 0 ? 10 : (state.specialLayers.length+1) * 10; //默认设置zIndex 方便后续调整图层顺序
      state.specialLayers.push(layer);
    }else{
      flag[0].url = layer.url
      flag[0].layerName = layer.layerName
    }
  },
  removeAllSLayer(state) {
    state.specialLayers = []
  },
  removeLayer(state, layer) {
    for (let i = 0; i < state.specialLayers.length; i++) {
      if (state.specialLayers[i].url == layer.url) {
        state.specialLayers.splice(i, 1);
        break;
      }
    }
  },
  removeLayerByUrl(state, url) {
    for (let i = 0; i < state.specialLayers.length; i++) {
      if (state.specialLayers[i].url == url) {
        state.specialLayers.splice(i, 1);
        break;
      }
    }
  },
  removeLayerByKey(state, key) {
    for (let i = 0; i < state.specialLayers.length; i++) {
      if (state.specialLayers[i].key == key) {
        state.specialLayers.splice(i, 1);
        break;
      }
    }
  },
  showHideLayer(state, {
    layer,
    flag
  }) {
    for (let i = 0; i < state.specialLayers.length; i++) {
      if (state.specialLayers[i].url == layer.url) {
        state.specialLayers[i].visible = flag;
        break;
      }
    }

  },
  changeSpecialLayer_(state, specialLayer) {
    let hasCurLayer = false;
    for(var i=0;i<state.specialLayers.length;i++){
      if(state.specialLayers[i].id == specialLayer.id){
        state.specialLayers.splice(i, 1,specialLayer);
        hasCurLayer = true;
        break;
      }
    };
    if(!hasCurLayer){
      state.specialLayers.push(specialLayer);
    }
  },
  changeLayerOpacity(state, {
    layer,
    opacity
  }) {
    for (var i = 0; i < state.specialLayers.length; i++) {
      if (state.specialLayers[i].url == layer.url) {
        state.specialLayers[i].opacity = opacity
      }
    }
  },
  changeCurrentBaseMapIndex(state, index) {
    state.currentBaseMapIndex = index;
    let lastIndex = state.baseMapLayersGroup.length - 1;
    var templayer = state.baseMapLayersGroup[lastIndex];
    Vue.set(state.baseMapLayersGroup, lastIndex, state.baseMapLayersGroup[index]);
    Vue.set(state.baseMapLayersGroup, index, templayer);
  },
  changeLayerZIndex(state, {
    downLayer,
    upLayer
  }) {
    for (let i = 0; i < state.specialLayers.length; i++) {
      if (state.specialLayers[i].resID == downLayer.resID) {
        var templayer = state.specialLayers[i];
        for (let j = 0; j < state.specialLayers.length; j++) {
          if (state.specialLayers[j].resID == upLayer.resID) {
            Vue.set(state.specialLayers, i, state.specialLayers[j]);
            Vue.set(state.specialLayers, j, templayer);
            break;
          }
        }
      }
    }
  },
  changeBufferState(state, bufferState) {
    if (bufferState && state.isShowUploadBtn) {
      state.isShowUploadBtn = false;
    }
    state.showBufferFlag = bufferState;
  },
  storeCurrentMapState(state, crs) {
    state.currentMapState = crs;
  },
  changeShowMapEditPanel(state, isShowMapEditPanel) {
    state.isShowMapEditPanel = isShowMapEditPanel
  },
  removeThemeItem(state,id){
    for(var i=0;i<state.specialLayers.length;i++){
      if(state.specialLayers[i].id == id){
        state.specialLayers.splice(i, 1);
        break;
      }
    };
    // for(var i=0;i<state.themeLayers.length;i++){
    //   if(state.themeLayers[i].id == id){
    //     state.themeLayers.splice(i, 1);
    //     break;
    //   }
    // };
  },
  addToThemeLayer(state,item){
    state.themeLayers.push(item);
  },
  removeThemeLayerByResID(state,resID){
    for(var i=0;i<state.specialLayers.length;i++){
      if(state.specialLayers[i].resID == resID){
        state.specialLayers.splice(i, 1);
        break;
      }
    }
  },
  /**
  * 添加不在底图数组里面的底图，且不影响已有的底图切换
  */
  changeOtherBaseMap(state, item) {
    EventBus.$emit('beforeBaseMapChange');
    let _item = JSON.parse(JSON.stringify(item));
    _item.isOtherMap = true;
    for (let i = 0; i < state.baseMapLayersGroup.length; i++) {
      if (state.baseMapLayersGroup[i].isOtherMap) {
        state.baseMapLayersGroup.splice(i, 1);
      }
    }
    if (_item.type == 'scene') {
      state.mapMode = '3d';
    } else {
      state.mapMode = '2d';
    }
    state.baseMapLayersGroup.unshift(_item);
  },
  changeSpaceTimeVisible(state, flag) {
    state.isShowSpaceTime = flag;
  },
  toggleRightButtonControlVisible(state, flag) {
    state.showRightButtonControl = flag;
  },
  storeLastMapPosition(state, position) {
    state.lastMapPosition = position;
  },
  changeMapView(state,mapView){
    state.mapView = mapView;
  },
  changeMapTags(state,tags){
    state.mapTags = tags;
  },
  addMapTags(state,tag){
    state.mapTags.push(tag);
  },
  deleteMapTags(state,index){
    state.mapTags.splice(index,1);
  },
  changeMapName(state,name){
    state.mapName = name;
  },
  //地图定制专用
  changeSelectLayer(state,obj){
    state.selectLayer = obj;
  },
  clearSelectLayer(state){
    state.selectLayer.layerType = null;
    state.selectLayer.id = null;
    state.selectLayer.dataSetType = null
  },
  changeSpecilayerAttr(state,obj){
    let newlayer = state.specialLayers.find((layer) => layer.id == obj.id);
    for(let key in obj){
      if(key!='id'){
        Vue.set(newlayer,key,obj[key]);
      }
    };
  },
  changeSpecialLayer(state, specialLayer) {
    let hasCurLayer = false;
    for(var i=0;i<state.specialLayers.length;i++){
      if(state.specialLayers[i].id == specialLayer.id){
        state.specialLayers.splice(i, 1,specialLayer);
        hasCurLayer = true;
        break;
      }
    };
    if(!hasCurLayer){
      state.specialLayers.push(specialLayer);
    }
  },
  changeServerList(state, serverList){
    Vue.set(state,'serverList',serverList);
  },
  changeMapIndexAndHistoryIndex(state,arr){
    state.mapIndex = arr[0];
    state.historyIndex = arr[1];
  },
  changeFirst(){
    state.isFirst = false;
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
