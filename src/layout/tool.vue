<template>
  <div class="tool">
    <div class="top">
      <div class="top-img">
        <!-- <img style="width: 100%; margin-left: -9rem" src="../img/biaoti.png" /> -->
      </div>
    </div>

    <div
      class="tool-item"
      style="margin-left: 0.125rem; cursor: pointer"
      id="closeSearchBtn"
      @click="closeSearch"
      v-if="!toolshow"
    >
      工具
    </div>
    <div class="allList" v-show="showAll">
      <div
        class="list"
        v-for="(item, index) in toolOnelist"
        :key="index"
        id="btnMeasureDistance"
        @click="toolOneclick(item)"
      >
        {{ item.name }}
      </div>
    </div>
    <div class="jingwei" v-if="dingwei">
      <i class="el-icon-circle-close" @click="close"></i>
      <el-form
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        style="margin-top: 20px"
      >
        <el-form-item prop="lat">
          <el-input v-model="ruleForm.lat" placeholder="请输入经度" />
        </el-form-item>
        <el-form-item prop="lnt">
          <el-input v-model="ruleForm.lnt" placeholder="请输入纬度" />
        </el-form-item>
      </el-form>

      <div class="present_submit">
        <el-button style="text-align: center" size="small" @click="onClose">
          定位
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import eventBus from "../js/event";
import { DrawControl } from "../js/drawControl.js";
import { Measure } from "../js/measure.js";
import { regionData } from "element-china-area-data";
import bus from "../../src/js/EventBus.js";
import "../../src/js/flexible.js";
export default {
  data() {
    return {
      dingwei: false,
      toolshow: false,
      ruleForm: {
        lat: "",
        lnt: "",
      },
      as: {},
      areaCodeArr: [], //选中城市
      toolOnelist: [
        {
          name: "量距",
        },
        {
          name: "量面",
        },
        {
          name: "区域查询",
        },
        {
          name: "全幅",
        },
        {
          name: "定位",
        },
        {
          name: "分屏",
        },
        {
          name: "清除",
        },
      ],
      value1: true, //自然环境保护区开关
      value2: true, //生态保护红线开关
      showAll: false, //是否展开全部
      newShowAll: false, //是否展开全部
      cityName: [],
      msg: {
        city: "", //选中城市名称
        county: "", //选中市辖区名称
      },
      rules: {
        lat: [{ required: true, message: "经度为必填项", trigger: "blur" }],
        lnt: [{ required: true, message: "纬度必填项", trigger: "blur" }],
      },
    };
  },

  computed: {},

  mounted() {
    /**
     * 工具
     */
    this.$bus.$on("clearentool", () => {
      this.showAll = false;
    });
    this.$bus.$on("compareMap", (data) => {
      this.toolshow = data;
    });

    eventBus.$on("handleAs", (val) => {
      let plogn = "";
      val.forEach((element) => {
        plogn += element.lat + " " + element.lng + ",";
      });
      plogn += val[0].lat + " " + val[0].lng;
      console.log(plogn);
      this.$emit("toollng", plogn);
    });
  },
  destroyed() {
    this.$bus.$off("clearentool");
    this.$bus.$off("compareMap");
    this.$bus.$off("handleAs");
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      //城市选择  过滤只剩河南省
      this.cityName = regionData.filter((item) => item.label === "河南省");
    },
    closeSearch() {
      this.showAll = !this.showAll;
      this.$bus.$emit("clearent");
      this.$bus.$emit("clearenminutes");
    },

    handleChange(e, form, thsAreaCode) {
      //省区市选择
      var thsAreaCode = this.$refs["refSubCat"].getCheckedNodes()[0].pathLabels; //获取label值
      console.log(thsAreaCode);
      this.msg.city = thsAreaCode[1];
      this.msg.county = thsAreaCode[2];
      console.log(this.msg.city);
    },

    biaoji() {
      let drawControl = new DrawControl(hcmap);
      drawControl.drawMarker(); //标记
      console.log(item.index);
    },
    onClose() {
      const _that = this;
      _that.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          hcmap.setView(L.latLng(this.ruleForm.lnt, this.ruleForm.lat), 7);
        } else {
          return false;
        }
      });
    },
    close() {
      this.dingwei = false;
    },
    toolOneclick(item) {
      drawPlug.clearLayer();
      //量算
      if (item.name == "量距") {
        drawPlug.startDrawLine();
      } else if (item.name == "量面") {
        drawPlug.startDrawPolygon(item.name);
      } else if (item.name == "区域查询") {
        drawPlug.startDrawPolygon(item.name);
      } else if (item.name == "定位") {
        this.dingwei = true;
      } else if (item.name == "分屏") {
        //this.dingwei = true;
      } else if (item.name == "清除") {
        drawPlug.clearLayer();
      } else {
        hcmap.setView(L.latLng(38.84239, 110.49896), 8);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.tool {
  position: fixed;
  top: 1rem;
  right: 0.3rem;

  /deep/ .el-cascader {
    line-height: 30px;
  }
  .jingwei {
    position: fixed;
    top: 2rem;
    right: 2rem;
    background-color: rgba(12, 41, 59, 0.4);
    padding: 10px 12px;
    /deep/ .present_submit {
      width: 20%;
      margin: 0 auto;
    }
    /deep/ .el-form-item {
      margin-bottom: 16px;
    }
    /deep/ .el-icon-circle-close {
      position: absolute;
      font-size: 26px;
      top: 2px;
      right: 10px;
      color: #fff;
    }
    /deep/ .el-button {
      background-color: #0a8aa9;
      color: #fff;
      border: 1px solid #16cefc;
    }
  }
  /deep/ .el-input__inner {
    display: inline-block;
    margin-right: 0.225rem;
    background-size: 100% 100%;
    background-color: rgba(12, 41, 59, 0.8);
    text-align: center;
    line-height: 0.375rem;
    color: #afffdc;
    border: none;
  }

  /deep/ .el-cascader__label {
    color: #ffffff;
  }

  .toolOne {
    display: flex;

    li {
      cursor: pointer;
      padding: 0.075rem 0.1rem;
      margin: 0 0.05rem;
      border: 0.0125rem solid rgb(18, 247, 255);
      background: rgba(7, 153, 158, 0.575);
      color: #fff;
    }
  }
}

.tool-item {
  font-size: 14px;
  letter-spacing: 5px;
  width: 1.025rem;
  height: 0.375rem;
  display: inline-block;
  margin-right: 0.225rem;
  // float: left;
  background: url("../img/bg.png") no-repeat;
  background-size: 100% 100%;
  background-color: rgb(29, 68, 112);
  text-align: center;
  line-height: 0.375rem;
  color: #b0f1ff;
  font-weight: 400;
  font-family: ShiShangZhongHeiJianTi;
  ::-webkit-input-placeholder {
    color: #ffffff;
  }
}

#searchBox {
  overflow: hidden;
}

.list {
  cursor: pointer;
  padding: 0.075rem 0.1rem;
  margin: 0 0.05rem;
  // border: 0.0125rem solid rgb(18, 247, 255);
  border: 1px solid #16cefc;
  background-color: rgba(12, 41, 59, 0.8);
  text-align: center;
  color: #fff;
}

.A {
  position: relative;
}

.allList {
  width: 1.25rem;
  position: absolute;
  top: 0.6875rem;
  right: 0rem;
  // z-index: 1000;
}

.bottom {
  position: fixed;
  bottom: 4vh;
  left: 2vw;
  display: flex;
}

.top {
  position: fixed;
  width: 100%;
  height: 8.6vh;
  top: 0vh;
  left: 0vw;
  // background: url("../img/biaoti_bg.png") no-repeat;
  background-size: 100% 100%;
}

.top-img {
  width: 20%;
  margin: 0.21rem auto;
}

.bottonm-list {
  width: 0.8125rem;
  height: 0.8125rem;
  margin-right: 0.1875rem;
  background-color: rgba(255, 215, 0, 0.7) !important;
  color: #000;
  font-size: 15px;
}

.shengtai {
  width: 3rem;
  height: 1.3rem;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.4);
  font-size: 15px;
  position: absolute;
  top: 0.6875rem;
  right: 0.375rem;
  border: 1px solid #01ffb4;
}

.chengshi {
  width: 240px;
  height: 120px;
  margin-top: 0.0625rem;
  background-color: #fff;
  position: absolute;
  top: 0.6875rem;
  right: 0.375rem;
}

.shengtai-item {
  display: block;
  margin-top: 0.125rem;
  margin-left: 0.0625rem;
}

.tool-item-t {
  width: 2rem;
}
</style>

<style>
.el-cascader-menu {
  display: inline-block;
  vertical-align: top;
  height: 204px;
  overflow: auto;
  border-right: solid 1px #e4e7ed;
  background-color: rgba(0, 0, 0, 0.1);
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  margin: 0;
  padding: 6px 0;
  min-width: 160px;
}

.el-cascader-menus {
  background-color: rgba(0, 0, 0, 0.1);
}

.el-popper .popper__arrow {
  border: none;
}

.el-cascader-menu__item.is-active {
  color: #fff;
  background-color: rgba(1, 255, 180, 0.4);
}

.el-cascader-menu__item:hover {
  color: #fff;
  background-color: rgba(1, 255, 180, 0.4);
}

.el-cascader__label span {
  color: rgba(1, 255, 180);
}

.el-cascader-menu__item:focus:not(:active),
.el-cascader-menu__item:hover {
  background-color: rgba(1, 255, 180, 0.4);
}

.el-cascader-menu__item,
.el-cascader__label {
  color: #fff;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.el-input__suffix {
  right: 1px;
}

.el-input__suffix {
  color: rgba(1, 255, 180, 0.4);
  margin-right: 0.25rem;
  vertical-align: middle;
}

.el-input__icon {
  line-height: 0px;
}

.el-cascader__dropdown {
  background-color: rgba(0, 0, 0, 0.1);
}

.el-cascader-panel {
  color: #fff;
}

.el-cascader-node__label {
  color: #fff;
}

.el-cascader-node:hover,
.el-cascader-node:not(.is-disabled):focus,
.el-cascader-node in-active-path,
.el-cascader-node:not(.is-disabled):hover {
  background-color: rgba(1, 255, 180, 0.4) !important;
}

.el-cascader-node.in-active-path,
.el-cascader-node.in-hover-path,
.el-cascader-node.is-active,
.el-cascader-node.is-selectable.in-checked-path {
  /* color: ; */
  font-weight: 700;
  background-color: rgba(1, 255, 180, 0.4);
}

.el-cascader-panel {
  background-color: rgba(0, 0, 0, 0.1);
}

.el-popper .el-cascader__dropdown {
  background-color: rgba(0, 0, 0, 0.1);
}

.el-popper[x-placement^="bottom"] {
  background-color: rgba(0, 0, 0, 0.1);
}
.leaflet-touch .leaflet-control-zoom-in,
.leaflet-touch .leaflet-control-zoom-out {
  color: #7a9bc1;
  background: #1d4470;
  border: 1px solid #1d4470;
}
.leaflet-bar a:hover {
  color: #7a9bc1;
  background: #1d4470;
  border: 1px solid #1d4470;
}
</style>
