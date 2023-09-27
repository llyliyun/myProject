<template>
  <div class="seachart">
    <div>
      <div class="dateList">
        <el-select
          v-model="msg.fyear"
          placeholder="请选择时间"
          style="width: 90px"
          size="small"
          @change="handerString"
          @visible-change="handdate"
        >
          <el-option
            v-for="item in Dateoptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </div>
      <!-- <div class="dateList" style="right: 23vw">
        <div class="intellect" @click="Internet">物联网</div>
      </div> -->
      <unitselection ref="nitsele" @buildNature="buildNature"></unitselection>
      <tool ref="myref" @toollng="toollng"></tool>
      <files></files>
    </div>
    <div class="seachart-input">
      <input
        class="seachart-2"
        placeholder="输入项目名称搜索问题点位"
        v-model="msg.projectName"
        @change="seachart"
      />
      <img class="seachart-img" src="../img/sousuo.png" @click="getlist" />

      <div class="img" @click="closeSearch">
        <img
          style="width: 100%; height: 100%; cursor: pointer"
          src="../img/caidan.png"
        />
      </div>
    </div>

    <div class="leftDiv" :style="{ top: Top + 'rem' }" v-if="showAll">
      <div class="shaixuan">筛选条件</div>
      <div class="allDiv">
        <span class="title">工程状态</span>
        <div style="margin-right: 15px; margin-top: 5px; font-size: 10px">
          <el-radio-group
            class="ai-tab-change"
            fill="#1D4470"
            style="font-size: 10px"
            @change="jianceBtn"
            v-model="msg.state"
          >
            <el-radio-button
              class="el-radio-button"
              :label="item.value"
              v-for="(item, index) in stateData"
              :key="index"
              >{{ item.label }}</el-radio-button
            >
          </el-radio-group>
        </div>
      </div>

      <div class="allDiv">
        <span class="title">企业类型</span>
        <div style="margin-right: 15px">
          <el-radio-group
            class="ai-tab-change"
            fill="#1D4470"
            style="font-size: 10px"
            @change="shijianBtn"
            v-model="msg.flag"
          >
            <el-radio-button
              class="el-radio-button"
              v-for="(item, index) in flagData"
              :key="index"
              :label="item.value"
              >{{ item.label }}</el-radio-button
            >
          </el-radio-group>
        </div>
      </div>
      <div class="allDiv">
        <span class="title">建设性质</span>
        <div style="margin-right: 15px">
          <el-radio-group
            class="ai-tab-change"
            fill="#1D4470"
            style="font-size: 10px"
            @change="renleiBtn"
            v-model="msg.buildNature"
          >
            <el-radio-button
              class="el-radio-button"
              v-for="(item, index) in buildNatureData"
              :key="index"
              :label="item.value"
              >{{ item.label }}</el-radio-button
            >
          </el-radio-group>
        </div>
      </div>
      <div class="allDiv">
        <span class="title">是否包含子项目</span>
        <div style="margin-right: 15px">
          <el-radio-group
            class="ai-tab-change"
            fill="#1D4470"
            style="font-size: 10px"
            @change="xiangmuBtn"
            v-model="msg.pid"
          >
            <el-radio-button
              class="el-radio-button"
              v-for="(item, index) in IncludesData"
              :key="index"
              :label="item.value"
              >{{ item.label }}</el-radio-button
            >
          </el-radio-group>
        </div>
      </div>
      <div class="allDiv">
        <span class="title">项目类别</span>
        <div style="margin-right: 15px">
          <el-radio-group
            class="ai-tab-change"
            fill="#1D4470"
            style="font-size: 10px"
            @change="gongnengBtn"
            v-model="msg.ftype"
          >
            <el-radio-button
              class="el-radio-button"
              v-for="(item, index) in ftypeData"
              :key="index"
              size="mini"
              :label="item.value"
              >{{ item.label }}</el-radio-button
            >
          </el-radio-group>
        </div>
      </div>
      <div class="allDiv">
        <span class="title">项目级别</span>
        <div style="margin-right: 15px">
          <el-radio-group
            class="ai-tab-change1"
            fill="#1D4470"
            style="font-size: 10px"
            @change="flevelBtn"
            v-model="msg.flevel"
          >
            <el-radio-button
              class="el-radio-button"
              v-for="(item, index) in flevelData"
              :key="index"
              :label="item.value"
              >{{ item.label }}</el-radio-button
            >
          </el-radio-group>
        </div>
      </div>
      <div style="display: flex">
        <div class="chaxun" @click="getlist">查询</div>
        <div class="chaxun" @click="getreset">重置</div>
      </div>
    </div>

    <!-- <div class="leftDiv" v-if="detailShow" :style="{ top: Top + 'rem' }">
      <detail ref="detailref" @close="close" />
    </div> -->
    
    <detailBtn v-if="detailShow" ref="detailBtnref"/>

    <div
      class="leftDiv"
      v-show="nameShow"
      :style="{ top: Top + 'rem' }"
      @mouseleave="changeActive()"
      style="height: 60vh; overflow-y: auto"
    >
      <div
        class="tableList"
        v-for="(item, index) in tableData"
        :key="index"
        @click="getpointShow(item)"
      >
        <h2>
          <span>{{ index + 1 }}</span> {{ item.projectName }}
        </h2>
        <p>{{ item.busDepName }}</p>
      </div>
    </div>
    <div class="leftDiv lenghtClass" v-if="lenghtList" style="top: 1.7rem">
      <p v-show="lenghtshow == 'textlist'" @mouseenter="yiruData">
        共{{ tableData.length }}条数据
      </p>
      <p v-show="lenghtshow == 'textnode'" @click="backlist"><img class="imgDiv" src="../../static/img/project/fanhui.png"/>返回搜索数据</p>
      <detail v-show="lenghtshow == 'textnode'" ref="detailref"/>
    </div>
    <div class="shili">
      <v-legend />
    </div>
    <ofthings v-show="ofthingShow" ref="ofthings" @clearly="clearly" />
  </div>
</template>

<script>
import EventBus from "../js/event";
import tool from "./tool";
import legend from "./legend";
import unitselection from "./unitselection";
import detail from "./detail";
import detailBtn from "./detailBtn";

import files from "./files";
import ofthings from "./ofthings";
export default {
  components: {
    tool,
    detail,
    detailBtn,

    "v-legend": legend,
    unitselection,
    ofthings,
    files,
  },
  props: ["compareMapShow"],
  data() {
    return {
      current: 1,
      size: 20,
      total: 1,
      Top: 1.6,
      latlng: {},
      ofthingShow: false,
      lenghtList: false,
      detailData: {
        detailonelist: {},
        detailtwolist: {},
        detailthreelist: {},
      },
      //工程状态
      stateData: [
        {
          index: 1,
          value: "0",
          label: "未开工",
        },
        {
          index: 2,
          value: "1",
          label: "开工",
        },
        {
          index: 3,
          value: "2",
          label: "完工",
        },
        {
          index: 4,
          value: "3",
          label: "停工",
        },
      ],
      markerList: null,
      //企业类型
      flagData: [
        { index: 1, value: "CZ", label: "财政项目" },
        { index: 2, value: "QY", label: "企业项目" },
        { index: 3, value: "PPP", label: "PPP项目" },
      ],
      //是否包含子项目
      IncludesData: [
        { index: 1, value: "", label: "是" },
        { index: 2, value: "0", label: "否" },
      ],
      //       QQ 前期
      // XINJ 新建
      // XUJ 续建
      buildNatureData: [
        { index: 1, value: "QQ", label: "前期" },
        { index: 2, value: "XINJ", label: "新建" },
        { index: 3, value: "XUJ", label: "续建" },
      ],
      //项目类别
      ftypeData: [
        { index: 1, value: "XX", label: "新型城镇化提升" },
        { index: 2, value: "ST", label: "生态环境提升" },
        { index: 3, value: "HLHT", label: "互联互通信息" },
        { index: 4, value: "WHLY", label: "文化旅游示范" },
        { index: 5, value: "XCZX", label: "乡村振兴建设" },
        { index: 6, value: "MSSH", label: "民生社会事业" },
        { index: 7, value: "FPGJ", label: "脱贫攻坚涉农" },
      ],
      //项目级别
      // ZD 重点
      // YB 一般
      // ZDA 重大
      flevelData: [
        { index: 1, value: "ZD", label: "重点" },
        { index: 2, value: "YB", label: "一般" },
        { index: 3, value: "ZDA", label: "重大" },
      ],
      lenghtshow: "textlist",
      tableData: [],
      nameShow: false,
      value1: "",
      csfCheckList: "", //核查信息
      detailShow: false, //详细信息列表是否显示
      messageText: "详细信息",
      showAll: false, //是否展开全部
      hecha: false, //核查信息是否展示
      zhenggai: false, //整改信息是否展示
      time: "", //获取的当前年份
      markerImg1: "",
      markerImg2: "",
      zhenggaiMsg: "",
      mapvlayer: null,
      myIcon_cust: null,
      market: null,
      marketLIst: null,
      Dateoptions: [
        {
          value: "2018",
          label: "2018年",
        },
        {
          value: "2019",
          label: "2019年",
        },
        {
          value: "2020",
          label: "2020年",
        },
        {
          value: "2021",
          label: "2021年",
        },
        {
          value: "2022",
          label: "2022年",
        },
        {
          value: "2023",
          label: "2023年",
        },
      ],
      pointList: null, //物联网，空气点儿集合

      pointData: [],
      msg: {
        projectName: "", //项目名称
        state: "", //工程状态
        buildNoName: "", //建设单位
        flag: "", //企业类型
        buildNature: "", //建设性质
        ftype: "", //项目类别
        flevel: "", // 项目级别
        pid: "0", //是否包含子项目
        polygonPoint: "", //坐标范围
        fyear: "2023", //时间
      },
      selectType:''
    };
  },
  computed: {},
  created() {
    var mydate = new Date();
    this.time = mydate.getFullYear();
  },
  mounted() {
    EventBus.$on("show-analysis", (val)=>{
      this.projectBtnInfoShow.analysisShow = val;
    });
    EventBus.$on("clearbuildNoName", () => {
      this.msg.buildNoName = "";
    });
    if (this.compareMapShow == false) {
      this.fengchao();
    }

    EventBus.$on("gisBuilber", (data) => {
      this.getCsfCheck(data);
      this.Top = 2.1;
      this.detailShow = true;
      this.nameShow = false;
      this.showAll = false;
      this.lenghtList = true;
    });

    EventBus.$on("3dmaker", (data) => {
      this.latlng = data;
    });

    EventBus.$on("Ofthings", (type) => {
      this.ofthingShow = true;
      this.$refs.ofthings.createOfthings(type);
    });

    const busurl = window.location.href;
    const index = busurl.indexOf("=");
    if (index == "-1") {
      return;
    } else {
      // 调用接口
      let _this = this;
      const parjectId = busurl.substring(index + 1, index + 5);
      _this.getlist();
      setTimeout(() => {
        let _that = this;
        var arrFilter = _that.tableData.filter((e) => {
          return e.projectId == parjectId;
        });
        if (arrFilter.length > 0) {
          let icons = require("../img/lvdun1.png");
          let myIcon_cust = L.icon({
            iconUrl: icons,
            iconSize: [50, 50],
          });
          hcmap.flyTo(L.latLng(arrFilter[0].lng, arrFilter[0].lat), 13);
          let marker = L.marker(L.latLng(arrFilter[0].lng, arrFilter[0].lat), {
            dataVal: arrFilter[0],
            icon: myIcon_cust,
          });
          drawPlug.markerToMap(marker);
          _that.getCsfCheck(arrFilter[0].projectId);
          _that.Top = 2.1;
          _that.detailShow = true;
          _that.nameShow = false;
          _that.showAll = false;
          _that.lenghtList = true;
        } else {
          _that.$message("暂无空间位置");
          return;
        }
      }, 3000);
      setTimeout(() => {
        if (this.mapvlayer) hcmap.removeLayer(this.mapvlayer);
      }, 6000);
    }

    /** * 收起搜索*/
    this.$nextTick(function () {
      this.closeSearch();
    });
    EventBus.$on("billboardData", (data) => {
      this.getCsfCheck(data);
      this.Top = 2.1;
      this.detailShow = true;
      this.nameShow = false;
      this.showAll = false;
      this.lenghtList = true;
    });
  },
  destroyed() {
    EventBus.$off("billboardData");
    EventBus.$off("clearbuildNoName");
    EventBus.$off("3dmaker");
    EventBus.$off("Ofthings");
  },
  watch: {
    compareMapShow: {
      handler: function (newVal, oldVal) {
        // console.log(newVal);
        this.$nextTick(function () {
          this.closeSearch();
        });
      },
      deep: true, //为true，表示深度监听，这时候就能监测到a值变化
    },
  },
  methods: {
    buildNature(val) {
      this.msg.buildNoName = val;
    },

    //物联网点击
    Internet() {
      const latlng = this.latlng;
      if (latlng.lat) {
        const lianDianData = [
          {
            id: "video",
            lat: latlng.lat - 0.0005,
            lng: latlng.lng,
          },
          {
            id: "surrou",
            lat: latlng.lat,
            lng: latlng.lng + 0.0005,
          },
        ];
        if (this.pointList) {
          this.pointData.forEach((item) => {
            drawPlug.removeMarker(item);
          });
        }
        if (this.compareMapShow) {
          EventBus.$emit("marker3dplain", lianDianData);
        } else {
          this.Addapoint(lianDianData);
        }
      }
    },
    Addapoint(data) {
      let iconimg = null;
      let _this = this;
      _this.pointData = [];
      data.forEach((item) => {
        if (item.id == "video") {
          iconimg = require("../img/video.png");
        } else {
          iconimg = require("../img/huanjing.png");
        }
        var myIcon = L.icon({
          iconUrl: iconimg,
          iconSize: [18, 18],
        });
        _this.pointList = L.marker(L.latLng(item.lat, item.lng), {
          dataVal: item,
          icon: myIcon,
        });
        _this.pointList.on("click", (e) => {
          const type = e.target.options.dataVal.id;
          _this.ofthingShow = true;
          _this.$refs.ofthings.createOfthings(type);
        });
        _this.pointData.push(_this.pointList);
        drawPlug.markerToMap(_this.pointList);
      });
    },
    clearly() {
      this.ofthingShow = false;
    },
    //时间选择，更改时间
    handerString(val) {
      EventBus.$emit("Organizat", val);
    },
    getpointShow(row) {
      // console.log(row);
      if (this.compareMapShow) {
        EventBus.$emit("flyTolist", row);
      } else {
        if (row.lng == null || row.lat == null) {
          this.$message("暂无空间位置");
          return;
        }
        hcmap.flyTo(L.latLng(row.lng, row.lat), 13);
        if (this.market != null) {
          this.market.setIcon(this.marketLIst);
        }
        let icons = require("../img/lvdun1.png");
        this.myIcon_cust = L.icon({
          iconUrl: icons,
          iconSize: [50, 50],
        });
        this.marketLIst = row.marker.options.icon;
        this.market = row.marker;
        row.marker.setIcon(this.myIcon_cust);
      }
    },

    getpointShowone(row) {
      if (this.compareMapShow) {
        EventBus.$emit("flyTolist", row);
      } else {
        if (row.lng == null || row.lat == null) {
          this.$message("暂无空间位置");
          return;
        }
        if (this.market != null) {
          this.market.setIcon(this.marketLIst);
        }
        let icons = require("../img/lvdun1.png");
        this.myIcon_cust = L.icon({
          iconUrl: icons,
          iconSize: [50, 50],
        });
        this.marketLIst = row.marker.options.icon;
        this.market = row.marker;
        row.marker.setIcon(this.myIcon_cust);
      }
    },

    yiruData() {
      this.lenghtList = false;
      this.detailShow = false;
      this.nameShow = true;
      this.showAll = false;
      this.Top = 1.6;
    },
    //页码切换
    currentChange(current) {
      this.current = current;
    },
    backlist() {
      this.lenghtList = false;
      this.detailShow = false;
      this.nameShow = true;
      this.showAll = false;
      this.Top = 1.6;
    },
    //重置
    getreset() {
      EventBus.$emit("clearenminutes");
      this.msg = {
        projectName: "", //项目名称
        state: "", //工程状态
        flag: "", //企业类型
        buildNature: "", //建设性质
        ftype: "", //项目类别
        pid: "0", //是否包含子项目
        flevel: "", // 项目级别
        polygonPoint: "", //坐标范围
        buildNoName: "", //建设单位
        fyear: 2023, //时间
      };
    },
    changeActive() {
      setTimeout(() => {
        this.Top = 2.1;
        this.lenghtList = true;
        this.detailShow = false;
        this.nameShow = false;
        this.showAll = false;
        this.lenghtshow = "textlist";
      }, 50);
    },
    fengchao() {
      var data = [];
      this.$apiFun
        .csfMonitor()
        .then((res) => {
          let markerList = res.rows;
          for (let i = 0; i < markerList.length; i++) {
            if (
              markerList[i].lat == "" ||
              markerList[i].lng == "" ||
              markerList[i].lat == null ||
              markerList[i].lng == null
            ) {
              continue;
            } else {
              data.push({
                geometry: {
                  type: "Point",
                  coordinates: [markerList[i].lat, markerList[i].lng],
                },
                count: 1,
              });
            }
          }
          var dataSet = new mapv.DataSet(data);
          var options = {
            fillStyle: "rgba(55, 50, 250, 0.8)",
            shadowColor: "rgb(8,25,209)",
            shadowBlur: 10,
            max: 100,
            size: 50,
            unit: "px", // unit可选值['px', 'm']，默认值为'px'
            label: {
              show: true,
              fillStyle: "white",
            },
            globalAlpha: 0.5,
            gradient: {
              0: "rgb(16, 191, 219)",
              0.2: "rgb(69,117,180)",
              0.3: "rgb(8,197,179)",
              0.4: "rgb(16,171,225)",
              0.5: "rgb(224,243,248)",
              0.6: "rgb(254,224,144)",
              0.7: "rgb(253,174,97)",
              0.8: "rgb(244,109,67)",
              0.9: "rgb(215,48,39)",
              0.95: "rgba(21, 192, 201,.8)",
            },
            draw: "honeycomb",
          };
          debugger;
          //创建MapV图层
          this.mapvlayer = new L.supermap.MapVLayer(dataSet, options).addTo(
            hcmap
          );
        })
        .catch((err) => {
          this.$nextTick(() => {
            this.$message(err.message);
          });
        });
    },
    seachart() {
      // console.log(this.msg.projectName);
    },
    //点击时间选择关闭其他下拉
    handdate() {
      EventBus.$emit("clearent");
      EventBus.$emit("clearenminutes");
      EventBus.$emit("clearentool");
    },
    closeSearch() {
      this.showAll = !this.showAll;
      this.detailShow = false;
      this.nameShow = false;
      this.lenghtList = false;
      this.lenghtshow = "textlist";
      this.Top = 1.6;
    },
    //画面查询数据
    toollng(data) {
      this.$set(this.msg, "polygonPoint", data);
      this.getlist();
    },
    // 工程状态统计
    jianceBtn(label) {
      this.msg.state = label;
    },
    // 项目类型统计
    shijianBtn(label) {
      this.msg.flag = label;
    },
    // 建设性质统计
    renleiBtn(label) {
      this.msg.buildNature = label;
    },
    //是否包含子项目
    xiangmuBtn(label) {
      this.msg.pid = label;
    },
    // 项目类别统计
    gongnengBtn(label) {
      this.msg.ftype = label;
    },
    //项目级别
    flevelBtn(label) {
      this.msg.flevel = label;
    },
    //单位筛选
    nitsele() {},

    //  查询
    getlist(e) {
      let _this = this;
      debugger
      if (this.compareMapShow) {
        _this.$apiFun.csfMonitor(_this.msg).then((res) => {
          const { code, rows } = res;
          if (code === 200) {
            _this.tableData = rows;
            _this.detailShow = false;
            _this.nameShow = true;
            _this.showAll = false;
            _EventBus.$emit("markerplain", rows);
          } else {
            _this.$message("暂无数据");
          }
        });
      } else {
        if (_this.mapvlayer) hcmap.removeLayer(_this.mapvlayer);
        _this.$apiFun
          .csfMonitor(_this.msg)
          .then((res) => {
            const { code, rows } = res;
            if (code === 200) {
              if (_this.markerList) {
                drawPlug.clearLayer();
              }
              let markerList = rows;
              _this.tableData = markerList;
              _this.detailShow = false;
              _this.nameShow = true;
              _this.showAll = false;
              for (var i = 0; i < markerList.length; i++) {
                if (markerList[i].buildNature == "QQ") {
                  this.icons = require("../img/lvdun4.png");
                } else if (markerList[i].buildNature == "XINJ") {
                  this.icons = require("../img/lvdun2.png");
                } else {
                  this.icons = require("../img/lvdun3.png");
                }
                var myIcon = L.icon({
                  iconUrl: this.icons,
                  iconSize: [20, 20],
                });
                if (
                  markerList[i].lat == "" ||
                  markerList[i].lng == "" ||
                  markerList[i].lat == null ||
                  markerList[i].lng == null
                ) {
                  continue;
                }
                _this.markerList = L.marker(
                  L.latLng(markerList[i].lng, markerList[i].lat),
                  {
                    dataVal: markerList[i],
                    icon: myIcon,
                  }
                );
                _this.markerList.on("click", function (e) {
                  _this.latlng = e.latlng;
                  let target = e.target.options.dataVal;
                  const checkMonitorId = e.target.options.dataVal.projectId;
                  _this.markerImg1 =
                    "http://222.143.35.109:2014/form/sys/common/static/" +
                    e.target.options.dataVal.newImg;
                  _this.preImg =
                    "http://222.143.35.109:2014/form/sys/common/static/" +
                    e.target.options.dataVal.preImg;
                  _this.getpointShowone(target);
                  _this.Top = 2.1;
                  _this.detailShow = true;
                  _this.nameShow = false;
                  _this.showAll = false;
                  _this.lenghtList = true;
                  _this.lenghtshow = "textnode";
                  setTimeout(() => {
                    _this.getCsfCheck(checkMonitorId);
                  }, 50);
                });
                drawPlug.markerToMap(_this.markerList);
                markerList[i].marker = _this.markerList;
              }
            } else {
              _this.$message("暂无数据");
            }
          })
          .catch((err) => {
            _this.$nextTick(() => {
              _this.$message(err.message);
            });
          });
      }
    },
    close() {
      this.showAll = true;
      this.nameShow = false;
      this.detailShow = false;
    },
    getCsfCheck(checkMonitorId) {
      let timeYear = this.$moment(new Date()).format("YYYY"); //年
      let timemouted = this.$moment(new Date()).format("MM"); //当前月
      let _this = this;
      _this.$apiFun
        .getProjectOverView({
          projectId: checkMonitorId,
        })
        .then((res) => {
          const { code, data } = res;
          if (code === 200) {
            _this.$refs.detailref.detailDatalist({
              overViewData: data,
            });
          }
        });
      // .catch((err) => {
      //   _this.$nextTick(() => {
      //     _this.$message(err.message);
      //   });
      // });
      _this.$apiFun
        .getProjectProgress({
          year: timeYear,
          month: timemouted,
          projectId: checkMonitorId,
        })
        .then((res) => {
          const { code, data } = res;
          if (code === 200) {
            _this.$refs.detailref.detailDatalist2({
              progressData: data,
            });
            _this.$refs.detailBtnref.setProjectData(data);
          }
        });
      // .catch((err) => {
      //   _this.$nextTick(() => {
      //     _this.$message(err.message);
      //   });
      // });
      _this.$apiFun
        .getShenpiList({
          depName: "发改部门",
          projectId: checkMonitorId,
        })
        .then((res) => {
          const { code, data } = res;
          if (code === 200) {
            _this.$refs.detailref.detailDatalist3({
              profitData: data,
            });
          }
        });
      // .catch((err) => {
      //   _this.$nextTick(() => {
      //     _this.$message(err.message);
      //   });
      // });
      _this.$apiFun
        .csfMonitorImg({
          projectid: checkMonitorId,
        })
        .then((res) => {
          const { code, rows } = res;
          if (code === 200) {
            _this.$refs.detailref.detailDataImage({
              profitData: rows,
              id: checkMonitorId,
            });
          }
        });
      // .catch((err) => {
      //   _this.$nextTick(() => {
      //     _this.$message(err.message);
      //   });
      // });
      _this.$apiFun
        .csfMonitorProState({
          projectId: checkMonitorId,
        })
        .then((res) => {
          const { code, data } = res;
          if (code === 200) {
            _this.$refs.detailref.detailDataState({
              profitData: data,
            });
          }
        });
      // .catch((err) => {
      //   _this.$nextTick(() => {
      //     _this.$message(err.message);
      //   });
      // });
    },
  },
};
</script>

<style lang="scss" scoped>
.v-map2
  .leaflet-container
  .leaflet-touch
  .leaflet-retina
  .leaflet-fade-anim
  .leaflet-grab
  .leaflet-touch-drag
  .leaflet-touch-zoom {
  background-color: rgba(0, 0, 0, 0.2);
}

.project-line{
    max-width: 600px;
    min-width: 200px;
    height: 110px;
    z-index: 99;
    background: #0c293b30;
    float: right;
    right: 100px;
    position: absolute;
    top: 300px;
    border-radius: 5px;
    border: #62b4d8 solid 1px;
    .layer-title{
      padding: 10px 0 0 10px;
    }
}
.seachart {
  position: fixed;
  top: 1rem;
  left: 0.9rem;
}

.el-input__inner {
  width: 30vw;
  height: 4vh;
  color: #fff;
  border: none;
  padding: 0 6px;
}

.seachart-input {
  display: flex;
  width: 405px;
  height: 30px;
}

.seachart-2 {
  position: relative;
  padding-left: 10px;
  outline: none;
  color: #fff;
  width: 400px;
  // height: 30px;
  // background-color: rgba(0, 0, 0, 0.2);
  // border: #1d4470 solid 1px;

  height: 39px;
  background: rgba(0,13,22,0.4);
  border: 1px solid #00D2FF;
}

.seachart-img {
  position: absolute;
  width: 24px;
  height: 24px;
  right: 65px;
  top: 8px;
  cursor: pointer;
}
.lenghtClass {
  p {
    color: #00c6ff;
    cursor: pointer;
  }
  .imgDiv{
    top: 2px;
    position: relative;
  }
}
.caidan {
  width: 20px;
  height: 20px;
  background-color: #fff;
  margin-left: 10px;
}

.leftDiv {
  position: fixed;
  width: 385px;
  top: 2rem;
  left: 0.9rem;
  color: #000;
  padding: 10px;
  background: url("../../static/img/project/kuang1.png") no-repeat;
  background-size: 100% 100%;
  // background-color: rgba(0, 0, 0, 0.45);
  .tableList {
    color: #00c6ff;
    margin: 10px 8px;
    line-height: 28px;
    font-size: 16px;
    cursor: pointer;
    h2 {
      font-weight: normal;
      font-size: 16px;
    }
    p {
      color: #fff;
      text-indent: 1em;
    }
  }
}
.renlei {
  /* flex: 1; */
  width: 150px;
  height: 120px;
  box-shadow: 3px 3px 3px 1px inset;
  margin-right: 15px;
  text-align: center;
  padding: 5px;
  margin: 10px;
}

.huodong {
  margin-right: 5px;
  display: flex;
  flex-wrap: wrap;
  padding-top: 8px;
  padding-bottom: 8px;
}

.chaxun {
  width: 2rem;
  height: 0.625rem;
  margin: 0.1875rem auto;
  border-radius: 5px;
  text-align: center;
  line-height: 0.625rem;
  background: url("../img/button.png") no-repeat;
  background-size: 100% 100%;
  color: #fff;
  font-size: 15px;
  cursor: pointer;
}

.shaixuan {
  width: 97%;
  height: 0.4375rem;
  margin-top: 10px;
  line-height: 0.4375rem;
  background: url("../img/dabiao.png") no-repeat;
  background-size: 100% 100%;
  color: #fff;
  font-size: 15px;
  padding-left: 5px;
  font-weight: 700;
}

.img {
  // width: 0.25rem;
  // height: 0.25rem;
  margin-left: 0.0625rem;
  padding: 0.0625rem;
  // background-color: rgba(#176c83, 0.3);
  // border: #00c6ff solid 1px;

  width: 46px;
  height: 29px;
  background: linear-gradient(0deg, rgba(0,198,255,0.4), rgba(0,210,255,0.4));
  border: 1px solid #00D2FF;
}

.allDiv {
  width: 95%;
  margin-top: 6px;
  // border: #e0ffef solid 1px;
  padding: 5px;
  background: rgba(0, 0, 0, 0.4);
}

.title {
  color: #e0ffef;
  font-size: 14px;
  font-weight: 700;
}

.btn:focus {
  background: rgba(1, 255, 180, 0.4);
}

.btn {
  border: 1px solid #01ffb4;
  margin: 5px;
  border-radius: 5px;
}

input::input-placeholder {
  color: #e0ffef;
}

input::-webkit-input-placeholder {
  color: #e0ffef;
}

input::-moz-placeholder {
  /* Mozilla Firefox 19+ */
  color: #e0ffef;
}

input:-moz-placeholder {
  /* Mozilla Firefox 4 to 18 */
  color: #e0ffef;
}

input:-ms-input-placeholder {
  /* Internet Explorer 10-11 */
  color: #e0ffef;
}

.el-tabs__active-bar {
  color: #01ffb4;
  background-color: #01ffb4;
}
.dateList {
  position: fixed;
  top: 1rem;
  right: 17vw;
}
.xiangxi {
  width: 330px;
  /* height: 3rem; */
  background-color: rgba(0, 0, 0, 0.2);
  color: #fff;
  padding: 0.125rem;
  margin-top: 0.125rem;
}

.massage {
  line-height: 0.45rem;
}

.massage-img {
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 5px;
  vertical-align: text-top;
}

.el-radio-button {
  border: 1px solid #1d4470;
  margin: 2.5px;
  border-radius: 0.0625rem;
  background-color: rgba(0, 0, 0, 0.5);
}
.ab {
  display: flex;
  height: 0.375rem;
  margin-top: 0.125rem;
  margin-left: 0.125rem;
}

.dai {
  width: 0.44rem;
  height: 0.3rem;
}

.c1 {
  background-color: #ffa500;
}

.c2 {
  background-color: #00ffff;
}

.c3 {
  background-color: #00ff00;
}

.texe11 {
  line-height: 0.3rem;
  margin-left: 0.0625rem;
  font-size: 14px;
}
</style>
<style lang="scss" scoped>
.leftDiv /deep/ .el-radio-button__inner {
  background-color: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  padding: 7px 10px;
}

.el-cascader-menu__wrap {
  background-color: rgba(0, 0, 0, 0.2);
}
</style>
<style>
.div-icon {
  background: rgba(0, 0, 0, 0.644);
  color: #fff;
  padding: 6px 10px;
  height: 8px;
  width: 8px;
  border-radius: 8px;
  z-index: 2;
}
.leftDiv .el-table tr,
.leftDiv .el-table {
  background-color: rgba(12, 66, 75, 0.3) !important;
  color: #fff;
}
.leftDiv
  .el-table--enable-row-hover
  .el-table__body
  tr:hover
  > td.el-table__cell {
  background-color: rgba(12, 66, 75, 0.8) !important;
  color: #fff;
}
.leftDiv .el-table th {
  background-color: rgba(0, 0, 0, 0.3) !important;
  color: #fff !important;
}
.el-radio-button__inner {
  border: none;
}

.el-date-range-picker .el-picker-panel__body {
  background-color: rgba(1, 255, 180, 0.8);
  /* background-color: #fff; */
}
.dateList .el-input__inner,
.dateList .intellect {
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFMAAAAgCAYAAABuBERvAAAEWklEQVRoQ+2aTWxUVRTHz7n3fcw3bWcYK5m2RFiAWGorwbjRmJQaJW6MoRRL8SMBaUCMcamJ1Ji4cGM0kQ8bUmncEQ0xQUwEFmwMwYhQoHTSYjtMIGM7nY/Xmffm3XvNm2ZGplrTTF+Ng++u3mLumXt+539ucs85CM6yjQDaZskxBGWYuzNcIENADmDqAD5FO+fL/PaJxHIjQL0RIQSvJV4cEQnnjBtmgvu9W1Nq5D2dqY9RxQYvBAAQAE4BBIHpYS+GLKsVMDkv3OWCZ8BAN5Fz56l29wuXpo3pLvdDBMAyUVNLcMYZEzPULbeZ7qZ3mVA2IRHGMp1AgSJHEUOI8mpAAif9WORYhtmbLqQvvt1/M3Urqin1dbIWi+va1J28MAocCa3Z60CwgqAuNwlsXO911dfJhaxmAs47X81CIJBPJQtdZ06dcEsN71OhNg3Vo6cC5ivJfOx057OjmVvRudKfKP6ARFwKEaZZc6os+YCyDObcHDezGqsG3mJ7Xpq4POCSgkdk5ukYCi5Q5q6Ekb6wv+9a/OyP00rAT0GSqo6enYf+r9myoOgzSfPF6E+fudWmQYVJkeGFMPfMpL7+9oXtjeno7Zzs9RAUAgVizSpypYJgcdGTs4XukfMDAX/zPp37/V8FsbsizfdNXt3y5RPbD1OPi6zUQR4EuxZMI62Zvb+cObgRlEYX9SXeaWqKVsB8M3olfKS9c1ANBWXBuaPIRSJfhJmdM1++9EP/0wWTHtzQNlG+n0sfe29f7zj+eOeAvMpHHwQFrZQPJWXu+PXsoTZGQo2Mx19f3zpVmebj19qOdXR95MD85zCUYPZc+f6tVpMEw7J0543mDXEHZhXydWBWAW2xLQ5MB6aNBGw05SjTgWkjARtNOcp0YNpIwEZTjjL/bZjOc3JpxO9/Tm5hJBTJavGe1q2Vz8kDkz+v+XzTc0edQscSnpNZzey9dLp/nVKnPBpZN7EDsVh4LheA907daD3evu1jq5a5tBj9P381XzXSzD2XTx0I+1pCCfLwvRNBrFRmX3J28Juu59dmJ6byDtDFhVIqDu8cOXd4lSfyqkkD3sF6+lqFMncljJkL+/tuFtsW/oCEEnEq7X/DtATTalt41MgxmcnNw0EsZnM5zXum87Hvtj0zmhkbLzfUbElkJICKPH91cFGbRWeCSJAAy+fKswNWQ02lwaMK97T/paHWmzLSOf3eTgBjDJikECTLujs5AgLnjJhZHZjJGCLKy2ix2hLYKoxwJGidH5jEiOpy6YrqYTybUqnnSVUJfyAxtWWoAd0VytydZoLxwjgAmwWCEvDqe8tFESIQSfD8I1r8Q1XPTxBCKGPWDERtLQ6IEkcNkbknG9YcmhbuzQDCkCUaJqi0WKMdJwMLWr33j8f8mfzVO251kWQi8pu1WLcvl7mOhFJkrOZgmgDWDEYWgdeN1q/9NGZ4nkKCiiSXx2N+H/bi6gplVo/N2Vki4Awa2KiFPwC3hVs/eMyecwAAAABJRU5ErkJggg==)
    no-repeat;
  font-size: 14px;
  background-size: 100% 100%;
  background-color: #1d4470;
  text-align: left;
  border: 0;
  line-height: 0.375rem;
  color: #b0f1ff;
}
.dateList .intellect {
  cursor: pointer;
  padding: 2px 22px;
}
.el-select-dropdown__item {
  color: #b0f1ff !important;
}
.el-input__suffix {
  margin-right: 0.1rem !important;
}
.leaflet-bottom {
  display: none;
}

.el-radio-button:first-child .el-radio-button__inner {
  border: none;
}
</style>
