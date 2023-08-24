<!--
 * @Description: 登录页面
 * @Author: wangjiayu
 * @Date: 2022-03-12 11:04:38
 * @LastEditors: wangjiayu
 * @LastEditTime: 2022-03-22 14:10:48
-->
<template>
  <div class="login-wrapper">
    <div class="login-welcome">欢迎登录</div>
    <div class="login-title">
      <!-- <span class="login-title-img"></span> -->
      <div class="login-title-text">
        {{ title }}
      </div>
    </div>
    <div class="main-container">
      <div class="login-left-img"></div>
      <div class="login-container">
        <div class="box">
          <span class="login-container-title">账号登录</span>
          <el-form
            :model="loginForm"
            :rules="rules"
            ref="loginForm"
            label-width="100px"
            size="medium "
            class="demo-ruleForm"
          >
            <el-form-item prop="loginName">
              <el-input
                v-model="loginForm.loginName"
                placeholder="请输入您的账号"
              >
                <template slot="prepend">
                  <i class="el-icon-user el-icon"></i>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item prop="loginPassword">
              <el-input
                v-model="loginForm.loginPassword"
                placeholder="请输入您的密码"
                type="password"
              >
                <template slot="prepend">
                  <i class="el-icon-lock el-icon"></i>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item prop="code" class="verification">
              <el-input
                v-model="loginForm.code"
                style="width: 60%"
                autocomplete="off"
                placeholder="请输入验证码"
              >
                <template slot="prepend">
                  <i class="el-icon-document-copy el-icon"></i>
                </template>
              </el-input>
              <img
                :src="captchaImg"
                alt=""
                class="captchaImg"
                @click="captchaImgData"
              />
            </el-form-item>
            <el-form-item size="large">
              <el-button
                type="primary"
                @click="handleLogin"
                class="login-button"
                >登录</el-button
              >
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import config from "@/config";
// import Vue from 'vue';
// import { randomImage } from "@/apis/security/sys";
import { mapActions } from "vuex";

export default {
  name: "Login",
  data() {
    return {
      title: "自然保护监测监管领导驾驶舱",
      loginForm: {
        loginName: "",
        loginPassword: "",
        code: "",
      },
      rules: {
        loginName: [
          {
            required: true,
            message: "请输入您的账号",
          },
        ],
        loginPassword: [
          {
            required: true,
            message: "请输入您的密码",
          },
        ],
        code: [
          {
            required: true,
            message: "请输入验证码",
          },
        ],
      },
      loading: false,
      // 验证码开关
      captchaOnOff: true,
      captchaImg: "",
      // 注册开关
      register: false,
      redirect: undefined,
      checkKey: "",
    };
  },
  created() {
    this.getCode();
  },
  methods: {
    getCode() {
      const vm = this;
      this.checkKey = new Date().getTime();
      vm.$apiFun.randomImage(this.checkKey).then((res) => {
        if (res) {
          vm.captchaImg = res.data;
        }
      });
    },
    captchaImgData() {
      this.getCode();
    },
    handleLogin() {
      // 调用登录接口前先验证登录信息
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          const { loginName, loginPassword, code } = this.loginForm;
          const info = {
            username: loginName,
            password: loginPassword,
            checkKey: this.checkKey,
            captcha: code,
          };
          this.$apiFun
            .sysLogin(JSON.stringify(info))
            .then((res) => {
              const { code } = res;
              const { token, msg, userInfo } = res.data;
              console.log(res);
              if (code == 0) {
                this.loading = false;
                sessionStorage.setItem("token", token);
                sessionStorage.setItem("userInfo", JSON.stringify(userInfo));
                this.$emit("login");
                this.$router.push({
                  path: "/",
                });
              }
            })
            .catch((error) => {
              const _this = this;
              _this.$message.error("账号或验证码、密码错误，请重试");
              _this.loading = false;
            });
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
/* #3cd9aa: #3cd9aa; */

.login-wrapper {
  background: url("../../assets/img/image_bg.png") no-repeat center/100% 100%;
  width: 100vw;
  height: 100vh;

  *::selection {
    background-color: #3cd9aa;
  }

  .login-welcome {
    color: #fff;
    font-size: 40px;
    line-height: 88px;
    display: flex;
    position: absolute;
    z-index: 9;
    top: 147px;
    left: 262px;
  }

  .login-title {
    display: flex;
    position: absolute;
    z-index: 9;
    top: 240px;
    left: 316px;

    &-img {
      background: url("../../assets/img/logo.png") no-repeat center/100% 100%;
      width: 111px;
      height: 105px;
    }

    &-text {
      color: #fff;
      font-size: 40px;
      line-height: 88px;
    }
  }

  .main-container {
    position: absolute;
    left: 5%;
    top: 10%;
    width: 90%;
    height: 80%;
  }

  .login-left-img {
    /* position: absolute;
     left: 5%;
    top: 10%; */
    float: left;
    width: 55%;
    height: 100%;
    text-align: center;
    background: url("../../assets/img/image_left.png") no-repeat center/100%
      100%;
  }

  .login-container {
    /* position: absolute; */
    /* right: 280px; */
    /* top: 210px; */
    text-align: center;
    float: left;
    width: 44%;
    height: 100%;
    background: #ffffff;

    .box {
      padding: 24% 16%;

      .login-container-title {
        font-size: 24px;
        font-weight: 400;
        color: #333333;
        line-height: 22px;
        margin-bottom: 45px;
        display: inline-block;
      }

      .demo-ruleForm {
        text-align: left;

        .verification {
          position: relative;
        }

        .captchaImg {
          position: absolute;
          width: 40%;
          border: 1px solid #aaa;
          margin-left: 5px;
        }
      }

      .login-button {
        margin-top: 10px;
        width: 100%;
        height: 51px;
        font-size: 22px;
        text-align: center;
        border-radius: 4px;
        background-color: #3cd9aa;
        border-color: #3cd9aa;
      }
    }
  }
}

/deep/.el-icon {
  font-size: 24px;
  color: #fff;
}
</style>
<style>
.demo-ruleForm .el-input-group__prepend {
  background: #3cd9aa;
}

.demo-ruleForm .el-input--medium .el-input__inner {
  line-height: 56px;
  height: 56px;
}

.demo-ruleForm .el-input-group {
  width: 22vw;
}
</style>
