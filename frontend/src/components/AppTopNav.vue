<template>
  <header class="topnav">
    <div class="app-container nav-inner">
      <div class="brand">
        <span class="logo">✦</span>
        <span class="brand-name text-gradient">AI 商品主图优化助手</span>
      </div>
      <nav class="nav-links">
        <template v-for="item in items" :key="item.path">
          <router-link
            v-if="item.enabled"
            :to="item.path"
            class="nav-link"
            active-class="active"
          >
            {{ item.label }}
          </router-link>
          <span v-else class="nav-link disabled" title="即将开放">
            {{ item.label }}
            <em class="soon">即将开放</em>
          </span>
        </template>
      </nav>
      <div class="user-box">
        <span class="user-name">{{ auth.displayName }}</span>
        <button class="icon-btn" title="设置" @click="showSettings = true">⚙</button>
        <button class="btn-ghost logout" @click="onLogout">退出</button>
      </div>
    </div>

    <SettingsModal v-if="showSettings" @close="showSettings = false" @open-add-model="showAdd = true" />
    <AddModelModal v-if="showAdd" @close="showAdd = false" />
  </header>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';
import SettingsModal from './SettingsModal.vue';
import AddModelModal from './AddModelModal.vue';

const auth = useAuthStore();
const router = useRouter();
const showSettings = ref(false);
const showAdd = ref(false);

const items = [
  { label: '简单诊断', path: '/simple-diagnose', enabled: false },
  { label: '需求诊断', path: '/demand-diagnose', enabled: false },
  { label: '竞品对比', path: '/competitor', enabled: false },
  { label: '点击率优化', path: '/optimizer', enabled: true },
  { label: '历史图库', path: '/history', enabled: true },
];

function onLogout() {
  auth.logout();
  router.push('/login');
}
</script>

<style scoped>
.topnav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(10, 14, 26, 0.75);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--card-border);
}
.nav-inner {
  display: flex;
  align-items: center;
  height: 64px;
  gap: 24px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 16px;
  white-space: nowrap;
}
.logo {
  color: var(--brand);
  font-size: 18px;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}
.nav-link {
  position: relative;
  padding: 8px 14px;
  border-radius: 10px;
  color: var(--text-2);
  font-size: 14px;
  transition: all 0.2s ease;
}
.nav-link:hover {
  color: var(--text-1);
  background: rgba(255, 255, 255, 0.04);
}
.nav-link.active {
  color: #fff;
  background: var(--brand-gradient);
}
.nav-link.disabled {
  color: var(--text-3);
  cursor: not-allowed;
}
.soon {
  font-style: normal;
  font-size: 10px;
  margin-left: 4px;
  padding: 1px 5px;
  border: 1px solid var(--card-border);
  border-radius: 6px;
  opacity: 0.7;
}
.user-box {
  display: flex;
  align-items: center;
  gap: 12px;
  white-space: nowrap;
}
.user-name {
  font-size: 14px;
  color: var(--text-2);
}
.icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  font-size: 16px;
  color: var(--text-2);
  border: 1px solid var(--card-border);
  transition: all 0.2s ease;
}
.icon-btn:hover {
  color: var(--text-1);
  border-color: var(--card-border-hover);
}
.logout {
  padding: 6px 14px;
  font-size: 13px;
}
</style>
