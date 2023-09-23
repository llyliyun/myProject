<template>
  <div class="scene-layer-list">
    <div style="padding-bottom:10px;">
      <span>三维场景图层</span>
      <span style="display:inline-block;float:right;cursor:pointer" @click="$emit('hide-layer')"><i class="el-icon-close"></i></span>
    </div>
    <el-collapse v-model="activeColl">
      <el-collapse-item v-for="item,key in layerList" :key="key" :name="item.name">
        <template slot="title">
          <el-checkbox  @change="toggleScene(item)" v-model="item.checked">{{item.name}}</el-checkbox>
        </template>
        <el-checkbox @change="toggleLayer(item,layer)" v-model="layer.checked" v-for="layer,lkey in item.layers" :key="lkey" style="display:block">{{layer.name}}</el-checkbox>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
import {apiGetByUrl} from "@/apis/api.js"
  export default{
    props:['scene'],
    data(){
      return{
        layerList:[],
        activeColl:"",
      }
    },
    mounted(){
      this.getSceneLayers();
    },
    watch:{
      "scene.url": {
        handler(val){
          if(val){
            this.getSceneLayers();
          }
        },deep:true
      }
    },
    methods:{
      async getSceneLayers(){
        if(this.scene.url){
          let url = this.scene.url;
          let alreadScene = this.layerList.find(item => item.url == url);
          if(alreadScene){
            this.layerList.splice(this.layerList.indexOf(alreadScene), 1)
            if(this.layerList.length == 0){
              this.$emit('hide-layer')
            }
          } else {
            let meta = await apiGetByUrl(url+"/scenes");
            let sceneurl = meta.data && meta.data[0] ? meta.data[0].path:"";
            let layersMeta = await apiGetByUrl(sceneurl);
            let layers = layersMeta.data && layersMeta.data.layers ? layersMeta.data.layers:[];
            let layerVO = layers.map(item => {
              return {
                name: item.name,
                checked: true
              }
            })
            this.layerList.push({
              name: meta.data[0].name == '未命名场景'?this.scene.name:meta.data[0].name,
              url: url,
              checked: true,
              layers: layerVO
            })
            this.activeColl = this.scene.name
          }
        }
      },
      toggleLayer(item, layer){
        if(!layer.checked){
          Viewer.scene.layers.remove(layer.name)
        } else {
          Viewer.scene.addS3MTilesLayerByScp(`${item.url}/datas/${layer.name}/config`,{name:layer.name})
        }
      },
      toggleScene(item){
        if(!item.checked){
          item.layers.forEach(layer => {
            layer.checked = false;
            Viewer.scene.layers.remove(layer.name)
          })
        } else {
          Viewer.scene.open(item.url)
          item.layers.forEach(layer => {
            layer.checked = true;
          })
        }
      }
    }
  };
</script>
<style lang="scss">
  .scene-layer-list{
    background: #fff;
    padding: 10px;
    min-width: 350px;
    position: absolute;
    top: 66px;
    left: 50px;
    border-radius: 2px;
    .el-collapse-item__content{
      padding-left: 5px;
    }
  }
</style>