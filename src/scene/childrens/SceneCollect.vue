<template>
   <el-dialog title="场景收藏" 
    :visible.sync="dialogSceneVisible" 
    append-to-body 
    width="22%"
    class="toolbar-dialog scene-query-statics"
    :close-on-click-modal="false">
    <el-form :model="form" :inline="true" class="statics-query-form" label-width="100px">
      <div class="statics-query-item">
        <el-form-item label="场景名称">
          <el-input v-model="form.name"
            placeholder="请输入场景名称" 
            size="small"></el-input>
        </el-form-item>
      </div>
      <div  class="statics-query-item footeritem">
        <el-form-item style="margin: 0 auto;padding: 18px;width: 100%;">
          <el-button type="primary" @click="saveCollect" size="small" class="btn-view">收 藏</el-button>
          <el-button type="primary" @click="dialogSceneVisible = false" size="small" class="btn-none">取 消</el-button>
        </el-form-item>
      </div>
    </el-form>
  </el-dialog> 
</template>
<script>
import { apiBatchSaveCollect } from '@/apis/scene-api.js'
import {
  mapState,
  mapMutations,
  mapActions
} from 'vuex'
export default {
  data(){
    return {
      dialogSceneVisible:false,
      form:{
        name:""
      },
    }
  },
  computed: {
    ...mapState({
      userInfo: state => state.user.userInfo
    })
  },
  mounted(){
    EventBus.$on('show-scenecollect-panel',this.showCollectScene)
  },
  beforeDestroy(){
    EventBus.$off('show-scenecollect-panel',this.showCollectScene)

  },
  methods:{
    showCollectScene(flag){
      this.dialogSceneVisible = true
    },
    async saveCollect(){
      if(this.form.name == ""){
        this.$message({
          message: "场景名称不能为空",
          type: "warning"
        });
        return
      }
      let addList = []
      let options = {
        position: null,
        direction: null,
        up: null
      };
      options.position = window.Viewer.camera.positionWC.clone();
      options.up = window.Viewer.camera.up.clone();
      options.direction = window.Viewer.camera.direction.clone();
      let destination = window.Viewer.camera.position.clone();
      let params = {
        coords:{
          destination: destination,
          orientation: options
        },
        layerid:"SCENECOLLECTION",
        name:this.form.name,
        userid:this.userInfo.pkid
      }
      addList.push(params);
      let dataParam = {
        addList: JSON.stringify(addList),
      }
      let result = await apiBatchSaveCollect(dataParam);
      if(result.data.success){
        this.$message({
          message: "保存视图信息成功",
          type: "success"
        });
        this.form.name = ""
        this.dialogSceneVisible = false
        EventBus.$emit('update-collect')
      }else{
        this.$message({
          message: "保存视图信息失败",
          type: "warning"
        });
      }
    }
  }
}
</script>

