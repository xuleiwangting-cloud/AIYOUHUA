<template>
  <div class="gen-bar card">
    <div class="params">
      <div class="param">
        <span class="p-label">风格</span>
        <select v-model="local.style">
          <option v-for="s in styleOptions" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
      <div class="param">
        <span class="p-label">模型</span>
        <select v-model="local.image_model">
          <option v-for="m in imageModelOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
        </select>
      </div>
      <div class="param">
        <span class="p-label">比例</span>
        <select v-model="local.ratio">
          <option v-for="r in ratioOptions" :key="r" :value="r">{{ r }}</option>
        </select>
      </div>
      <div class="param">
        <span class="p-label">清晰度</span>
        <select v-model="local.quality">
          <option v-for="q in qualityOptions" :key="q" :value="q">{{ q }}</option>
        </select>
      </div>
    </div>

    <div class="right">
      <span v-if="selectedCount" class="count text-2">已选 {{ selectedCount }} 个方案</span>
      <button class="btn-primary" :disabled="disabled || generating" @click="$emit('generate', { ...local })">
        {{ buttonText }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue';
import { STYLE_OPTIONS, RATIO_OPTIONS, QUALITY_OPTIONS } from '../api/mock.js';
import { useSettingsStore } from '../stores/settings.js';

const props = defineProps({
  selectedCount: { type: Number, default: 0 },
  generating: { type: Boolean, default: false },
  progressText: { type: String, default: '' },
});
defineEmits(['generate']);

const settings = useSettingsStore();

const styleOptions = STYLE_OPTIONS;
const imageModelOptions = computed(() => {
  const list = settings.imageModels;
  if (!list.length) return [{ value: '', label: '请在设置中添加生图模型' }];
  return list.map((m) => ({ value: m.id, label: m.name || m.modelId }));
});
const ratioOptions = RATIO_OPTIONS;
const qualityOptions = QUALITY_OPTIONS;

const local = reactive({
  style: STYLE_OPTIONS[0],
  image_model: settings.imageModelId || settings.imageModels[0]?.id || '',
  ratio: '1:1',
  quality: '1K',
});

// 当生图模型列表或默认模型变化时，保证选择框始终指向一个有效的可选项
watch(
  () => settings.imageModels.map((m) => m.id).join(','),
  () => {
    const ids = settings.imageModels.map((m) => m.id);
    if (!local.image_model || !ids.includes(local.image_model)) {
      local.image_model = settings.imageModelId && ids.includes(settings.imageModelId)
        ? settings.imageModelId
        : ids[0] || '';
    }
  },
  { immediate: true }
);

const disabled = computed(() => props.selectedCount === 0);
const buttonText = computed(() => {
  if (props.generating) return props.progressText || '正在生成...';
  if (props.selectedCount === 0) return '请先选择方案';
  return '生成优化图片';
});
</script>

<style scoped>
.gen-bar {
  position: sticky;
  bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 16px 22px;
  background: var(--card-bg-solid);
  flex-wrap: wrap;
}
.params {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.param {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.p-label {
  font-size: 11px;
  color: var(--text-3);
}
select {
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--card-border);
  color: var(--text-1);
  font-size: 13px;
  cursor: pointer;
}
select:focus {
  outline: none;
  border-color: var(--brand);
}
.right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.count {
  font-size: 13px;
}
</style>
