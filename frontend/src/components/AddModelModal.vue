<template>
  <Teleport to="body">
    <div class="modal-mask" @click.self="$emit('close')">
    <div class="modal card">
      <header class="modal-head">
        <h3>{{ isEdit ? '编辑模型' : '添加模型' }}</h3>
        <button class="close" @click="$emit('close')">✕</button>
      </header>

      <div class="config-card">
        <div class="config-title">
          <span class="cube">◆</span>
          <span>自定义配置</span>
        </div>

        <label class="field">
          <span class="req">模型用途</span>
          <select v-model="form.usage">
            <option value="vision">视觉诊断（多模态，识别图片）</option>
            <option value="image">生图（文生图 / 图生图）</option>
          </select>
          <p class="tip">
            选「视觉诊断」用于上传图片做点击率诊断；选「生图」用于根据方案生成优化主图（如 gpt-image-2）。
          </p>
        </label>

        <label class="field">
          <span class="req">API 格式</span>
          <select v-model="form.apiFormat">
            <option v-for="f in API_FORMATS" :key="f.value" :value="f.value">{{ f.label }}</option>
          </select>
          <p v-if="form.usage === 'image'" class="tip">
            生图模型请选择「OpenAI Images 格式」，地址填写云雾 / 向量引擎的 <code>/v1</code> 地址。
          </p>
        </label>

        <label class="field">
          <div class="field-top">
            <span class="req">自定义请求地址</span>
            <label class="switch">
              <span class="switch-label">完整 URL</span>
              <input type="checkbox" v-model="form.fullUrl" />
              <i class="track"><i class="thumb"></i></i>
            </label>
          </div>
          <input v-model.trim="form.baseUrl" type="text" placeholder="e.g. https://api.openai.com/v1" />
          <p class="tip">
            请填写兼容 OpenAI API 的服务端点地址，不要以斜杠结尾。诊断会补全 <code>/chat/completions</code>，生图会补全 <code>/images/generations</code>。
          </p>
        </label>

        <label class="field">
          <span class="req">模型 ID</span>
          <input v-model.trim="form.modelId" type="text" placeholder="输入模型 ID，如 gpt-4o / qwen-vl-max / gpt-image-2" />
        </label>

        <label class="field">
          <span class="req">API 密钥</span>
          <div class="key-row">
            <input
              v-model.trim="form.apiKey"
              :type="showKey ? 'text' : 'password'"
              placeholder="输入 API 密钥"
            />
            <button class="btn-ghost small" type="button" @click="showKey = !showKey">
              {{ showKey ? '隐藏' : '显示' }}
            </button>
          </div>
        </label>

        <div class="advanced">
          <button class="adv-toggle" type="button" @click="showAdvanced = !showAdvanced">
            <span>{{ showAdvanced ? '▾' : '▸' }} 高级配置</span>
          </button>
          <p class="adv-tip">展示名称等配置。</p>
          <label v-if="showAdvanced" class="field">
            <span>展示名称（可选）</span>
            <input v-model.trim="form.name" type="text" placeholder="不填则使用模型 ID" />
          </label>
        </div>
      </div>

      <p v-if="error" class="error">{{ error }}</p>

      <footer class="modal-foot">
        <button class="btn-ghost" @click="$emit('close')">取消</button>
        <button class="btn-primary" @click="submit">{{ isEdit ? '保存修改' : '提交' }}</button>
      </footer>
    </div>
    </div>
  </Teleport>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue';
import { useSettingsStore, API_FORMATS } from '../stores/settings.js';

const props = defineProps({
  editModel: { type: Object, default: null },
});
const emit = defineEmits(['close', 'added']);
const settings = useSettingsStore();

const showKey = ref(false);
const showAdvanced = ref(false);
const error = ref('');

const isEdit = computed(() => !!props.editModel);

const form = reactive({
  apiFormat: 'openai-chat',
  usage: 'vision',
  baseUrl: '',
  fullUrl: false,
  modelId: '',
  apiKey: '',
  name: '',
});

function fillFrom(m) {
  if (!m) return;
  form.apiFormat = m.apiFormat || 'openai-chat';
  form.usage = m.usage === 'image' || (m.multimodal === false && m.usage !== 'vision') ? 'image' : 'vision';
  form.baseUrl = m.baseUrl || '';
  form.fullUrl = !!m.fullUrl;
  form.modelId = m.modelId || '';
  form.apiKey = m.apiKey || '';
  form.name = m.name && m.name !== m.modelId ? m.name : '';
  if (form.name) showAdvanced.value = true;
}

watch(
  () => props.editModel,
  (m) => fillFrom(m),
  { immediate: true }
);

function submit() {
  error.value = '';
  if (!form.baseUrl) {
    error.value = '请填写自定义请求地址';
    return;
  }
  if (!form.modelId) {
    error.value = '请填写模型 ID';
    return;
  }
  if (!form.apiKey) {
    error.value = '请填写 API 密钥';
    return;
  }
  const payload = {
    apiFormat: form.apiFormat,
    baseUrl: form.baseUrl,
    fullUrl: form.fullUrl,
    modelId: form.modelId,
    multimodal: form.usage === 'vision',
    apiKey: form.apiKey,
    name: form.name,
    usage: form.usage,
  };
  if (isEdit.value) {
    settings.updateModel(props.editModel.id, payload);
  } else {
    settings.addModel(payload);
  }
  emit('added');
  emit('close');
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 1100;
  padding: 40px 24px;
  overflow-y: auto;
}
.modal {
  width: 100%;
  max-width: 540px;
  margin: 0 auto;
  max-height: min(90vh, 800px);
  overflow-y: auto;
  padding: 22px;
  background: var(--card-bg-solid);
  border-radius: var(--radius-md);
}
.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}
.modal-head h3 {
  font-size: 18px;
  font-weight: 700;
}
.close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: var(--text-2);
  font-size: 15px;
}
.close:hover {
  background: rgba(255, 255, 255, 0.06);
}
.config-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.config-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
}
.cube {
  color: var(--brand);
}
.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
  color: var(--text-2);
}
.field-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.req::before {
  content: '*';
  color: var(--danger);
  margin-right: 4px;
}
.field input,
.field select {
  padding: 11px 13px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--card-border);
  color: var(--text-1);
  font-size: 14px;
}
.field input:focus,
.field select:focus {
  outline: none;
  border-color: var(--brand);
}
.tip {
  font-size: 12px;
  color: var(--text-3);
  background: rgba(80, 120, 255, 0.08);
  border: 1px solid rgba(80, 120, 255, 0.2);
  border-radius: 8px;
  padding: 8px 10px;
  line-height: 1.6;
}
.tip code {
  color: var(--brand);
}
.key-row {
  display: flex;
  gap: 8px;
}
.key-row input {
  flex: 1;
}
.small {
  padding: 8px 12px;
  font-size: 12px;
  white-space: nowrap;
}
.switch {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  position: relative;
}
.switch-label {
  font-size: 12px;
  color: var(--text-3);
}
.switch input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}
.track {
  width: 38px;
  height: 20px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.12);
  position: relative;
  transition: background 0.2s ease;
}
.thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s ease;
}
.switch input:checked + .track {
  background: var(--brand-gradient);
}
.switch input:checked + .track .thumb {
  transform: translateX(18px);
}
.advanced {
  border-top: 1px solid var(--card-border);
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.adv-toggle {
  color: var(--text-2);
  font-size: 13px;
  text-align: left;
}
.adv-tip {
  font-size: 11px;
  color: var(--text-3);
}
.error {
  color: var(--danger);
  font-size: 13px;
  margin: 14px 0 0;
}
.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 18px;
}
</style>
