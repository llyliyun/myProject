<template>
  <el-dialog
    :title="title"
    :visible.sync="showSplitPanel"
    width="700px"
    class="toolbar-dialog scene-query-statics"
    append-to-body
  >
    <el-form class="statics-split-form" label-width="172px">
      <div class="statics-split-item">
        <div
          @click="changeBorderColor('left')"
          class="checkPanel"
          id="leftPanel"
          :style="{ border: leftBorderColor }"
        >
          1
        </div>
        <div
          @click="changeBorderColor('right')"
          class="checkPanel"
          id="rightPanel"
          :style="{ border: rightBorderColor }"
        >
          2
        </div>
      </div>
      <div class="statics-query-item footeritem">
        <el-form-item
          style="margin: 0 auto;padding: 48px 64px 0 64px;width: 100%;"
        >
          <el-button
            type="primary"
            size="small"
            class="btn-view"
            @click="submit()"
            >确定</el-button
          >
          <el-button @click="cancel" size="small" class="btn-none"
            >取消</el-button
          >
        </el-form-item>
      </div>
    </el-form>
  </el-dialog>
</template>
<script type="text/javascript">
import $ from "jquery";
import { mapState, mapMutations } from "vuex";
// import RollMixin from "../mixin/RollMixin"
let dragStartX = 0;
export default {
  // mixins:[RollMixin],
  data() {
    return {
      showSplitPanel: false,
      title: "请选择要叠加的序号~",
      leftBorderColor: "3px solid #409EFF",
      rightBorderColor: "",
      layerType: "",
      hasLayer: false,
      url: ""
    };
  },
  mounted() {
    EventBus.$on("rollPanel", this.openRollPanel);
  },
  computed: {
    ...mapState({
      openUseRoll: state => state.map.openUseRoll
    })
  },
  watch: {
    openUseRoll(newVal, oldVal) {
      if (newVal) {
        document
          .getElementById("slider")
          .addEventListener("mousedown", this.mouseDown, false);
        window.addEventListener("mouseup", this.mouseUp, false);
      } else {
        document
          .getElementById("slider")
          .removeEventListener("mousedown", this.mouseDown, false);
        window.removeEventListener("mouseup", this.mouseUp, false);
      }
    }
  },
  methods: {
    changeBorderColor(param) {
      if (param == "left") {
        this.leftBorderColor = "3px solid #409EFF";
        this.rightBorderColor = "";
      } else {
        this.leftBorderColor = "";
        this.rightBorderColor = "3px solid #409EFF";
      }
    },
    openRollPanel(layerType, url) {
      this.showSplitPanel = true;
      this.layerType = layerType;
      this.url = url;
    },
    submit() {
      this.hasLayer = true;
      this.showSplitPanel = false;
      var rollerShutterConfig = {
        splitDirection: this.leftBorderColor
          ? new Cesium.Cartesian2(
              Cesium.ImagerySplitDirection.LEFT,
              Cesium.ImagerySplitDirection.NONE
            )
          : new Cesium.Cartesian2(
              Cesium.ImagerySplitDirection.RIGHT,
              Cesium.ImagerySplitDirection.NONE
            )
      };
      var layers, imagelayer;
      this.setRollerShutterSplit(
        this.leftBorderColor,
        this.layerType,
        this.url
      );
      this.mouseDown({
        clientX: 760
      });
    },
    mouseUp() {
      window.removeEventListener("mousemove", this.sliderMove, true);
    },
    mouseDown(e) {
      var slider = document.getElementById("slider");
      dragStartX = e.clientX - slider.offsetLeft;
      window.addEventListener("mousemove", this.sliderMove, true);
    },
    sliderMove(e) {
      console.log(e);
      //解决拖拽鼠标粘滞的bug
      if (e.preventDefault) {
        e.preventDefault();
      } else {
        e.returnValue = false;
      }
      var slider = document.getElementById("slider");
      var splitPosition =
        (e.clientX - dragStartX) / slider.parentElement.offsetWidth;
      slider.style.left = e.clientX - 425 + "px";
      if (this.hasLayer) {
        this.setRollerShutterSplit(
          this.leftBorderColor,
          this.layerType,
          this.url
        );
      }
    }
  },
  cancel() {
    this.showSplitPanel = false;
  }
};
</script>
<style lang="scss">
#slider {
  position: absolute;
  left: 50%;
  top: 0px;
  background-color: #d3d3d3;
  width: 4px;
  height: 100%;
}
#slider:hover {
  cursor: ew-resize;
}
</style>
