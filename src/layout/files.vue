<template>
  <div class="file-box">
    <p class="file_btn" @click="fileclick">文件检索</p>
    <div class="file_list" v-if="fileShow">
      <div>
        <el-input
          placeholder="请输入内容"
          v-model="input3"
          class="input-with-select"
        >
          <el-button
            slot="append"
            width="100px"
            icon="el-icon-search"
            @click="seachartlist()"
          ></el-button>
        </el-input>
      </div>

      <el-table
        :data="selectlist"
        style="width: 100%"
        v-if="!seachartShow"
        height="60vh"
      >
        <el-table-column label="序号" width="50">
          <template slot-scope="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="fname" label="名称"> </el-table-column>
        <el-table-column label="操作" width="80">
          <template slot-scope="scope">
            <i
              class="el-icon-download"
              style="color: #0a98af; cursor: pointer"
              @click="getdownload(scope.row)"
              >下载</i
            >
          </template>
        </el-table-column>
      </el-table>

      <el-tree
        :props="defaultProps"
        :load="loadNode"
        lazy
        v-if="seachartShow"
        :filter-node-method="filterNode"
        :accordion="true"
        @check-change="handleCheckChange"
      >
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span v-if="data.ftype == 'folder'"
            ><i class="el-icon-folder"></i
          ></span>
          <span v-else><i class="el-icon-document"></i></span>
          <span class="datle_tit">{{ node.label }}</span>
          <span v-if="data.ftype != 'folder'">
            <el-button type="text" size="mini" @click="getdownload(data)">
              下载
            </el-button>
          </span>
        </span>
      </el-tree>
    </div>
  </div>
</template>

<script>
import {undownprojectUrl} from "../request/updownurl.js";
export default {
  data() {
    return {
      fileShow: false,
      seachartShow: true,
      treeData: [],
      selectlist: [],
      select: "",
      input3: "",
      defaultProps: {
        children: "children",
        id: "",
        label: "fname",
      },
    };
  },
  mounted() {
    this.$bus.$on("clearent", () => {
      this.fileShow = false;
    });
  },
  watch: {
    input3: {
      handler(val) {
        if (val == "") {
          const node = {
            level: 0,
          };
          this.loadNode(node, []);
          this.seachartShow = true;
        }
      },
      deep: true,
    },
  },
  methods: {
    //树桩接口请求
    loadNode(node, resolve) {
      if (node.level == 0) {
        this.$apiFun
          .getFiles({
            pageIndex: 1,
            pageSize: 0,
            pid: 0,
          })
          .then((res) => {
            resolve(res.data.list);
          });
      } else {
        this.$apiFun
          .getFiles({
            pageIndex: 1,
            pageSize: 0,
            pid: node.data.id,
          })
          .then((res) => {
            resolve(res.data.list);
          });
      }
    },
    //name 搜索查询
    seachartlist() {
      this.$apiFun
        .getFileLikeList({
          pageIndex: 1,
          pageSize: 0,
          fname: this.input3,
        })
        .then((res) => {
          this.selectlist = res.data.list;
          if (res.data.list.length > 0) {
            this.seachartShow = false;
          } else {
            this.seachartShow = true;
          }
        });
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    fileclick() {
      this.fileShow = !this.fileShow;
      this.$bus.$emit("clearentool");
      this.$bus.$emit("clearenminutes");
    },
    handleCheckChange(data, checked, indeterminate) {
      console.log(data, checked, indeterminate);
    },
    getdownload(data) {
      window.open(undownprojectUrl + data.furl);
    },
  },
};
</script>

<style scoped lang="scss">
.file-box {
  position: fixed;
  top: 1rem;
  right: 7vw;
  .file_btn {
    font-size: 14px;
    display: inline-block;
    padding: 0 10px;
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFMAAAAgCAYAAABuBERvAAAEWklEQVRoQ+2aTWxUVRTHz7n3fcw3bWcYK5m2RFiAWGorwbjRmJQaJW6MoRRL8SMBaUCMcamJ1Ji4cGM0kQ8bUmncEQ0xQUwEFmwMwYhQoHTSYjtMIGM7nY/Xmffm3XvNm2ZGplrTTF+Ng++u3mLumXt+539ucs85CM6yjQDaZskxBGWYuzNcIENADmDqAD5FO+fL/PaJxHIjQL0RIQSvJV4cEQnnjBtmgvu9W1Nq5D2dqY9RxQYvBAAQAE4BBIHpYS+GLKsVMDkv3OWCZ8BAN5Fz56l29wuXpo3pLvdDBMAyUVNLcMYZEzPULbeZ7qZ3mVA2IRHGMp1AgSJHEUOI8mpAAif9WORYhtmbLqQvvt1/M3Urqin1dbIWi+va1J28MAocCa3Z60CwgqAuNwlsXO911dfJhaxmAs47X81CIJBPJQtdZ06dcEsN71OhNg3Vo6cC5ivJfOx057OjmVvRudKfKP6ARFwKEaZZc6os+YCyDObcHDezGqsG3mJ7Xpq4POCSgkdk5ukYCi5Q5q6Ekb6wv+9a/OyP00rAT0GSqo6enYf+r9myoOgzSfPF6E+fudWmQYVJkeGFMPfMpL7+9oXtjeno7Zzs9RAUAgVizSpypYJgcdGTs4XukfMDAX/zPp37/V8FsbsizfdNXt3y5RPbD1OPi6zUQR4EuxZMI62Zvb+cObgRlEYX9SXeaWqKVsB8M3olfKS9c1ANBWXBuaPIRSJfhJmdM1++9EP/0wWTHtzQNlG+n0sfe29f7zj+eOeAvMpHHwQFrZQPJWXu+PXsoTZGQo2Mx19f3zpVmebj19qOdXR95MD85zCUYPZc+f6tVpMEw7J0543mDXEHZhXydWBWAW2xLQ5MB6aNBGw05SjTgWkjARtNOcp0YNpIwEZTjjL/bZjOc3JpxO9/Tm5hJBTJavGe1q2Vz8kDkz+v+XzTc0edQscSnpNZzey9dLp/nVKnPBpZN7EDsVh4LheA907daD3evu1jq5a5tBj9P381XzXSzD2XTx0I+1pCCfLwvRNBrFRmX3J28Juu59dmJ6byDtDFhVIqDu8cOXd4lSfyqkkD3sF6+lqFMncljJkL+/tuFtsW/oCEEnEq7X/DtATTalt41MgxmcnNw0EsZnM5zXum87Hvtj0zmhkbLzfUbElkJICKPH91cFGbRWeCSJAAy+fKswNWQ02lwaMK97T/paHWmzLSOf3eTgBjDJikECTLujs5AgLnjJhZHZjJGCLKy2ix2hLYKoxwJGidH5jEiOpy6YrqYTybUqnnSVUJfyAxtWWoAd0VytydZoLxwjgAmwWCEvDqe8tFESIQSfD8I1r8Q1XPTxBCKGPWDERtLQ6IEkcNkbknG9YcmhbuzQDCkCUaJqi0WKMdJwMLWr33j8f8mfzVO251kWQi8pu1WLcvl7mOhFJkrOZgmgDWDEYWgdeN1q/9NGZ4nkKCiiSXx2N+H/bi6gplVo/N2Vki4Awa2KiFPwC3hVs/eMyecwAAAABJRU5ErkJggg==)
      no-repeat;
    background-size: 100% 100%;
    background-color: #1d4470;
    text-align: center;
    line-height: 0.375rem;
    color: #b0f1ff;
    font-weight: 400;
    font-family: ShiShangZhongHeiJianTi;
  }
  .custom-tree-node {
    .datle_tit {
      width: 12vw;
      white-space: nowrap;
      overflow: hidden;
      display: inline-block;
      text-overflow: ellipsis; // 显示省略号
    }
  }
  .file_list {
    position: absolute;
    right: -5vw;
    max-height: 66vh;
    overflow-y: auto;
    top: 0.6875rem;
    color: #fff;
    padding: 10px;
    width: 19vw;
    background-image: url("../img/kuang2.png");
    background-size: 100% 100%;
    background-color: rgba(32, 54, 41, 0.5);
  }
}
</style>
<style >
.file_list .el-tree,
.file_list .el-table,
.file_list .el-table tr,
.file_list .el-table th.el-table__cell {
  background-color: rgba(32, 54, 41, 0);
  color: #fff;
}
.file_list
  .el-table--enable-row-hover
  .el-table__body
  tr:hover
  > td.el-table__cell {
  background-color: rgba(32, 54, 41, 0.8);
}
.file_list .el-input--suffix {
  width: 120px;
}
.el-select-dropdown {
  background-color: rgba(32, 54, 41, 0.6) !important;
  color: #fff;
}
.el-select-dropdown__item {
  color: #fff;
}
.file_list .el-input-group__append {
  background-color: #1d4470;
  color: #fff;
}
.file_list .el-input-group__prepend,
.file_list .el-input__inner {
  background-color: rgb(32, 42, 54);
  color: #fff;
}
.el-select-dropdown__item.hover,
.el-select-dropdown__item:hover {
  background-color: rgba(32, 54, 41, 0.8) !important;
}
.file_list .el-tree-node__content:hover,
.file_list .el-upload-list__item:hover,
.file_list .el-tree-node:focus > .el-tree-node__content {
  background-color: rgba(32, 54, 41, 0.8);
  color: #fff;
}
</style>

