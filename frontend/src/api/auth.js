import http from './http.js';

export function register(payload) {
  return http.post('/auth/register', payload).then((r) => r.data);
}

export function login(payload) {
  return http.post('/auth/login', payload).then((r) => r.data);
}

export function fetchMe() {
  return http.get('/auth/me').then((r) => r.data);
}

export function changePassword(payload) {
  return http.post('/auth/change-password', payload).then((r) => r.data);
}
