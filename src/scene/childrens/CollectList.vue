<template>
  <div class="scene-collect">
    <div class="list-pane" v-if="showSceneList">
      <div class="list-header">场景收藏列表<i class="fa fa-minus font-icon" @click="changeSceneList(false)"></i></div>
      <ul class="view-list">
        <li v-for="(item,index) in viewOption" :key ="index" @click="showView(item)">
          <i class="scene-collect-uniE900"></i>
          <span>{{ item.name }}</span>
          <i class="el-icon-delete" style="float:right;margin-top: 15px;" @click="deleteScene(item.pkid)"></i>
        </li>
      </ul>
    </div>
    <div class="show-collect-list" v-if="!showSceneList" @click="changeSceneList(true)">
      <i class="fa fa-star"></i>
      <span>收藏</span>
    </div>
  </div>
</template>
<script>
import { apisearchSceneCollect, apiDeleteMarker } from '@/apis/scene-api.js'
import {
  mapState,
  mapMutations,
  mapActions
} from 'vuex'
export default {
  data(){
    return {
      viewOption:[],
      showSceneList:false,
      currentId:""
    }
  },
  watch:{
    userInfo:{
       handler(val){
        this.getSceneCollectList()
      },
      deep:true
    }
  },
  computed: {
    ...mapState({
      userInfo: state => state.user.userInfo
    })
  },
  mounted(){
    // EventBus.$on('show-view-option',(option) => {
    //   this.viewOption = option
    // })
    this.getSceneCollectList()
    EventBus.$on('update-collect',this.getSceneCollectList)
  },
  destroyed() {
    // EventBus.$off('show-view-option',(option) => {
    //   this.viewOption = option
    // })
    EventBus.$off('update-collect',this.getSceneCollectList)
  },
  methods:{
    async getSceneCollectList(){
      if(this.userInfo){
        let params = {
          userid:this.userInfo.pkid,
          layerid:"SCENECOLLECTION"
        }
        let collectList = await apisearchSceneCollect(params)
        if(collectList.data.resultInfo.success){
          this.viewOption = collectList.data.resultInfo.data.markerList
          this.viewOption.forEach((item) => {
            item.coords = JSON.parse(item.coords)
          })
        }
      }
    },
    deleteScene(id){
      let self = this;
      event.stopPropagation()
      this.$confirm('此操作将永久删除该场景, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        await apiDeleteMarker(id).then((res) => {
          if(res.data.resultInfo.success){
            self.$message.success('删除成功')
            self.getSceneCollectList()
          }else{
            self.$message.warning('删除失败')
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    showView(data){
      window.Viewer.camera.flyTo(data.coords);
    },
    changeSceneList(flag){
      this.showSceneList = flag
    },
  }
}
</script>

<style lang="scss">
  $bgColor-none: rgba(255, 255, 255, 0);

  $border-color: #0BABD1;
  $color-gray: rgba(199, 204, 206, 0.4);

  $border: 2px solid  $border-color;
  $border-gray: 1px solid $color-gray;

  $font-size: 14px;
  $font-color: #ffffff;
  $font-blue: #0DCCF1;

  $box-shadow: 0px 0px 8px $border-color;

  $background-blue: rgba(1, 25, 50, 0.6);
  $background-color: rgba(0, 0, 0, 0.7);
  .scene-collect{
    position: absolute;
    left: 0px;
    bottom: 0px;
    font-size: 12px;
    .list-pane{
      width: 180px;
      //margin-left:10px;
      width: 180px;
      background: rgba(1, 25, 50, 0.6) !important;
      color: $font-color;
      .list-header{
        line-height: 34px;
        border-radius: 4px 4px 0 0;
        padding: 0 10px;
        font-size: $font-size;
        background-color: rgba(255,255,255,0.1);
        .font-icon{
          float: right;
          cursor: pointer;
          margin-top: 10px;
        }
      }
      .view-list{
        width: 100%;
        max-height: 204px;
        overflow-y: auto;
        line-height: 40px;
        padding: 0 10px;
        li{
          border-bottom: 1px solid rgba(199, 204, 206, 0.2);
          cursor: pointer;
          .el-icon-delete{
            visibility: hidden;
          }
          &:hover .el-icon-delete{
            visibility: visible;
          }
          &:last-child{
            border-bottom: 0;
          }
        }
      }
    }
    .show-collect-list{
      color: $font-color;
      line-height: 30px;
      padding: 0 10px;
      font-size: $font-size;
      cursor: pointer;
      background-image: linear-gradient(rgba(11, 171, 209,0.3) 0%, rgba(1, 25, 50, 0.6) 20%);
    }
  }
  
</style>

