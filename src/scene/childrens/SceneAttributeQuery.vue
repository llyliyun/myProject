<template>
  <div id='attrPopup' v-show='objData'>
    <div class="close" @click='close'><i class="fa fa-times" aria-hidden="true"></i></div>
    <prop-table :objData = 'objData?objData:{}' :filterChinese='true'></prop-table>
  </div>
</template>
<script>
import {
  mapState,
  mapMutations,
  mapActions
} from 'vuex';
import PropTable from '../../common/FunctionalTabel'
import {smFindBySql} from '../../common/supermapService'

export default {
  components:{
    PropTable
  },
  data(){
    return{
       configs:APPCONFIG.cutFloorConfig,
       objData:null,
       lastCutBuild:false  //是否开启过房屋揭盖
    }
  },
  computed:{
    ...mapState({
      currentBaseMap: state => state.map.baseMapLayersGroup[0],
      cShowCutBuild: state => state.scene.cShowCutBuild
    }),
  },
  created(){
    EventBus.$on('ViewerChanged',this.viewerChanged);
    EventBus.$on("layersChanged",this.layersChanged);
  },
  beforeDestroy(){
    EventBus.$off('ViewerChanged',this.viewerChanged);
    EventBus.$off("layersChanged",this.layersChanged)
  },
  methods:{
    close(){
      this.objData = null;
    },
    viewerChanged(){
      this.objData = null;
      if(this.currentBaseMap.queryUrl){
        window.Viewer.pickEvent.addEventListener(this.sceneCick);
        let scene = window.Viewer.scene;
        scene.screenSpaceCameraController.enableIndoorColliDetection = true;
        let infoboxContainer = document.getElementById("attrPopup");
        window.Viewer.customInfobox = infoboxContainer;
      }
    },
    layersChanged(layers){
      if(layers && layers.length && this.currentBaseMap && this.currentBaseMap.queryUrl){
        for(let layer of layers){
          if(layer._name.split("@").length == 2){
            let dataSourceName = layer._name.split("@")[1];
            let dataSetName = layer._name.split("@")[0];
            layer.setQueryParameter({
              url:this.currentBaseMap.queryUrl,
              dataSourceName :  dataSourceName,
              dataSetName: dataSetName
            });
          }
        };
      }
    },
    sceneCick(feature){
      this.startCutBuild(feature);
    },
    startCutBuild(feature){
      let self = this;
      if(this.cShowCutBuild){
        if(feature && feature[self.configs.buildField] && (+feature[self.configs.numFloorField])){
          this.lastCutBuild = true;
          let myfloor = feature[self.configs.numFloorField];
          let filte = self.configs.numFloorField + ">"+myfloor +" and " + self.configs.buildField + "=" + feature[self.configs.buildField];
          let param = {
            url:this.currentBaseMap.queryUrl,
            dataSourceName:this.configs.dataSourceName,
            dataSetName: this.configs.dataSetName,
            sql: filte,
            options:{
              fromIndex:0,
              toIndex:1000
            }
          }
          smFindBySql(param).then((res)=>{
            let uplist = res.features;
            let ids = [];
            if(uplist && uplist.length){
              uplist.forEach((item) =>{
                ids.push(item.fieldValues[0]);
              })
              let layers = Viewer.scene.layers._layerQueue;
              let mylay = layers.find((item)=>{
                return item.name.indexOf(param.dataSetName) > -1
              })
              mylay.setObjsVisible(ids,false)
            }
          })
        }
        this.objData = null;
      } else {
        if(feature){
          this.objData = feature;
        }
        if(this.lastCutBuild){
          this.lastCutBuild = false;
          let layers = Viewer.scene.layers._layerQueue;
          let mylay = layers.find((item)=>{
            return item.name.indexOf(this.configs.dataSetName) > -1
          })
          mylay.setObjsVisible([],false)
        }
      }
    }
  }
}
</script>
<style type="text/css" lang="scss" scoped>
#attrPopup{
  position:absolute;
  .close{
    position: absolute;
    top: 5px;
    right: 10px;
    cursor: pointer;
    z-index: 999;
    font-size: 20px;
    color: white;
  }
}
#attrPopup:after {
    content: "";
    position: absolute;
    bottom: -30px;
    left: 50px;
    border-width: 0 20px 30px 0px;
    border-style: solid;
    border-color: transparent #fff;
    display: block;
    width: 0;
}
</style>


