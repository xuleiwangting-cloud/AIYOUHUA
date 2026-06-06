<template>
  <div class="directions">
    <div class="section-title">🎯 选择优化方向</div>
    <div class="cards">
      <div
        v-for="d in directions"
        :key="d.value"
        class="dir card"
        :class="{ selected: modelValue === d.value, disabled }"
        @click="select(d.value)"
      >
        <div class="check" v-if="modelValue === d.value">✓</div>
        <div class="dir-title">{{ d.title }}</div>
        <p class="dir-desc">{{ d.desc }}</p>
      </div>
    </div>
    <p v-if="disabled" class="hint text-2">请先完成 AI 诊断后再选择优化方向</p>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(['update:modelValue']);

const directions = [
  { value: 'copy', title: '优化文案', desc: '保留原图画面，仅优化标题、卖点和表达方式，让用户更快看懂利益点。' },
  { value: 'visual', title: '优化视觉', desc: '保留核心文案和商品信息，重新设计画面场景、构图、光影和氛围。' },
  { value: 'both', title: '文案视觉均优化', desc: '同时重写卖点文案并重新设计画面，适合原图整体点击力较弱的情况。' },
];

function select(v) {
  emit('update:modelValue', v);
}
</script>

<style scoped>
.directions {
  margin-top: 8px;
}
.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.dir {
  padding: 20px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}
.dir:hover:not(.disabled) {
  border-color: var(--card-border-hover);
}
.dir.selected {
  border-color: transparent;
  background: linear-gradient(var(--card-bg-solid), var(--card-bg-solid)) padding-box,
    var(--brand-gradient) border-box;
  border: 1.5px solid transparent;
  box-shadow: var(--brand-glow);
}
.dir.disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.check {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--brand-gradient);
  color: #fff;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dir-title {
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 8px;
}
.dir-desc {
  font-size: 13px;
  color: var(--text-2);
}
.hint {
  font-size: 13px;
  margin-top: 12px;
}
</style>
