<template>
  <div class="auth-wrap">
    <div class="auth-card card">
      <div class="auth-head">
        <span class="logo">✦</span>
        <h1 class="title text-gradient">创建账号</h1>
        <p class="subtitle">注册一个账号，开始你的主图优化之旅</p>
      </div>

      <form class="form" @submit.prevent="onSubmit">
        <label class="field">
          <span>用户名（3-50 字符）</span>
          <input v-model.trim="form.username" type="text" placeholder="请输入用户名" autocomplete="username" />
        </label>
        <label class="field">
          <span>昵称（可选）</span>
          <input v-model.trim="form.display_name" type="text" placeholder="显示名称" />
        </label>
        <label class="field">
          <span>密码（至少 6 位）</span>
          <input v-model="form.password" type="password" placeholder="请输入密码" autocomplete="new-password" />
        </label>
        <label class="field">
          <span>确认密码</span>
          <input v-model="form.confirm" type="password" placeholder="请再次输入密码" autocomplete="new-password" />
        </label>

        <p v-if="error" class="error">{{ error }}</p>

        <button class="btn-primary submit" :disabled="loading" type="submit">
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>

      <p class="switch">
        已有账号？<router-link to="/login" class="link">返回登录</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const auth = useAuthStore();
const router = useRouter();
const form = reactive({ username: '', display_name: '', password: '', confirm: '' });
const loading = ref(false);
const error = ref('');

async function onSubmit() {
  error.value = '';
  if (!form.username || !form.password) {
    error.value = '请填写用户名和密码';
    return;
  }
  if (form.username.length < 3) {
    error.value = '用户名至少 3 个字符';
    return;
  }
  if (form.password.length < 6) {
    error.value = '密码至少 6 位';
    return;
  }
  if (form.password !== form.confirm) {
    error.value = '两次输入的密码不一致';
    return;
  }
  loading.value = true;
  try {
    await auth.register({
      username: form.username,
      password: form.password,
      display_name: form.display_name,
    });
    router.push('/optimizer');
  } catch (e) {
    error.value = e.response?.data?.error || '注册失败，请稍后重试';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.auth-card {
  width: 100%;
  max-width: 440px;
  padding: 40px 36px;
}
.auth-head {
  text-align: center;
  margin-bottom: 28px;
}
.logo {
  font-size: 32px;
  color: var(--brand);
}
.title {
  font-size: 22px;
  font-weight: 700;
  margin: 12px 0 6px;
}
.subtitle {
  color: var(--text-2);
  font-size: 13px;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
  color: var(--text-2);
}
.field input {
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--card-border);
  color: var(--text-1);
  font-size: 14px;
  transition: border-color 0.2s ease;
}
.field input:focus {
  outline: none;
  border-color: var(--brand);
}
.error {
  color: var(--danger);
  font-size: 13px;
  margin: -4px 0 0;
}
.submit {
  width: 100%;
  margin-top: 4px;
}
.switch {
  text-align: center;
  margin-top: 22px;
  font-size: 13px;
  color: var(--text-2);
}
.link {
  color: var(--brand);
  font-weight: 600;
}
</style>
