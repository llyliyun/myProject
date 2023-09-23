<template>
  <div class="scence-query-list" id="scenceQueryList" v-if="data.length >0 ">
    <i class="fa fa-hand-o-right handRight" v-if="isShow" @click="hideQueryLists" aria-hidden="true"></i>
    <i class="fa fa-hand-o-left handLeft" v-if="!isShow"  @click="showQueryLists" aria-hidden="true"></i>
    <el-tabs v-model="activeName" type="border-card"  @tab-click="switchQueryList" :style="isShow ? '' : 'border:0'">
      <el-tab-pane v-for="(val,index) in data"  :name="index+''" :key="val.name" :label="val.name">
        <table>
          <div style="position: fixed;">
            <thead>
              <tr>
                <th style="word-break: keep-all;white-space:nowrap;padding: 5px" v-for="(value,key,inde) in val.data.features[0].properties">
                  {{key}}
                </th>
              </tr>
            </thead>
          </div>
          <tbody style="margin-top: 39px;display: block;">
            <tr v-for="(li,ind) in val.data.features" @click="clickRow(li,$event)">
              <td style="word-break: keep-all;white-space:nowrap" v-for="(value,key,inde) in li.properties">
                {{value}}
              </td>
            </tr>
          </tbody>
        </table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import $ from "jquery";
export default {
  components: {},
  data() {
    return {
      data: [],
      isShow:true,
      activeName:'0'
    };
  },
  mounted() {
    EventBus.$on("show-query-list", this.showQueryList);
  },
  beforeDestroy(){
    EventBus.$off("show-query-list", this.showQueryList);
  },
  computed: {},
  methods: {
    showQueryList(resultList) {
      var _this = this;
      resultList.forEach(function(val, index) {
        val.data.features.forEach(function(val2, index2) {
          for (const key in val2.properties) {
            if (val2.properties.hasOwnProperty(key)) {
              if (_this.isChina(key)) {
                delete val2.properties[key];
              }
            }
          }
        });
      });
      this.activeName = '0'
      this.data = resultList;
       $("tr").removeClass("heightLight");
    },
    isChina(str) {
      if (escape(str).indexOf("%u") < 0) {
        return true;
      } else {
        return false;
      }
    },
    hideQueryLists(){
      document.getElementById("scenceQueryList").style.width = 0 + 'px'
      this.isShow = false;
    },
    showQueryLists(){
      document.getElementById("scenceQueryList").style.width = 750 + 'px'
      this.isShow = true;
    },
    clickRow(data,$event){
      EventBus.$emit("showHighLightFeaturesOnMap", data);
      $("tr") .removeClass("heightLight");
      $($event.currentTarget).addClass("heightLight")
    },
    switchQueryList(tab, event){
      $("tr") .removeClass("heightLight");
      var features = this.data[Number(tab.index)].data.features;
      EventBus.$emit("switchQueryList", features);
    }
  }
};
</script>

<style lang="scss">
.scence-query-list {
  position: absolute;
  top: 50px;
  right: 10px;
  width: 619px;
  .el-tabs__content {
    max-height: 300px;
    overflow: auto;
    padding: 0;
  }
  .el-tabs__item {
    height: 32px;
    line-height: 32px;
    font-size: 12px;
  }
  table {
    font-size: 0.8rem;
    width: 100%;
    thead {
      background: #1569b2;
      color: #fff;
    }
    tr {
      height: 28px;
      line-height: 28px;
      border-bottom: 1px solid #efeded;
      cursor: pointer;
    }
    tr:nth-child(even) {
      background: #f1f1f1;
    }
    th {
      text-align: center;
      width: 205px;
    }
    td {
      text-align: center;
      cursor: pointer;
      padding: 5px;
      width: 203px;
    }
  }
  .handRight,.handLeft{
    position: absolute;
    left: -18px;
    top: 1px;
    z-index: 1000;
    color: #5099EA;
    background: #fff;
    padding: 2px;
    cursor: pointer;
  }
  .heightLight{
    background: #B2E2F7 !important;
    color: #fff;
  }
}
</style>

