<template>
  <div class="scheme card" :class="{ selected: scheme.selected }">
    <div class="head">
      <div class="title-row">
        <span class="idx">{{ index + 1 }}</span>
        <h4 class="title">{{ scheme.title }}</h4>
      </div>
      <label class="checkbox">
        <input type="checkbox" :checked="scheme.selected" @change="$emit('toggle')" />
        <span>选择</span>
      </label>
    </div>

    <p class="meta"><b>原图问题：</b>{{ scheme.target_problem }}</p>
    <p class="meta"><b>优化方向：</b>{{ scheme.strategy }}</p>

    <div class="prompt-box">
      <div class="prompt-head">
        <span>生图提示词</span>
        <div class="prompt-actions">
          <template v-if="!scheme.editing">
            <button class="link-btn" @click="$emit('edit')">编辑</button>
          </template>
          <template v-else>
            <button class="link-btn" @click="$emit('save')">保存</button>
            <button class="link-btn" @click="$emit('cancel')">取消</button>
            <button class="link-btn" @click="$emit('reset')">恢复原始</button>
          </template>
        </div>
      </div>
      <pre v-if="!scheme.editing" class="prompt-text">{{ scheme.image_prompt }}</pre>
      <textarea
        v-else
        class="prompt-edit"
        :value="scheme.image_prompt"
        @input="$emit('input', $event.target.value)"
        rows="8"
      ></textarea>
    </div>
  </div>
</template>

<script setup>
defineProps({
  scheme: { type: Object, required: true },
  index: { type: Number, required: true },
});
defineEmits(['toggle', 'edit', 'save', 'cancel', 'reset', 'input']);
</script>

<style scoped>
.scheme {
  padding: 18px;
  transition: all 0.2s ease;
}
.scheme.selected {
  border-color: transparent;
  background: linear-gradient(var(--card-bg-solid), var(--card-bg-solid)) padding-box,
    var(--brand-gradient) border-box;
  border: 1.5px solid transparent;
  box-shadow: var(--brand-glow);
}
.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.idx {
  width: 24px;
  height: 24px;
  border-radius: 7px;
  background: var(--brand-gradient);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.title {
  font-size: 15px;
  font-weight: 700;
}
.checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-2);
  cursor: pointer;
}
.checkbox input {
  accent-color: var(--brand);
  width: 16px;
  height: 16px;
  cursor: pointer;
}
.meta {
  font-size: 13px;
  color: var(--text-2);
  margin-bottom: 6px;
}
.meta b {
  color: var(--text-3);
  font-weight: 500;
}
.prompt-box {
  margin-top: 12px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-sm);
  padding: 12px;
}
.prompt-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--text-3);
  margin-bottom: 8px;
}
.prompt-actions {
  display: flex;
  gap: 12px;
}
.link-btn {
  color: var(--brand);
  font-size: 12px;
}
.prompt-text {
  font-size: 12px;
  color: var(--text-2);
  white-space: pre-wrap;
  word-break: break-all;
  font-family: inherit;
  line-height: 1.7;
}
.prompt-edit {
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  color: var(--text-1);
  padding: 10px;
  font-size: 12px;
  line-height: 1.7;
  resize: vertical;
}
.prompt-edit:focus {
  outline: none;
  border-color: var(--brand);
}
</style>
