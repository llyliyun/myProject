<template>
  <div class="minutes">
    <div class="minutes_conter">
      <p class="file_btn" @click="fileclick">单位检索</p>
      <div v-if="minutesShow" class="minutes_input">
        <el-autocomplete
          style="width: 19vw"
          class="inline-input"
          v-model="projectName"
          :fetch-suggestions="querySearch"
          placeholder="请输入内容"
          @select="handleSelect"
        >
          <template v-if="length >= 0" slot="append">{{ length }}</template>
        </el-autocomplete>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      restaurants: [],
      projectName: "",
      minutesShow: false,
      length: -1,
      fyear: "2022",
    };
  },
  mounted() {
    this.init();
    this.$bus.$on("clearenminutes", () => {
      this.minutesShow = false;
      this.projectName = "";
    });
    this.$bus.$on("Organizat", (val) => {
      this.fyear = val;
      this.init();
    });
  },
  destroyed() {
    this.$bus.$off("clearenminutes");
    this.$bus.$off("Organizat");
  },
  watch: {
    projectName: {
      handler: function (newVal, oldVal) {
        if (newVal == "") {
          this.length = -1;
          this.$bus.$emit("clearbuildNoName");
        }
      },
      deep: true, //为true，表示深度监听，这时候就能监测到a值变化
    },
  },
  methods: {
    init() {
      this.$apiFun.getOrganizationList({ fyear: this.fyear }).then((res) => {
        const { code, data } = res;
        if (code === 200) {
          this.restaurants = [];
          data.forEach((item) => {
            this.restaurants.push({
              value: item.busDepName,
              length: item.value,
            });
          });
        }
      });
    },
    fileclick() {
      this.minutesShow = !this.minutesShow;
      this.$bus.$emit("clearenfile");
      this.$bus.$emit("clearent");
    },
    querySearch(queryString, cb) {
      var restaurants = this.restaurants;
      var results = queryString
        ? restaurants.filter(this.createFilter(queryString))
        : restaurants;
      // 调用 callback 返回建议列表的数据
      cb(results);
    },
    createFilter(queryString) {
      return (restaurant) => {
        return (
          restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) ===
          0
        );
      };
    },
    handleSelect(item) {
      this.length = item.length;
      this.$emit("buildNature", item.value);
    },
  },
};
</script>

<style scoped lang="scss">
.minutes {
  position: fixed;
  top: 1rem;
  right: 11vw;

  .file_btn {
    font-size: 14px;
    width: 1.025rem;
    height: 0.375rem;
    display: inline-block;
    margin-right: 0.225rem;
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
  .minutes_conter {
    position: relative;
    .minutes_input {
      position: absolute;
      top: 40px;
      left: -5.5vw;
    }
  }
}
</style>
<style>
.minutes .el-input__inner {
  background-color: rgba(12, 41, 59, 0.8);
  border: #1d4470 solid 1px;
  color: #fff;
}
.el-popper {
  background-color: rgba(12, 41, 59, 0.8) !important;
}
.el-autocomplete-suggestion li {
  color: rgb(218, 218, 218) !important;
}
.el-autocomplete-suggestion li:hover {
  background-color: rgba(12, 41, 59, 1) !important;
}
.minutes .el-input-group__append {
  background-color: #1d4470;
  color: #fff;
  border: 1px solid #247ee4;
}
</style>