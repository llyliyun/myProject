<template>
  <div class="detailCom">
    <div class="title">基本信息</div>
    <!-- <i @click="close" class="el-icon-circle-close detail-close" /> -->
    <!-- <el-radio-group
      v-model="messageText"
      class="ai-tab-change"
      fill="rgba(0,198,255,.3)"
      style="margin-top: 10px"
      @change="massageBtn"
    >
      <el-radio-button
        class="el-radio-button detail-radio-btn"
        label="project-overview"
      >
        项目概况
      </el-radio-button>
      <el-radio-button
        class="el-radio-button detail-radio-btn"
        label="project-progress"
      >
        项目进度
      </el-radio-button>
      <el-radio-button
        class="el-radio-button detail-radio-btn"
        label="year-profit"
      >
        批复材料
      </el-radio-button>
    </el-radio-group> -->
    <div
      class="xiangxi"
      v-if="messageText === 'project-overview'"
      v-loading="loading"
      element-loading-text="图片加载中，请稍后..."
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    >
      <el-image
        style="width: 100%; height: 20vh"
        :src="url"
        @click="handlehagh()"
      >
        <div slot="error">
          <img :src="Imgsrc" alt="" />
        </div>
      </el-image>
      <el-descriptions
        title="基础信息"
        :column="1"
        class="project-descriptions"
      >
        <el-descriptions-item label="项目名称">
          {{ overViewData.projectName }}
        </el-descriptions-item>
        <el-descriptions-item label="项目类型">
          {{ overViewData.flagName }}
        </el-descriptions-item>
        <el-descriptions-item label="建设性质">
          {{ overViewData.buildNatureName }}
        </el-descriptions-item>
        <el-descriptions-item label="总投资(万元)">
          {{ overViewData.totalInvest }}
        </el-descriptions-item>
        <el-descriptions-item label="年度投资(万元)">
          {{ overViewData.yearInvest }}
        </el-descriptions-item>
        <el-descriptions-item label="项目级别">
          {{ overViewData.flevelName }}
        </el-descriptions-item>
        <el-descriptions-item label="项目类别">
          {{ overViewData.ftypeName }}
        </el-descriptions-item>
        <el-descriptions-item label="项目归属">
          {{ overViewData.belongToName }}
        </el-descriptions-item>
        <el-descriptions-item label="起始年月">
          {{ overViewData.startTime }}
        </el-descriptions-item>
        <el-descriptions-item label="结束年月">
          {{ overViewData.endTime }}
        </el-descriptions-item>
        <el-descriptions-item label="拟开工时间">
          {{ overViewData.intendStartWorkYear }}
        </el-descriptions-item>
        <el-descriptions-item label="拟建成时间">
          {{ overViewData.intendBuiltedYear }}
        </el-descriptions-item>
        <el-descriptions-item
          :label="overViewData.flag == 'CZ' ? '建设单位' : '责任单位'"
        >
          {{ overViewData.busDepName }}
        </el-descriptions-item>
        <el-descriptions-item label="建设地点">
          {{ overViewData.buildSite }}
        </el-descriptions-item>
        <el-descriptions-item label="统一社会信用代码或组织机构代码">
          {{ overViewData.socialOrganCode }}
        </el-descriptions-item>
        <el-descriptions-item label="建设内容">
          {{ overViewData.buildContent }}
        </el-descriptions-item>
        <el-descriptions-item label="量化规模">
          {{ overViewData.buildScale }}
        </el-descriptions-item>
      </el-descriptions>
      <el-descriptions
        title="资金来源"
        :column="2"
        class="project-descriptions"
      >
        <el-descriptions-item label="财政安排(万元)">
          {{ overViewData.fundFinance }}
        </el-descriptions-item>
        <el-descriptions-item label="中省争取资金(万元)">
          {{ overViewData.fundWinover }}
        </el-descriptions-item>
        <el-descriptions-item label="自筹资金(万元)">
          {{ overViewData.fundSelfraise }}
        </el-descriptions-item>
        <el-descriptions-item label="涉农资金(万元)">
          {{ overViewData.fundFagro }}
        </el-descriptions-item>
        <el-descriptions-item label="诚投贷款(万元)">
          {{ overViewData.fundFudicloans }}
        </el-descriptions-item>
        <el-descriptions-item label="金控融资(万元)">
          {{ overViewData.fundFubon }}
        </el-descriptions-item>
        <el-descriptions-item label="资产运营公司资金(万元)">
          {{ overViewData.capitalAssetCompany }}
        </el-descriptions-item>
      </el-descriptions>
      <el-descriptions
        title="建设单位"
        :column="1"
        class="project-descriptions"
      >
        <el-descriptions-item label="项目负责人">
          <span v-for="(item, index) in overViewData.principal" :key="index"
            >{{ item.name }}-{{ item.tel }}</span
          >
        </el-descriptions-item>
        <el-descriptions-item label="现场负责人">
          <span v-for="(item, index) in overViewData.fieldOfficer" :key="index"
            >{{ item.name }}-{{ item.tel }}</span
          >
        </el-descriptions-item>
        <el-descriptions-item label="单位分管领导">
          <span v-for="(item, index) in overViewData.depLeader" :key="index"
            >{{ item.name }}-{{ item.tel }}</span
          >
        </el-descriptions-item>
        <el-descriptions-item label="单位主要领导">
          <span v-for="(item, index) in overViewData.depMainLeader" :key="index"
            >{{ item.name }}-{{ item.tel }}</span
          >
        </el-descriptions-item>
      </el-descriptions>
      <el-descriptions
        title="施工单位"
        :column="1"
        class="project-descriptions"
      >
        <el-descriptions-item label="施工单位">
          {{ overViewData.constructionUnit }}
        </el-descriptions-item>
        <el-descriptions-item label="项目经理">
          <span
            v-for="(item, index) in overViewData.projectManager"
            :key="index"
            >{{ item.name }}-{{ item.tel }}</span
          >
        </el-descriptions-item>
        <el-descriptions-item label="现场负责人">
          <span
            v-for="(item, index) in overViewData.constructionUnitPrincipal"
            :key="index"
            >{{ item.name }}-{{ item.tel }}</span
          >
        </el-descriptions-item>
      </el-descriptions>
      <el-descriptions
        title="监理单位"
        :column="1"
        class="project-descriptions"
      >
        <el-descriptions-item label="监理单位">
          {{ overViewData.supervisorUnit }}
        </el-descriptions-item>
        <el-descriptions-item label="总监">
          <span
            v-for="(item, index) in overViewData.chiefInspector"
            :key="index"
            >{{ item.name }}-{{ item.tel }}</span
          >
        </el-descriptions-item>
        <el-descriptions-item label="驻地监理">
          <span
            v-for="(item, index) in overViewData.residentSupervisor"
            :key="index"
            >{{ item.name }}-{{ item.tel }}</span
          >
        </el-descriptions-item>
      </el-descriptions>
      <el-descriptions
        title="设计单位"
        :column="1"
        class="project-descriptions"
      >
        <el-descriptions-item label="设计单位">
          {{ overViewData.designUnit }}
        </el-descriptions-item>
        <el-descriptions-item label="设计师">
          <span v-for="(item, index) in overViewData.designer" :key="index"
            >{{ item.name }}-{{ item.tel }}</span
          >
        </el-descriptions-item>
      </el-descriptions>
      <el-descriptions
        title="勘察单位"
        :column="1"
        class="project-descriptions"
      >
        <el-descriptions-item label="勘察单位">
          {{ overViewData.reconnaissanceUnit }}
        </el-descriptions-item>
        <el-descriptions-item label="项目总工">
          <span v-for="(item, index) in overViewData.projectMaster" :key="index"
            >{{ item.name }}-{{ item.tel }}</span
          >
        </el-descriptions-item>
      </el-descriptions>
      <el-descriptions title="备注" :column="1" class="project-descriptions">
        <el-descriptions-item label="备注">
          {{ overViewData.arrangedFundFinance }}
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <div class="xiangxi" v-if="messageText === 'project-progress'">
      <el-descriptions
        title="建设进度"
        :column="1"
        class="project-descriptions"
      >
        <el-descriptions-item label="建设进度">
          {{ descripData }}
        </el-descriptions-item>
      </el-descriptions>

      <el-descriptions
        title="完成投资"
        :column="1"
        class="project-descriptions"
      >
        <el-descriptions-item label="本月金额(万元)">
          {{ progressData.proDeclare.constDepOver || "" }}
        </el-descriptions-item>
        <el-descriptions-item label="原计划本月完成金额(万元)">
          {{ progressData.proDeclare.constDepOverTotal }}
        </el-descriptions-item>
        <el-descriptions-item label="累计完成金额(万元)">
          {{ progressData.proDeclare.constDepOver }}
        </el-descriptions-item>
        <el-descriptions-item label="原计划累计完成金额(万元)">
          {{ progressData.proDeclare.weekOffset }}
        </el-descriptions-item>
      </el-descriptions>
      <el-descriptions
        title="固投入统"
        :column="1"
        class="project-descriptions"
      >
        <el-descriptions-item label="本月金额(万元)">
          {{ progressData.proDeclare.fixedInvestSystem }}
        </el-descriptions-item>
        <el-descriptions-item label="累计金额(万元)">
          {{ progressData.proDeclareTotal.fixedInvestSystemTotal }}
        </el-descriptions-item>
      </el-descriptions>
      <el-descriptions
        title="财政拨款"
        :column="1"
        class="project-descriptions"
      >
        <el-descriptions-item label="本月金额(万元)">
          {{ progressData.proDeclare.fiscalAppropr }}
        </el-descriptions-item>
        <el-descriptions-item label="累计金额((万元)">
          {{ progressData.proDeclareTotal.fiscalApproprTotal }}
        </el-descriptions-item>
      </el-descriptions>
      <el-descriptions
        title="施工到账"
        :column="1"
        class="project-descriptions"
      >
        <el-descriptions-item label="本月金额(万元)">
          {{ progressData.proDeclare.buildDepPay }}
        </el-descriptions-item>
        <el-descriptions-item label="累计金额(万元)">
          {{ progressData.proDeclareTotal.buildDepPayTotal }}
        </el-descriptions-item>
      </el-descriptions>
      <el-descriptions
        title="形象进度描述"
        :column="1"
        class="project-descriptions"
      >
        <el-descriptions-item label="形象进度描述">
          {{ progressData.proDeclare.description }}
        </el-descriptions-item>
      </el-descriptions>
      <el-descriptions
        title="存在问题"
        :column="1"
        class="project-descriptions"
      >
        <el-descriptions-item label="存在问题">
          {{ progressData.proDeclare.issue }}
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="xiangxi" v-if="messageText === 'year-profit'">
      <el-table :data="tableData" size="small">
        <el-table-column label="序号" width="50">
          <template slot-scope="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column
          prop="nameOfApprovalItems"
          label="文件名称"
          show-overflow-tooltip
        >
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template slot-scope="scope">
            <span v-if="scope.row.uploadApprovalDocument == null"
              >暂无文件</span
            >
            <el-button
              v-else
              type="text"
              size="small"
              @click="handleClick(scope.row)"
              >查看</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      :visible.sync="showViewer"
      :width="width"
      :before-close="handleLoadImage"
      append-to-body
    >
      <div v-if="dialogtitle == 'flelt'" class="flelt_box">
        <div class="flelt_content">
          <h2>批复材料</h2>
          <el-table :data="filetData" size="small" style="width: 26vw">
            <el-table-column label="序号" width="50">
              <template slot-scope="scope">
                {{ scope.$index + 1 }}
              </template>
            </el-table-column>
            <el-table-column
              label="名称"
              prop="fname"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column label="操作" width="50">
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="small"
                  @click="handmaterials(scope.row)"
                  >查看</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div v-if="dialogtitle == 'images'">
        <div class="imgListDate" style="margin: 10px 0">
          <el-radio-group v-model="radio1" @change="imgListDate">
            <el-radio-button
              v-for="(item, index) in imgListDateList"
              :label="item.label"
              :key="index"
            ></el-radio-button>
          </el-radio-group>
        </div>
        <el-carousel height="80vh" width="100%" :autoplay="false" :loop="false">
          <el-carousel-item v-for="(item, index) in srcList" :key="index">
            <img :src="item.img" alt="" width="100%" height="100%" />
          </el-carousel-item>
        </el-carousel>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// 导入组件
import ElImageViewer from "element-ui/packages/image/src/image-viewer";
import { undownprojectUrl, baseIMgUrl } from "../request/updownurl.js";
import Imgsrc from "../assets/img/decision.jpg";
export default {
  components: { ElImageViewer },
  data() {
    return {
      width: "70%",
      Imgsrc: Imgsrc,
      imgListDateList: [],
      dialogtitle: "images",
      url: "",
      radio1: "",
      imgfliesList: [],
      screenwidth: "",
      loading: false,
      filetData: [],
      srcList: [
        "http://1.13.3.116:9000/profile/upload/2022/07/09/麟州街道4米以下巷道改造提升项目/JPEG_20220620_151448.jpg",
        "http://1.13.3.116:9000/profile/upload/2022/07/09/麟州街道4米以下巷道改造提升项目/JPEG_20220620_151448.jpg",
      ],
      messageText: "project-overview",
      overViewData: {}, //项目概况
      progressData: {}, //项目进度
      profitData: {}, //亩均收益
      descripData: "",
      Tagtype: "",
      tableData: [
        {
          date: "1",
        },
      ],
      showViewer: false,
      ImgDate: "2020-06",
    };
  },
  methods: {
    detailDatalist(menu) {
      this.overViewData = menu.overViewData;
      this.overViewData.principal = JSON.parse(menu.overViewData.principal);
      this.overViewData.fieldOfficer = JSON.parse(
        menu.overViewData.fieldOfficer
      );
      this.overViewData.designer = JSON.parse(menu.overViewData.designer);
      this.overViewData.projectMaster = JSON.parse(
        menu.overViewData.projectMaster
      );
      this.overViewData.depLeader = JSON.parse(menu.overViewData.depLeader);
      this.overViewData.depMainLeader = JSON.parse(
        menu.overViewData.depMainLeader
      );
      this.overViewData.projectManager = JSON.parse(
        menu.overViewData.projectManager
      );
      if (menu.overViewData.constructionUnitPrincipal) {
        this.overViewData.constructionUnitPrincipal = JSON.parse(
          menu.overViewData.constructionUnitPrincipal
        );
      }

      this.overViewData.chiefInspector = JSON.parse(
        menu.overViewData.chiefInspector
      );
      this.overViewData.residentSupervisor = JSON.parse(
        menu.overViewData.residentSupervisor
      );
    },
    detailDatalist2(menu) {
      this.progressData = menu.progressData;
    },
    detailDatalist3(menu) {
      this.tableData = menu.profitData;
    },
    detailDataImage(menu) {
      this.srcList = [];
      this.imgListDateList = [];
      this.url = "";
      if (menu.profitData.length > 0 && menu.profitData[0].picture) {
        this.loading = false;
        const profitData = menu.profitData[0].picture;
        this.url = undownprojectUrl + JSON.parse(profitData)[0].path;
        this.radio1 = menu.profitData[0].yearmonth;
        this.srcList.push({
          img: undownprojectUrl + JSON.parse(profitData)[0].path,
        });
        menu.profitData.forEach((item) => {
          this.imgListDateList.push({
            label: item.yearmonth,
          });
        });
        this.imgfliesList = menu.profitData;
      } else {
        this.$apiFun
          .csfMonitor({
            projectId: menu.id,
          })
          .then((res) => {
            const { code, rows } = res;
            if (code == 200) {
              const imgUrl = rows[0].imgs.split(",");
              this.url = baseIMgUrl + imgUrl[0];
              imgUrl.forEach((item) => {
                this.srcList.push({
                  img: baseIMgUrl + item,
                });
              });
              this.radio1 = "202207";
              this.imgListDateList.push({
                label: "202207",
              });
            }
          });
        this.loading = false;
      }

      setTimeout(() => {
        this.loading = false;
      }, 1000);
    },
    // 图片时间点击
    imgListDate(val) {
      this.srcList = [];
      let arr1 = this.imgfliesList.filter((item) => {
        if (item.yearmonth == val) {
          return item;
        }
      });
      let ImgflienList = JSON.parse(arr1[0].picture);
      ImgflienList.forEach((item) => {
        this.srcList.push({
          img: undownprojectUrl + item.path,
        });
      });
    },
    //建设状态
    detailDataState(menu) {
      var d = menu.profitData.state;
      switch (d) {
        case 0:
          this.descripData = "未开工";
          break;
        case 1:
          this.descripData = "开工";
          break;
        case 2:
          this.descripData = "完工";
          break;
        case 3:
          this.descripData = "停工";
          break;
      }
      // console.log(this.descripData);
    },
    handleLoadImage() {
      this.loading = false;
      this.showViewer = false;
    },
    //文件查看
    handleClick(row) {
      if (row.uploadApprovalDocument) {
        const profitList = JSON.parse(row.uploadApprovalDocument);
        if (profitList.length > 1) {
          this.width = "30%";
          this.dialogtitle = "flelt";
          this.showViewer = true;
          this.filetData = profitList;
        } else {
          window.open(undownprojectUrl + profitList[0].furl);
        }
      }
    },
    //材料查看
    handmaterials(row) {
      window.open(undownprojectUrl + row.furl);
    },
    handlehagh() {
      this.width = "70%";
      this.dialogtitle = "images";
      this.showViewer = true;
    },
    massageBtn(label) {
      this.messageText = label;
      if (label == "项目概况") {
        this.loading = true;
      }
    },
    close() {
      this.$emit("close");
    },
  },
};
</script>

<style lang="scss">
.detailCom{
  background: rgba(0,13,22,0.3);
  border: 1px solid #4B585E;
  margin-top: 20px;
  .title{
    background: url(/static/img/project/dabiao.png) no-repeat;
    background-size: 100% 100%;
    padding-left: 10px;
    font-size: 22px;
  }
}
.detail-radio-btn {
  margin-left: 12px;
  border: 1px solid #00d2ff !important;
}
.imgListDate {
  display: flex;
  padding: 16;
}
.detail-radio-btn:first-child {
  margin-left: 0px;
}
.ImgTitle {
  position: fixed;
  padding: 6px 10px;
  z-index: 3000;
  left: 40%;
  top: 20vh;
  background: #fff;
}
.xiangxi {
  margin-top: 20px;
  max-height: 40vh;
  overflow-y: auto;
  // background: url(/static/img/kuang2.a0357f5.png) no-repeat;
  // background-size: 100% 100%;
  // background-color: rgba(0, 0, 0, 0.1);
  // background-color: #5e5e4d73;
  padding: 16px 10px;
}
.flelt_box {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  text-align: center;
  align-items: center;
  height: 100%;
}
.flelt_content {
  h2 {
    width: 100%;
    line-height: 36px;
    color: #fff;
  }
}
.flelt_content .el-table {
  background-color: rgba(0, 0, 0, 0);
  color: #fff;
  margin: 20px 16px;
}
.flelt_content
  .el-table--enable-row-hover
  .el-table__body
  tr:hover
  > td.el-table__cell {
  background-color: rgba(12, 64, 107, 0.4);
  color: #fff;
}
.flelt_content .el-table th {
  background-color: rgba(12, 64, 107, 0.63);
  color: #fff;
}
.flelt_content .el-table tr {
  background-color: rgba(0, 0, 0, 0);
  border: 0;
}
.el-table th {
  border-bottom: 1px solid rgba(6, 70, 100, 0.7);
}
.detail-close {
  font-size: 24px;
  float: right;
  color: #00d2ff;
}
.xiangxi .el-descriptions__header {
  color: rgb(70, 240, 255);
}
.xiangxi .el-descriptions__body {
  background-color: transparent;
  color: #f5f5f5;
}
.xiangxi .el-descriptions-item__label {
    color: #CCF3FF;
}
.el-image-viewer__canvas img {
  max-width: 200px;
}
.el-dialog {
  margin-top: 16px !important;
  background: rgba(11, 38, 73, 1) !important;
}
.el-dialog .title {
  color: #fff;
  font-size: 20px;
}
.el-dialog .el-dialog__header {
  display: none;
}
.el-dialog .el-dialog__body {
  padding: 0 20px 20px 20px;
  color: #fff;
}
</style>
