<template>
  <div class="diagnose card">
    <div class="head">
      <div class="section-title">🔍 AI 诊断结果</div>
      <div class="score">
        <span class="score-num">{{ result.score }}</span>
        <span class="score-label">点击率潜力分</span>
      </div>
    </div>

    <div class="product">
      <span class="tag">{{ result.product_name }}</span>
      <span class="cat text-2">{{ result.category }}</span>
    </div>

    <div class="grid">
      <section class="block">
        <h4>产品核心卖点</h4>
        <div class="chips">
          <span v-for="p in result.core_selling_points" :key="p" class="chip">{{ p }}</span>
        </div>
      </section>

      <section class="block">
        <h4>画面文案内容</h4>
        <ul class="kv">
          <li><b>主标题</b>{{ result.image_copy.main_title }}</li>
          <li><b>品牌</b>{{ result.image_copy.brand }}</li>
          <li><b>参数</b>{{ result.image_copy.parameters.join('、') }}</li>
          <li><b>背书</b>{{ result.image_copy.trust_text }}</li>
        </ul>
      </section>

      <section class="block">
        <h4>视觉呈现分析</h4>
        <ul class="kv">
          <li><b>构图</b>{{ result.visual_analysis.composition }}</li>
          <li><b>色彩</b>{{ result.visual_analysis.color }}</li>
          <li><b>光影</b>{{ result.visual_analysis.lighting }}</li>
          <li><b>排版</b>{{ result.visual_analysis.layout }}</li>
          <li><b>氛围</b>{{ result.visual_analysis.atmosphere }}</li>
        </ul>
      </section>

      <section class="block problems">
        <h4>点击率问题点</h4>
        <ul class="problem-list">
          <li v-for="(p, i) in result.ctr_problems" :key="i">⚠ {{ p }}</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
defineProps({ result: { type: Object, required: true } });
</script>

<style scoped>
.diagnose {
  padding: 24px;
}
.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.score {
  text-align: center;
}
.score-num {
  font-size: 30px;
  font-weight: 800;
  background: var(--brand-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.score-label {
  display: block;
  font-size: 11px;
  color: var(--text-3);
}
.product {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 8px 0 20px;
}
.tag {
  background: rgba(255, 77, 151, 0.15);
  border: 1px solid rgba(255, 77, 151, 0.35);
  padding: 4px 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
}
.cat {
  font-size: 13px;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}
.block {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-sm);
  padding: 16px;
}
.block h4 {
  font-size: 14px;
  margin-bottom: 12px;
  color: var(--text-1);
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  background: rgba(177, 77, 255, 0.12);
  border: 1px solid rgba(177, 77, 255, 0.3);
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
}
.kv {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
  color: var(--text-2);
}
.kv b {
  display: inline-block;
  min-width: 52px;
  color: var(--text-3);
  font-weight: 500;
}
.problems {
  border-color: rgba(255, 84, 112, 0.3);
}
.problem-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
  color: #ffb3bf;
}
</style>
