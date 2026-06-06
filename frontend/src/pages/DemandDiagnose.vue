<template>
  <div class="soon">
    <div class="card box">
      <div class="icon">🚧</div>
      <h2 class="title">需求诊断</h2>
      <p class="text-2">该功能即将开放：输入你的运营目标，AI 判断图片是否满足需求并给出建议。</p>
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
