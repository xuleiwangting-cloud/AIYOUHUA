<template>
  <div class="soon">
    <div class="card box">
      <div class="icon">🚧</div>
      <h2 class="title">简单诊断</h2>
      <p class="text-2">该功能即将开放：上传一张图后快速给出 100 分评分、优点、问题与修改建议。</p>
      <router-link to="/optimizer" class="btn-primary go">先去点击率优化</router-link>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.soon {
  display: flex;
  justify-content: center;
  padding-top: 60px;
}
.box {
  text-align: center;
  padding: 50px 40px;
  max-width: 520px;
}
.icon {
  font-size: 46px;
}
.title {
  font-size: 22px;
  font-weight: 700;
  margin: 14px 0 10px;
}
.go {
  display: inline-block;
  margin-top: 22px;
}
</style>
