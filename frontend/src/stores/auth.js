import { defineStore } from 'pinia';
import { login as apiLogin, register as apiRegister, fetchMe } from '../api/auth.js';

const REMEMBER_KEY = 'auth_remember';

function readToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
}

function readUser() {
  const raw = localStorage.getItem('user') || sessionStorage.getItem('user') || 'null';
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: readToken(),
    user: readUser(),
    remember: localStorage.getItem(REMEMBER_KEY) === '1',
  }),
  getters: {
    isAuthed: (s) => !!s.token,
    displayName: (s) => s.user?.display_name || s.user?.username || '用户',
  },
  actions: {
    persist() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');

      const store = this.remember ? localStorage : sessionStorage;
      if (this.token) store.setItem('token', this.token);
      if (this.user) store.setItem('user', JSON.stringify(this.user));
      localStorage.setItem(REMEMBER_KEY, this.remember ? '1' : '0');
    },
    setRemember(val) {
      this.remember = !!val;
    },
    async login(payload, remember = false) {
      const data = await apiLogin(payload);
      this.token = data.token;
      this.user = data.user;
      this.remember = !!remember;
      this.persist();
    },
    async register(payload) {
      const data = await apiRegister(payload);
      this.token = data.token;
      this.user = data.user;
      this.persist();
    },
    async refresh() {
      const data = await fetchMe();
      this.user = data.user;
      this.persist();
    },
    logout() {
      this.token = '';
      this.user = null;
      this.persist();
    },
  },
});
