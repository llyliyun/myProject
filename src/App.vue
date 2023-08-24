<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
// import layout from "./layout/layout";
// import login from "./views/login/index";
export default {
  name: "App",
  data() {
    return {
      login: false,
    };
  },
  watch: {},

  mounted() {
   
  },
  methods: {
    loginShow() {
      this.login = true;
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #fff;
}

ul,
li {
  list-style: none;
}
.my-div-icon p {
  font-size: 20px;
  color: #fff;
}
/*修改滚动条样式*/

section::-webkit-scrollbar,
div::-webkit-scrollbar {
  width: 4px;
  height: 4px;
  /**/
}

section::-webkit-scrollbar-track,
div::-webkit-scrollbar-track {
  background: #bfbfbf;
  border-radius: 2px;
}

section::-webkit-scrollbar-thumb,
div::-webkit-scrollbar-thumb {
  background: rgba(14, 85, 107, 0.6);
  border-radius: 2px;
}

section::-webkit-scrollbar-thumb:hover,
div::-webkit-scrollbar-thumb:hover {
  background: #333;
}

section::-webkit-scrollbar-corner,
div::-webkit-scrollbar-corner {
  background: #179a16;
}
</style>
