import { defineStore } from 'pinia';

const STORE_KEY = 'app_models';

export const API_FORMATS = [
  { value: 'openai-chat', label: 'OpenAI Chat Completions 格式' },
  { value: 'openai-image', label: 'OpenAI Images 格式' },
  { value: 'dashscope', label: '阿里云百炼 / 通义格式' },
  { value: 'gemini', label: 'Google Gemini 格式' },
  { value: 'anthropic', label: 'Anthropic Claude 格式' },
];

function genId() {
  return 'm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
}

function loadModels() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (raw && Array.isArray(raw.models)) return raw;
  } catch {
    /* ignore */
  }
  return { models: [], visionModelId: '', imageModelId: '' };
}

export const useSettingsStore = defineStore('settings', {
  state: () => loadModels(),
  getters: {
    visionModels: (s) => s.models.filter((m) => m.multimodal),
    imageModels: (s) => s.models.filter((m) => m.usage === 'image' || !m.multimodal),
    currentVisionModel: (s) => s.models.find((m) => m.id === s.visionModelId) || null,
    currentImageModel: (s) => s.models.find((m) => m.id === s.imageModelId) || null,
    isConfigured: (s) => s.models.length > 0,
  },
  actions: {
    persist() {
      localStorage.setItem(
        STORE_KEY,
        JSON.stringify({
          models: this.models,
          visionModelId: this.visionModelId,
          imageModelId: this.imageModelId,
        })
      );
    },
    addModel(payload) {
      const model = {
        id: genId(),
        name: payload.name || payload.modelId,
        apiFormat: payload.apiFormat || 'openai-chat',
        baseUrl: payload.baseUrl || '',
        fullUrl: !!payload.fullUrl,
        modelId: payload.modelId || '',
        apiKey: payload.apiKey || '',
        multimodal: !!payload.multimodal,
        usage: payload.usage || (payload.multimodal ? 'vision' : 'image'),
      };
      this.models.push(model);
      if (model.multimodal && !this.visionModelId) this.visionModelId = model.id;
      if (!model.multimodal && !this.imageModelId) this.imageModelId = model.id;
      this.persist();
      return model;
    },
    updateModel(id, payload) {
      const i = this.models.findIndex((m) => m.id === id);
      if (i >= 0) {
        this.models[i] = { ...this.models[i], ...payload };
        this.persist();
      }
    },
    removeModel(id) {
      this.models = this.models.filter((m) => m.id !== id);
      if (this.visionModelId === id) this.visionModelId = this.visionModels[0]?.id || '';
      if (this.imageModelId === id) this.imageModelId = this.imageModels[0]?.id || '';
      this.persist();
    },
    setVisionModel(id) {
      this.visionModelId = id;
      this.persist();
    },
    setImageModel(id) {
      this.imageModelId = id;
      this.persist();
    },
  },
});
