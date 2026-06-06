<template>
  <div class="steps">
    <div
      v-for="(step, i) in steps"
      :key="step.no"
      class="step card"
      :class="{ active: current === i, done: current > i }"
    >
      <div class="no">
        <span v-if="current > i">✓</span>
        <span v-else>{{ step.no }}</span>
      </div>
      <div class="info">
        <div class="t">{{ step.title }}</div>
        <div class="d">{{ step.desc }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ current: { type: Number, default: 0 } });

const steps = [
  { no: '01', title: '图片上传', desc: '上传需要优化的商品主图' },
  { no: '02', title: 'AI 诊断', desc: '分析卖点、文案、视觉和点击率问题' },
  { no: '03', title: '优化生成', desc: '选择方向，生成方案和新图片' },
];
</script>

<style scoped>
.steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}
.step {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  opacity: 0.55;
  transition: all 0.25s ease;
}
.step.active {
  opacity: 1;
  border-color: var(--card-border-hover);
  box-shadow: var(--brand-glow);
}
.step.done {
  opacity: 0.9;
}
.no {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--card-border);
}
.step.active .no,
.step.done .no {
  background: var(--brand-gradient);
  color: #fff;
  border: none;
}
.t {
  font-weight: 600;
  font-size: 15px;
}
.d {
  font-size: 12px;
  color: var(--text-2);
  margin-top: 2px;
}
</style>
