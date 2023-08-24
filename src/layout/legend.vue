<template>
  <div>
    <ul class="lenght_list">
      <p class="lenght_title">图例</p>
      <li v-for="(item, index) in lenghtData" :key="index">
        <img :src="item.img" alt="" />
        <p>{{ item.name }}</p>
      </li>
    </ul>
  </div>
</template>

<script>
import lvdun2 from "@/img/lvdun2.png";
import lvdun3 from "@/img/lvdun3.png";
import lvdun4 from "@/img/lvdun4.png";
export default {
  data() {
    return {
      lenghtData: [
        {
          name: "续建项目",
          img: lvdun2,
        },
        {
          name: "新建项目",
          img: lvdun3,
        },
        {
          name: "前期项目",
          img: lvdun4,
        },
      ],
    };
  },
};
</script>






<style lang="scss" scoped>
.lenght_list {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid #01ffb4;
  left: 0vw;
  bottom: 0vh;
  .lenght_title {
    text-indent: 1em;
    color: #fff;
    font-size: 20px;
    text-align: left;
  }
  li {
    display: flex;
    padding: 6px 20px;
    line-height: 30px;
  }
}
</style>