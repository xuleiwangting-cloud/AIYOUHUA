<template>
  <div class="auth-wrap">
    <div class="auth-card card">
      <div class="auth-head">
        <span class="logo">✦</span>
        <h1 class="title text-gradient">AI 商品主图优化助手</h1>
        <p class="subtitle">登录后开始优化你的商品主图点击率</p>
      </div>

      <form class="form" @submit.prevent="onSubmit">
        <label class="field">
          <span>用户名</span>
          <input v-model.trim="form.username" type="text" placeholder="请输入用户名" autocomplete="username" />
        </label>
        <label class="field">
          <span>密码</span>
          <input v-model="form.password" type="password" placeholder="请输入密码" autocomplete="current-password" />
        </label>

        <label class="remember">
          <input type="checkbox" v-model="autoLogin" />
          <span>自动登录（下次无需重新输入密码）</span>
        </label>

        <p v-if="error" class="error">{{ error }}</p>

        <button class="btn-primary submit" :disabled="loading" type="submit">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <p class="switch">
        还没有账号？<router-link to="/register" class="link">立即注册</router-link>
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
const form = reactive({ username: '', password: '' });
const autoLogin = ref(auth.remember);
const loading = ref(false);
const error = ref('');

async function onSubmit() {
  error.value = '';
  if (!form.username || !form.password) {
    error.value = '请填写用户名和密码';
    return;
  }
  loading.value = true;
  try {
    await auth.login({ username: form.username, password: form.password }, autoLogin.value);
    router.push('/optimizer');
  } catch (e) {
    error.value = e.response?.data?.error || '登录失败，请检查网络或后端服务';
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
  max-width: 420px;
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
  gap: 18px;
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
.remember {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-2);
  cursor: pointer;
  margin: -4px 0;
}
.remember input {
  width: 16px;
  height: 16px;
  accent-color: var(--brand);
  cursor: pointer;
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
