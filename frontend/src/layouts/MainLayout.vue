<template>
  <div class="layout">
    <AppTopNav />
    <main class="app-container content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import AppTopNav from '../components/AppTopNav.vue';
</script>

<style scoped>
.content {
  padding-top: 32px;
  padding-bottom: 80px;
}
</style>
