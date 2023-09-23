<template>
   <el-dialog title="坐标定位"
    :visible.sync="dialogLocalVisible"
    append-to-body
    width="22%"
    class="custom-dialog scene-query-statics"
    :close-on-click-modal="false">
    <el-form :inline="true" class="statics-query-form" label-width="100px">
      <div class="statics-query-item">
        <el-form-item label="经度">
          <el-input v-model="longitude"
            placeholder="请输入经度"
            size="small"></el-input>
        </el-form-item>
        <el-form-item label="纬度">
          <el-input v-model="latitude"
            placeholder="请输入纬度"
            size="small"></el-input>
        </el-form-item>
        <el-form-item label="高度">
          <el-input v-model="viewHeight"
                    placeholder="请输入高度"
                    size="small"></el-input>
        </el-form-item>
      </div>
    </el-form>
     <div style="text-align: center">
       <i class="el-icon-info" aria-hidden="true" style="margin-right: 4px;"/>如有资源叠加，则会进行定位查询
     </div>
     <div  style="text-align: center;padding: 10px 0;">
       <el-button type="primary" @click="coordLocation" size="small" class="btn-view" style="margin-right: 30px;">定 位</el-button>
       <el-button type="default" @click="dialogLocalVisible = false" size="small" class="btn-none">取 消</el-button>
     </div>
  </el-dialog>
</template>
<script>
import {mapState} from 'vuex'
export default {
  data(){
    return {
      dialogLocalVisible:false,
      longitude: "",
      latitude: "",
      viewHeight:"",
    }
  },
  computed: {
    ...mapState({
      cSpecialLayers: state => state.scene.cSpecialLayers
    })
  },
  mounted(){
    EventBus.$on('localtionTip', this.initPosition);
  },
  beforeDestroy(){

  },
  methods:{
    coordLocation(){
      this.dialogLocalVisible = false;
      window.Viewer.camera.flyTo({
        destination : Cesium.Cartesian3.fromDegrees(parseFloat(this.longitude), parseFloat(this.latitude), parseFloat(this.viewHeight))
      });
      let speciallayersgroup = this.cSpecialLayers.filter(item => item.layerType === 'SMRESTMAP')
      if (speciallayersgroup.length) {
        this.sceneSearch()
      }
    },
    sceneSearch(){
      EventBus.$emit("scene-rest-search", [{
        lng: this.longitude,
        lat: this.latitude
      }], 'marker')
    },
    initPosition(lon, lat, viewHeight){
      this.dialogLocalVisible = true;
      this.longitude = lon;
      this.latitude = lat;
      this.viewHeight = viewHeight;
    }
  }
}
</script>

