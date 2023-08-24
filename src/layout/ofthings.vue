<template>
  <div class="Ofthings">
    <div v-if="type == 'video'">
      <h2>现场视频 <i class="el-icon-circle-close" @click="clearly"></i></h2>
      <div class="Ofthings_title">
        <video
          type="video/mp4"
          controls="controls"
          autoplay="autoplay"
          width="100%"
          height="200px"
        >
          <source :src="video" />
        </video>
      </div>
    </div>
    <div v-else>
      <h2>空气质量 <i class="el-icon-circle-close" @click="clearly"></i></h2>
      <div class="Ofthings_title">
        <el-descriptions :column="2" class="pro-descriptions">
          <el-descriptions-item label="温度(℃)"> 33.5 </el-descriptions-item>
          <el-descriptions-item label="PM2.5"> 43 </el-descriptions-item>
          <el-descriptions-item label="PM10"> 139 </el-descriptions-item>
          <el-descriptions-item label="O3"> 0.5 </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
  </div>
</template>

<script>
import video from "../img/video/videone.mp4";
export default {
  data() {
    return {
      type: "",
      video: video,
    };
  },
  mounted() {},
  methods: {
    async createOfthings(type) {
      this.type = type;
    },
    clearly() {
      this.$emit("clearly");
    },
  },
};
</script>

<style lang="scss" scoped>
.Ofthings {
  width: 22vw;
  position: fixed;
  right: 20px;
  border: 1px solid #00c6ff;
  bottom: 16vh;
  background: rgba(1, 61, 77, 0.5);
  .Ofthings_title {
    padding: 16px;
  }
  h2 {
    width: 100%;
    line-height: 36px;
    font-size: 16px;
    font-weight: normal;
    background: #155968;
    text-indent: 1em;
    i {
      float: right;
      font-size: 30px;
      margin: 4px;
      cursor: pointer;
    }
  }
}
</style>
<style>
.pro-descriptions .el-descriptions__body {
  background: rgba(1, 61, 77, 0);
  color: #fff;
}
</style>