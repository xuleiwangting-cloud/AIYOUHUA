<template>
  <Teleport to="body">
    <div class="modal-mask" @click.self="$emit('close')">
    <div class="modal card">
      <header class="modal-head">
        <h3>设置</h3>
        <button class="close" @click="$emit('close')">✕</button>
      </header>

      <div class="tabs">
        <button :class="['tab', { active: tab === 'model' }]" @click="tab = 'model'">模型管理</button>
        <button :class="['tab', { active: tab === 'password' }]" @click="tab = 'password'">修改密码</button>
      </div>

      <section v-show="tab === 'model'" class="panel">
        <div class="list-head">
          <span class="text-2">已添加的模型（每个模型使用各自的 API 密钥）</span>
          <button class="btn-primary small" @click="$emit('open-add-model')">+ 添加模型</button>
        </div>

        <div v-if="!settings.models.length" class="empty">
          <p class="text-2">还没有配置任何模型，点击右上角「添加模型」开始配置。</p>
        </div>

        <div v-else class="model-list">
          <div v-for="m in settings.models" :key="m.id" class="model-item">
            <div class="m-main">
              <div class="m-title">
                <span class="m-name">{{ m.name || m.modelId }}</span>
                <span v-if="m.multimodal" class="badge vision">多模态/视觉</span>
                <span v-else class="badge image">生图/文本</span>
              </div>
              <div class="m-meta text-2">
                {{ formatLabel(m.apiFormat) }} · {{ m.baseUrl }}
              </div>
              <div class="m-meta text-2">模型 ID：{{ m.modelId }} · 密钥：{{ maskKey(m.apiKey) }}</div>
            </div>
            <div class="m-actions">
              <label v-if="m.multimodal" class="use-radio">
                <input type="radio" name="vision" :checked="settings.visionModelId === m.id" @change="settings.setVisionModel(m.id)" />
                <span>设为诊断默认</span>
              </label>
              <label v-else class="use-radio">
                <input type="radio" name="image" :checked="settings.imageModelId === m.id" @change="settings.setImageModel(m.id)" />
                <span>设为生图默认</span>
              </label>
              <button class="del" @click="settings.removeModel(m.id)">删除</button>
            </div>
          </div>
        </div>
      </section>

      <section v-show="tab === 'password'" class="panel">
        <label class="field">
          <span>原密码</span>
          <input v-model="pwd.old_password" type="password" placeholder="请输入原密码" autocomplete="current-password" />
        </label>
        <label class="field">
          <span>新密码（至少 6 位）</span>
          <input v-model="pwd.new_password" type="password" placeholder="请输入新密码" autocomplete="new-password" />
        </label>
        <label class="field">
          <span>确认新密码</span>
          <input v-model="pwd.confirm" type="password" placeholder="请再次输入新密码" autocomplete="new-password" />
        </label>

        <p v-if="pwdMsg" :class="['msg', pwdOk ? 'ok' : 'err']">{{ pwdMsg }}</p>

        <div class="actions">
          <button class="btn-primary" :disabled="pwdLoading" @click="submitPassword">
            {{ pwdLoading ? '提交中...' : '确认修改' }}
          </button>
        </div>
      </section>
    </div>
    </div>
  </Teleport>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useSettingsStore, API_FORMATS } from '../stores/settings.js';
import { changePassword } from '../api/auth.js';

defineEmits(['close', 'open-add-model']);

const settings = useSettingsStore();
const tab = ref('model');

function formatLabel(value) {
  return API_FORMATS.find((f) => f.value === value)?.label || value;
}
function maskKey(key) {
  if (!key) return '未设置';
  if (key.length <= 8) return '****';
  return key.slice(0, 4) + '****' + key.slice(-4);
}

const pwd = reactive({ old_password: '', new_password: '', confirm: '' });
const pwdLoading = ref(false);
const pwdMsg = ref('');
const pwdOk = ref(false);

async function submitPassword() {
  pwdMsg.value = '';
  if (!pwd.old_password || !pwd.new_password) {
    pwdOk.value = false;
    pwdMsg.value = '请填写原密码和新密码';
    return;
  }
  if (pwd.new_password.length < 6) {
    pwdOk.value = false;
    pwdMsg.value = '新密码至少 6 位';
    return;
  }
  if (pwd.new_password !== pwd.confirm) {
    pwdOk.value = false;
    pwdMsg.value = '两次输入的新密码不一致';
    return;
  }
  pwdLoading.value = true;
  try {
    await changePassword({ old_password: pwd.old_password, new_password: pwd.new_password });
    pwdOk.value = true;
    pwdMsg.value = '密码修改成功';
    pwd.old_password = '';
    pwd.new_password = '';
    pwd.confirm = '';
  } catch (e) {
    pwdOk.value = false;
    pwdMsg.value = e.response?.data?.error || '修改失败，请重试';
  } finally {
    pwdLoading.value = false;
  }
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
  z-index: 1000;
  padding: 40px 24px;
  overflow-y: auto;
}
.modal {
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  max-height: min(90vh, 800px);
  overflow-y: auto;
  padding: 24px;
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
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--card-border);
}
.tab {
  padding: 10px 14px;
  font-size: 14px;
  color: var(--text-2);
  border-bottom: 2px solid transparent;
}
.tab.active {
  color: var(--text-1);
  border-bottom-color: var(--brand);
}
.panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.list-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}
.small {
  padding: 8px 14px;
  font-size: 13px;
}
.empty {
  padding: 40px 16px;
  text-align: center;
  border: 1px dashed var(--card-border);
  border-radius: var(--radius-md);
}
.model-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.model-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-sm);
}
.m-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.m-name {
  font-weight: 600;
  font-size: 14px;
}
.badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 6px;
}
.badge.vision {
  background: rgba(177, 77, 255, 0.15);
  border: 1px solid rgba(177, 77, 255, 0.35);
}
.badge.image {
  background: rgba(61, 220, 151, 0.12);
  border: 1px solid rgba(61, 220, 151, 0.3);
  color: var(--success);
}
.m-meta {
  font-size: 12px;
  margin-top: 2px;
  word-break: break-all;
}
.m-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  white-space: nowrap;
}
.use-radio {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--text-2);
  cursor: pointer;
}
.use-radio input {
  accent-color: var(--brand);
}
.del {
  color: var(--danger);
  font-size: 12px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
  color: var(--text-2);
}
.field input {
  padding: 11px 13px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--card-border);
  color: var(--text-1);
  font-size: 14px;
}
.field input:focus {
  outline: none;
  border-color: var(--brand);
}
.msg {
  font-size: 13px;
  margin: 0;
}
.msg.ok {
  color: var(--success);
}
.msg.err {
  color: var(--danger);
}
.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
}
</style>
