<template>
  <div class="history">
    <header class="page-head">
      <h1 class="page-title">历史图库</h1>
      <p class="page-sub text-2">查看、预览、下载和管理所有生成的优化主图。</p>
    </header>

    <div class="toolbar card">
      <div class="filters">
        <input v-model.trim="keyword" class="search" type="text" placeholder="搜索文件名 / 方案" />
        <select v-model="ratioFilter" class="select">
          <option value="">全部比例</option>
          <option v-for="r in RATIO_OPTIONS" :key="r" :value="r">{{ r }}</option>
        </select>
        <select v-model="modelFilter" class="select">
          <option value="">全部模型</option>
          <option v-for="m in IMAGE_MODEL_OPTIONS" :key="m.value" :value="m.value">{{ m.label }}</option>
        </select>
      </div>
      <div class="batch">
        <label class="select-all">
          <input type="checkbox" :checked="allSelected" @change="toggleAll" />
          <span>全选当前</span>
        </label>
        <button class="btn-ghost" :disabled="!selectedIds.length" @click="downloadSelected">
          下载选中 ({{ selectedIds.length }})
        </button>
        <button class="btn-ghost danger" :disabled="!selectedIds.length" @click="deleteSelected">
          删除选中
        </button>
      </div>
    </div>

    <div v-if="filtered.length" class="grid-wrap">
      <HistoryGrid
        :images="filtered"
        :selected-ids="selectedIds"
        @preview="openPreview"
        @toggle="toggleOne"
        @download="downloadOne"
        @delete="deleteOne"
      />
    </div>

    <div v-else class="empty card">
      <div class="empty-icon">🖼️</div>
      <p class="empty-title">暂无图片</p>
      <p class="text-2">前往「点击率优化」生成你的第一张优化主图吧</p>
      <router-link to="/optimizer" class="btn-primary go">去生成</router-link>
    </div>

    <ImagePreviewModal
      v-if="previewIndex >= 0"
      :image="filtered[previewIndex]"
      :has-prev="previewIndex > 0"
      :has-next="previewIndex < filtered.length - 1"
      @close="previewIndex = -1"
      @prev="previewIndex--"
      @next="previewIndex++"
      @download="downloadOne"
      @delete="deleteFromPreview"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import HistoryGrid from '../components/HistoryGrid.vue';
import ImagePreviewModal from '../components/ImagePreviewModal.vue';
import { loadHistory, saveHistory, RATIO_OPTIONS, IMAGE_MODEL_OPTIONS } from '../api/mock.js';

const images = ref(loadHistory());
const keyword = ref('');
const ratioFilter = ref('');
const modelFilter = ref('');
const selectedIds = ref([]);
const previewIndex = ref(-1);

const filtered = computed(() =>
  images.value.filter((img) => {
    if (keyword.value && !`${img.filename} ${img.scheme_title || ''}`.includes(keyword.value)) return false;
    if (ratioFilter.value && img.ratio !== ratioFilter.value) return false;
    if (modelFilter.value && img.model !== modelFilter.value) return false;
    return true;
  })
);

const allSelected = computed(
  () => filtered.value.length > 0 && filtered.value.every((i) => selectedIds.value.includes(i.id))
);

function persist() {
  saveHistory(images.value);
}

function toggleOne(id) {
  const i = selectedIds.value.indexOf(id);
  if (i >= 0) selectedIds.value.splice(i, 1);
  else selectedIds.value.push(id);
}

function toggleAll() {
  if (allSelected.value) {
    selectedIds.value = [];
  } else {
    selectedIds.value = filtered.value.map((i) => i.id);
  }
}

function openPreview(img) {
  previewIndex.value = filtered.value.findIndex((i) => i.id === img.id);
}

function downloadOne(img) {
  const a = document.createElement('a');
  a.href = img.url;
  a.download = img.filename;
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function downloadSelected() {
  filtered.value.filter((i) => selectedIds.value.includes(i.id)).forEach(downloadOne);
}

function deleteOne(img) {
  if (!confirm(`确定删除「${img.filename}」吗？`)) return;
  images.value = images.value.filter((i) => i.id !== img.id);
  selectedIds.value = selectedIds.value.filter((id) => id !== img.id);
  persist();
}

function deleteFromPreview(img) {
  if (!confirm(`确定删除「${img.filename}」吗？`)) return;
  images.value = images.value.filter((i) => i.id !== img.id);
  selectedIds.value = selectedIds.value.filter((id) => id !== img.id);
  persist();
  previewIndex.value = -1;
}

function deleteSelected() {
  if (!selectedIds.value.length) return;
  if (!confirm(`确定删除选中的 ${selectedIds.value.length} 张图片吗？`)) return;
  images.value = images.value.filter((i) => !selectedIds.value.includes(i.id));
  selectedIds.value = [];
  persist();
}
</script>

<style scoped>
.history {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.page-title {
  font-size: 26px;
  font-weight: 800;
}
.page-sub {
  margin-top: 6px;
  font-size: 14px;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  flex-wrap: wrap;
}
.filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.search,
.select {
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--card-border);
  color: var(--text-1);
  font-size: 13px;
}
.search {
  min-width: 220px;
}
.search:focus,
.select:focus {
  outline: none;
  border-color: var(--brand);
}
.batch {
  display: flex;
  align-items: center;
  gap: 12px;
}
.select-all {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-2);
  cursor: pointer;
}
.select-all input {
  width: 16px;
  height: 16px;
  accent-color: var(--brand);
}
.danger {
  color: var(--danger);
}
.empty {
  text-align: center;
  padding: 60px 24px;
}
.empty-icon {
  font-size: 48px;
}
.empty-title {
  font-size: 18px;
  font-weight: 700;
  margin: 12px 0 6px;
}
.go {
  display: inline-block;
  margin-top: 20px;
}
</style>
