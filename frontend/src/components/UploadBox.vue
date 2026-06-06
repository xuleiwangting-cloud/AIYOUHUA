<template>
  <div class="upload card">
    <div class="section-title">📤 上传产品图</div>

    <div
      v-if="!image"
      class="dropzone"
      :class="{ dragging }"
      @click="trigger"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <div class="up-icon">⬆</div>
      <p class="up-main">点击上传或拖拽图片到这里</p>
      <p class="up-sub">支持 JPG / PNG / WEBP，建议清晰商品主图，最大 20MB</p>
      <input ref="fileInput" type="file" accept="image/*" hidden @change="onPick" />
    </div>

    <div v-else class="preview">
      <img :src="image.url" :alt="image.name" class="thumb" />
      <div class="meta">
        <div class="name">{{ image.name }}</div>
        <div class="row text-2">尺寸：{{ image.width }} × {{ image.height }}</div>
        <div class="row text-2">大小：{{ image.sizeText }}</div>
        <div class="actions">
          <button class="btn-ghost" @click="trigger">重新上传</button>
          <button class="btn-ghost danger" @click="remove">删除</button>
        </div>
        <input ref="fileInput" type="file" accept="image/*" hidden @change="onPick" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({ image: { type: Object, default: null } });
const emit = defineEmits(['update']);

const fileInput = ref(null);
const dragging = ref(false);

function trigger() {
  fileInput.value?.click();
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function handleFile(file) {
  if (!file) return;
  if (!/image\/(jpeg|png|webp|jpg)/.test(file.type)) {
    alert('仅支持 JPG / PNG / WEBP 格式');
    return;
  }
  if (file.size > 20 * 1024 * 1024) {
    alert('图片不能超过 20MB');
    return;
  }
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    emit('update', {
      name: file.name,
      url,
      width: img.naturalWidth,
      height: img.naturalHeight,
      sizeText: formatSize(file.size),
    });
  };
  img.src = url;
}

function onPick(e) {
  handleFile(e.target.files?.[0]);
  e.target.value = '';
}

function onDrop(e) {
  dragging.value = false;
  handleFile(e.dataTransfer.files?.[0]);
}

function remove() {
  emit('update', null);
}
</script>

<style scoped>
.upload {
  padding: 24px;
}
.dropzone {
  border: 1.5px dashed var(--card-border);
  border-radius: var(--radius-md);
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.dropzone:hover,
.dropzone.dragging {
  border-color: var(--brand);
  background: rgba(255, 77, 151, 0.05);
}
.up-icon {
  font-size: 36px;
  color: var(--brand);
  margin-bottom: 10px;
}
.up-main {
  font-weight: 600;
}
.up-sub {
  color: var(--text-2);
  font-size: 13px;
  margin-top: 6px;
}
.preview {
  display: flex;
  gap: 20px;
}
.thumb {
  width: 180px;
  height: 180px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--card-border);
}
.meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.name {
  font-weight: 600;
  word-break: break-all;
}
.row {
  font-size: 13px;
}
.actions {
  margin-top: auto;
  display: flex;
  gap: 12px;
}
.danger {
  color: var(--danger);
}
</style>
