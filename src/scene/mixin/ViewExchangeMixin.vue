<template> </template>
<script>
let sightline,
  sgPointHandler,
  viewPointFlag = false; //是否已经添加了
import { mapState, mapMutations } from "vuex";
export default {
  data() {
    return {
      viewOption: [],
      viewIndex: 0
    };
  },
  methods: {
    saveView() {
      let options = {
        position: null,
        direction: null,
        up: null
      };
      options.position = window.Viewer.camera.positionWC.clone();
      options.up = window.Viewer.camera.up.clone();
      options.direction = window.Viewer.camera.direction.clone();
      let destination = window.Viewer.camera.position.clone();
      this.$message({
        message: "保存视图信息成功,点击返回视图可返回到当前视图!",
        type: "success"
      });
      this.viewOption.push({
        destination: destination,
        orientation: options
      });
      this.viewIndex = this.viewOption.length - 1;
    },
    preView() {
      if (this.viewOption.length == 0) {
        this.$message.warning("还未保存前视图,保存视图后可返回!!");
      } else {
        if (this.viewIndex == 0) {
          this.$message.warning("已经是第一个视图了,无法返回!");
          return;
        }
        window.Viewer.camera.flyTo(this.viewOption[this.viewIndex - 1]);
        this.viewIndex--;
      }
    },
    nextView() {
      if (this.viewOption.length == 0) {
        this.$message.warning("还未保存后视图!");
      } else {
        if (this.viewOption.length == this.viewIndex + 1) {
          this.$message.warning("已经是最后一个视图了,无法返回!");
          return;
        }
        window.Viewer.camera.flyTo(this.viewOption[this.viewIndex + 1]);
        this.viewIndex++;
      }
    }
  }
};
</script>
<style type="text/css"></style>
