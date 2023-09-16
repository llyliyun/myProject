<template>
  <section class="statistical-container">
    <div class="statistical-tools">
      <div class="tools-summary">
        <span :class="{ 'summary-checked': !showDetail }" @click="showDataType(false)">汇总</span>
        <span :class="{ 'summary-checked': showDetail }" @click="showDataType(true)">详细记录</span>
      </div>
      <div class="tools-btn">
       <template v-if="!showDetail">
          <span>汇总字段</span>
          <el-select v-model="summaryValue" multiple collapse-tags placeholder="请选择" size="mini" @change="summaryChange">
            <el-option v-for="field in summaryFields" :key="field" :label="field" :value="field">
            </el-option>
          </el-select>
          <span v-if="lengthExist || areaExist">单位</span>
          <el-select v-if="lengthExist || areaExist" style="width: 120px" v-model="unitValue" placeholder="请选择" size="mini" @change="unitChange">
            <el-option v-for="unit in areaExist ? areaUnits : lengthUnits" :key="unit" :label="unit" :value="unit">
            </el-option>
          </el-select>
        </template>
         <!-- <span class="tools-export-dropdown" @click="exportTxtCoords">导出坐标范围</span>
        <span class="tools-export-btn" v-if="!showDetail && !exportStatus" @click="exportExecl">导出</span>
        <el-dropdown @command="exportCommand" v-if="showDetail && !exportStatus">
          <span class="el-dropdown-link tools-export-dropdown">
            导出<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="execl">execl</el-dropdown-item>
            <el-dropdown-item command="udb">udb</el-dropdown-item>
            <el-dropdown-item command="shp">shp</el-dropdown-item>
            <el-dropdown-item command="dwg">cad</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <span class="tools-export-in" v-if="exportStatus">
          <i class="el-icon-loading"></i>正在导出中
        </span> -->
      </div>
    </div>
    <div class="statistical-content" :style="{ width: showDetail ? '100%' : '100%' }">
      <el-table class="data-table" :data="statisticalData.data" ref="table" :max-height="270" use-virtual showBodyOverflow="title" showHeaderOverflow="title" :row-height="rowHeight" :highlight-current-row="true" @selection-change="selectionChange">
        <el-table-column v-if="showDetail" type="selection" align="center" width="55">
        </el-table-column>
        <el-table-column v-if="showDetail" type="index" :index="indexMethod">
        </el-table-column>
        <el-table-column v-for="(key, index) in statisticalData.keys" :label="key === '面积' ? '面积(' + unitValue + ')' : key" :key="Math.floor(Math.random() * 10000)">
          <template slot-scope="scope">
            <div class="cell-item" :title="scope.row[key]">
              {{ scope.row[key] }}
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div>
        <el-pagination v-show="showDetail" class="max-data-tips" :page-size="pageSize" :total="total" :current-page="1" @current-change="handleCurrentChange" layout="total,prev,pager,next">
        </el-pagination>
      </div>
    </div>
    <!-- <div class="statistical-content" v-if="!showDetail">
      <el-button-group>
        <el-button :class="echartsType == 'pie' ? 'select-btn':''" type="primary" size="small" @click="changeEchart('pie')">扇形图</el-button>
        <el-button :class="echartsType == 'line' ? 'select-btn':''" type="primary" size="small" @click="changeEchart('line')">折线图</el-button>
        <el-button :class="echartsType == 'bar' ? 'select-btn':''" type="primary" size="small" @click="changeEchart('bar')">柱形图</el-button>
      </el-button-group>
      <div :ref="echartsType" style="width: 100%; height: 100%;"></div>
    </div> -->
  </section>
</template>

<script>
// import echart from 'echarts'
// import { apiExportExecl, apiGenerateSpatilFile } from "@/apis/map-api.js";
// import { Map, DFC } from "@/config/app-config.js";

let _echart;
const events = [
  "select",
  "select-all",
  "selection-change",
  "cell-mouse-enter",
  "cell-mouse-leave",
  "cell-click",
  "cell-dblclick",
  "row-click",
  "row-contextmenu",
  "row-dblclick",
  "header-click",
  "header-contextmenu",
  "sort-change",
  "filter-change",
  "current-change",
  "header-dragend",
  "expand-change"
];
export default {
  data() {
    return {
      tableData:{
        data: [],
        keys: []
      },
      summaryFields: [],
      summaryValue: [],
      showDetail: true,
      areaUnits: ["平方米", "亩", "公顷", "万亩"],
      lengthUnits: ["米", "千米", "英里"],
      unitValue: "平方米",
      statisticalData: { data: [], keys: [] },
      areaExist: false,
      lengthExist: false,
      selection: [],
      exportStatus: false,
      headDate: [],
      arr: [],
      conflictName: [],
      total: null,
      pageSize: APPCONFIG.analysisPagesize,
      rowHeight: 30,
      echartsType:'pie'
    };
  },
  mounted() {
    events.forEach(item => {
      this.$refs.table.$on(item, (...args) => {
        this.$emit(`l-${item}`, args, this.showDetail);
      });
    });
    this.$bus.$on("result-active", this.highlight);
    this.tableDataFun();
  },
  props: {
    selectData: {
      type: Array,
      default() {
        return [];
      }
    },
    geojsonData: {
      type: Object,
      default() {
        return {};
      }
    },
    //是否过滤sm默认系统字段
    filterSM: {
      type: Boolean,
      default: true
    },
    //是否过滤非中文字段
    filterChinese: {
      type: Boolean,
      default: false
    },
    //是否数字过滤科学化
    filterDigital: {
      type: Object,
      default() {
        return {
          fixed: 2, //保留两位小数
          bigDecimal: false, //是否科学计数}
          checked: true
        };
      }
    },
    width: {
      type: Number,
      default: 400
    },
    size: {
      type: String,
      default: "small"
    },
    name: {
      type: String,
      default: ""
    },
    dataType: {
      type: String,
      default: ""
    }
  },

  watch: {
    geojsonData() {
      this.tableDataFun();
    }
  },
  computed: {
  },
  methods: {
    tableDataFun(){
      let self = this;
      let _data = [],
        _keys = [];
      if(this.geojsonData && this.geojsonData.features){
        if (this.geojsonData.type == "FeatureCollection") {
          _data = this.geojsonData.features.map(feature => {
            return feature.properties;
          });
        }
        _keys =
          this.geojsonData.features && this.geojsonData.features.length
            ? Object.keys(this.geojsonData.features[0].properties)
            : [];
        if (this.filterSM) {
          _keys = _keys.filter(
            item =>
              item.toLowerCase() === "smarea" ||
              !item.toLowerCase().startsWith("sm")
          );
        }
        if (this.filterChinese) {
          _keys = _keys.filter(item => /.*[\u4e00-\u9fa5]+.*/.test(item));
        }
        if (_data && _data.length > 0) {
          _data.forEach(element => {
            _keys.map(item => {
              if (self.filterDigital.checked) {
                let reg = /^[+-]?((0|([1-9]\d*))\.\d+)?$/;
                //数值
                element[item] && (element[item] = element[item] + "");
                if (element[item] && element[item].trim() != "" && reg.test(element[item])) {
                  element[item] = parseFloat(element[item]).toFixed(
                    self.filterDigital.fixed
                  );
                }
                if (/^-?\d+(\.\d+)?(E-?\d+)?$/.test(element[item])) {
                  if (!self.filterDigital.bigDecimal) {
                    element[item] = self.getFullNum(element[item]);
                  }
                }
              }
            });
          });
        }
      }
      this.tableData = {
        data: _data,
        keys: _keys
      }
      this.initData();
    },
    handleCurrentChange(val) {
      if (val != 1) {
        val = (val - 1) * this.pageSize //比如点击是2，并且pageSize是10的时候 那么数据下标是 10开始就是10
        let number = this.tableData.data.length;
        if (number > val + this.pageSize) {
          this.statisticalData.data = this.tableData.data.slice(val, val + this.pageSize);
        } else {
          this.statisticalData.data = this.tableData.data.slice(val, this.tableData.data.length);
        }
      } else {
        this.statisticalData.data = this.tableData.data.slice(0, this.pageSize);
      }
    },
    //科学计数法转换
    getFullNum(num) {
      var m = parseFloat(num)
        .toExponential()
        .match(/\d(?:\.(\d*))?e([+-]\d+)/);
      if (m && m.length > 0) {
        return parseFloat(num).toFixed(Math.max(0, (m[1] || "").length - m[2]));
      } else {
        return num;
      }
    },
    indexMethod(index) {
      return index + 1;
    },
    highlight(data) {
      //回显高亮方法，根据已经选择的id，调用 element-ui table的设置高亮方法
      if (!this.statisticalData.data || this.statisticalData.data.length < 1)
        return;
      for (var a = 0; a < this.statisticalData.data.length; a++) {
        if (
          (data.SmID && this.statisticalData.data[a].SmID === data.SmID) ||
          (data.SMID && this.statisticalData.data[a].SMID === data.SMID)
        ) {
          this.$refs.table &&
            this.$refs.table.setCurrentRow(this.statisticalData.data[a]);
          break;
        }
      }
    },
    initData() {
      this.summaryFields = this.tableData.keys.filter(
        item => item.toLowerCase() !== "smarea"
      );
      this.summaryValue.push(this.summaryFields[0]);
      let existAreaOrLength = Object.keys(this.tableData.data[0]);
      this.areaExist =
        existAreaOrLength.indexOf("SmArea") > -1 ||
          existAreaOrLength.indexOf("SMAREA") > -1
          ? true
          : false;
      this.lengthExist =
        existAreaOrLength.indexOf("SmLength") > -1 ||
          existAreaOrLength.indexOf("SMLENGTH") > -1
          ? true
          : false;
      if (this.areaExist) this.unitValue = this.areaUnits[0];
      if (this.lengthExist) this.unitValue = this.lengthUnits[0];
      this.processData();


    },
    processData() {
      this.arr.push(this.tableData)
      if (this.showDetail) {
        this.total = this.tableData.data.length
        this.statisticalData.data = this.tableData.data.slice(0, this.pageSize)
        this.statisticalData.keys = this.tableData.keys
        // this.statisticalData = this.tableData;
        this.statisticalData.name = this.name;
        this.$bus.$emit('table-data', this.statisticalData)
        this.headDate = this.statisticalData.keys;
        /*this.$nextTick( ()=> {
            this.statisticalData.data.forEach((item) => {
              this.$refs.table.toggleRowSelection(item)
            })
          })*/
      } else {
        let keys = ["分类", "数量"],
          datas = [],
          totalArea = 0,
          totalLength = 0;
        if (this.areaExist) keys.push("面积");
        if (this.lengthExist) keys.push("长度");
        this.tableData.data.forEach(item => {
          if (this.areaExist)
            totalArea =
              totalArea +
              this.unitTran(Number(item["SMAREA"] || item["SmArea"]));
          if (this.lengthExist)
            totalLength =
              totalLength +
              this.unitTran(Number(item["SMLENGTH"] || item["SmLength"]));
          let groupVal = "";
          this.summaryValue.forEach((summery, index) => {
            if (index === this.summaryValue.length - 1) {
              groupVal += item[summery];
            } else {
              groupVal += item[summery] + "_";
            }
          });
          let find = datas.find((data, index) => {
            return data.分类 === groupVal;
          });
          if (find) {
            datas[datas.indexOf(find)].数量++;
            if (this.areaExist) {
              datas[datas.indexOf(find)].面积 += this.unitTran(
                Number(item["SMAREA"] || item["SmArea"])
              );
              datas[datas.indexOf(find)].面积 = Number(
                datas[datas.indexOf(find)].面积.toFixed(3)
              );
            }
            if (this.lengthExist) {
              datas[datas.indexOf(find)].长度 += this.unitTran(
                Number(item["SMLENGTH"] || item["SmLength"])
              );
              datas[datas.indexOf(find)].长度 = Number(
                datas[datas.indexOf(find)].长度.toFixed(3)
              );
            }
          } else {
            let obj = {
              分类: groupVal,
              数量: 1
            };
            if (this.areaExist)
              obj.面积 = this.unitTran(
                Number(item["SMAREA"] || item["SmArea"])
              );
            if (this.lengthExist)
              obj.长度 = this.unitTran(
                Number(item["SMLENGTH"] || item["SmLength"])
              );
            datas.push(obj);
          }
        });
        let total = {
          分类: "合计：",
          数量: this.tableData.data.length
        };
        if (this.areaExist) total.面积 = totalArea.toFixed(3);
        if (this.lengthExist) total.长度 = totalLength.toFixed(3);

        this.statisticalData = {
          data: [total].concat(datas),
          keys: keys
        };
        this.$refs.table && this.$refs.table.doLayout();
        //this.generateChart();
      }
    },
    summaryChange(value) {
      this.processData();
    },
    showDataType(flag) {
      this.showDetail = flag;

      this.processData();

    },
    unitChange(unit) {
      this.processData();

    },
    unitTran(num) {
      let distance = 0;
      switch (this.unitValue) {
        case "亩":
          distance = num / 666.6666667;
          break;
        case "公顷":
          distance = num / 10000;
          break;
        case "万亩":
          distance = num / 6666666.667;
          break;
        case "千米":
          distance = num / 1000;
          break;
        case "英里":
          distance = num / 1609.344;
          break;
        default:
          distance = num;
      }
      return parseFloat(distance.toFixed(3));
    },
    generateChart() {
      let dataArrPie = [], keys = [], values = [];
      this.statisticalData.data.forEach(item => {
        if (item.分类 !== "合计：") {
          keys.push(item.分类);
          values.push(item.面积 || item.长度 || item.数量)
          dataArrPie.push({
            value: item.面积 || item.长度 || item.数量,
            name: item.分类
          });
        }
      });
      this.$nextTick(_ => {
        let option = null;
        if(this.echartsType === 'pie'){
          option = {
            color: [
              "#ED852E",
              "#EA1A4C",
              "#1E84AC",
              "#2851C3",
              "#7EC46C",
              "#586DB1",
              "#F3A93E",
              "#E23551"
            ],
            tooltip: {
              trigger: "item",
              formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            calculable: true,
            series: [
              {
                name: "分类",
                type: "pie",
                radius: "70%",
                center: ["50%", "50%"],
                data: dataArrPie
              }
            ]
          };
        } else if(this.echartsType === 'bar'){
          option = {
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow'
              }
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true
            },
            xAxis: {
              type: 'category',
              data: keys
            },
            yAxis: {
              type: 'value'
            },
            series: [
              {
                data: values,
                type: 'bar'
              }
            ]
          };
        } else {
          option = {
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow'
              }
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true
            },
            xAxis: {
              type: 'category',
              data: keys
            },
            yAxis: {
              type: 'value'
            },
            series: [
              {
                data: values,
                type: 'line'
              }
            ]
          };
        }
        _echart && _echart.clear();
        _echart = echarts.init(this.$refs[this.echartsType]);
        _echart.setOption(option);
        _echart.resize();
      });
    },
    exportTxtCoords() {
      this.$bus.$emit("toolbar-export-txt", this.exportTxt);
    },
    exportCommand(command) {
      if (!this.selection.length) {
        this.$message.warning("请先勾选记录集");
        return;
      }
      if (command === "execl") {
        this.exportExecl();
      } else {
        this.exportDataset(command);
      }
    },
    async exportExecl() {
      this.exportStatus = true;
      let arr = [];
      if (this.showDetail) {
        this.selection.forEach(item => {
          let obj = {};
          this.statisticalData.keys.forEach(_key => {
            obj[_key] = item[_key];
          });
          arr.push(obj);
        });
      } else {
        this.statisticalData.data.forEach(item => {
          let obj = {};
          this.statisticalData.keys.forEach(_key => {
            obj[_key] = item[_key];
          });
          arr.push(obj);
        });
      }
      let param = {
        tableHead: this.statisticalData.keys,
        imgs: this.showDetail ? [] : [_echart.getDataURL({ pixelRatio: 2 })],
        tableData: arr
      };

      let res = await apiExportExecl(param);
      if (res) {
        const exlLink = document.createElement("a");
        exlLink.style.display = "none";
        exlLink.href =
          `${Map.location}/services/file/export/download?id=` +
          res.data.resultInfo.data;
        document.body.appendChild(exlLink);
        exlLink.click();
        document.body.removeChild(exlLink);
      }
      this.exportStatus = false;
    },
    async exportDataset(type) {
      this.exportStatus = true;
      let _features = [];
      this.selection.forEach(select => {
        this.geojsonData.features.forEach(item => {
          if (item.properties === select) {
            _features.push(item);
          }
        });
      });
      let _geojson = {
        type: this.geojsonData.type,
        features: _features
      };
      let res = await apiGenerateSpatilFile({
        geojson: _geojson,
        fileType: type,
        fileName:
          (this.name.indexOf("@") > -1 ? this.name.split("@")[0] : this.name) ||
          this.getTime(),
        dataType: this.dataType || "REGION"
      });
      if (res.data.resultInfo.success) {
        const exlLink = document.createElement("a");
        exlLink.style.display = "none";
        exlLink.href =
          `${DFC.transGeojsonToDataset}?name=` + res.data.resultInfo.data;
        document.body.appendChild(exlLink);
        exlLink.click();
        document.body.removeChild(exlLink);
      } else {
        this.$message.error(res.data.resultInfo.message);
      }
      this.exportStatus = false;
    },
    selectionChange(selection) {
      this.selection = selection;
    },
    getTime() {
      let date = new Date();
      let year = date.getFullYear();
      let month =
        date.getMonth() + 1 > 9
          ? date.getMonth() + 1
          : "0" + (date.getMonth() + 1);
      let day = date.getDate() > 9 ? date.getDate() : "0" + date.getDate();
      let hour = date.getHours();
      let minute =
        date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes();
      return year + "" + month + "" + day + "" + hour + "" + minute;
    },
    /**更改图表统计类型 */
    changeEchart(type){
      this.echartsType = type;
      this.generateChart();
    }
  }
};
</script>
<style lang="scss">
.statistical-container {
  .statistical-tools {
    height: 30px;
    line-height: 30px;
    background: #f5f7fa;
    font-size: 14px;

    .tools-summary {
      float: left;

      > span {
        height: 100%;
        display: inline-block;
        padding: 0 16px;
        cursor: pointer;
        color: black;
      }

      .summary-checked {
        background: #fff;
        font-weight: bold;
        color: #1569b2;
      }
    }

    .tools-btn {
      float: right;
      padding-right: 10px;

      .tools-export-btn {
        border-radius: 2px;
        padding: 0 15px;
        margin: 2px 0 2px 8px;
        display: inline-block;
        background: #1569b2;
        color: #fff;
        cursor: pointer;
        border-radius: 2px;
      }

      .tools-export-dropdown {
        height: 100%;
        margin: 2px;
        padding: 0 9px;
        display: inline-block;
        background: #1569b2;
        color: #fff;
        cursor: pointer;
        border-radius: 2px;

        i {
          margin-left: 2px;
        }
      }

      .tools-export-in {
        border-radius: 2px;
        padding: 0 15px;
        margin: 2px 0 2px 8px;
        display: inline-block;
        background: #1569b2;
        color: #fff;
        user-select: none;

        i {
          animation: rotating 2s linear infinite;
        }
      }
    }
  }

  .statistical-content {
    width: 50%;
    float: left;
    height: 300px;
  }
  .el-button-group{
    float: right;
    margin: 5px 10px;
    z-index: 9999999;
    position: fixed;
    right: 0;
    .el-button--primary {
      color: #050c37;
      background-color: #ffffff;
      border-color: #1569b2;
    }
    .el-button--primary:not(:first-child):not(:last-child){
      border-right-color: #1569b2;
      border-left-color: #1569b2;
    }    
    .select-btn{
      background: #1569b2;
      color: white;
    }
  }
  .max-data-tips {
    text-align: center;
    padding: 3px 0;
    font-size: 12px;
    color: #000000;
    /deep/.el-pagination.is-background .el-pager li:not(.disabled).active {
      background-color: #1569b2;
      //color: #FFF;
    }
  }
  .el-table--scrollable-x .el-table__body-wrapper {
    height: 270px;
  }
}
</style>
