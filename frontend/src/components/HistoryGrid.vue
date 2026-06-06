<template>
  <div class="grid">
    <div
      v-for="img in images"
      :key="img.id"
      class="cell card"
      :class="{ selected: selectedIds.includes(img.id) }"
    >
      <div class="thumb-wrap" @click="$emit('preview', img)">
        <img :src="img.url" :alt="img.filename" class="thumb" loading="lazy" />
        <label class="pick" @click.stop>
          <input
            type="checkbox"
            :checked="selectedIds.includes(img.id)"
            @change="$emit('toggle', img.id)"
          />
        </label>
      </div>
      <div class="meta">
        <div class="fn" :title="img.filename">{{ img.filename }}</div>
        <div class="row text-2">{{ img.width }} × {{ img.height }} · {{ sizeText(img.size_bytes) }}</div>
        <div class="row text-2">{{ formatTime(img.created_at) }}</div>
        <div class="acts">
          <button class="link-btn" @click="$emit('download', img)">下载</button>
          <button class="link-btn danger" @click="$emit('delete', img)">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  images: { type: Array, default: () => [] },
  selectedIds: { type: Array, default: () => [] },
});
defineEmits(['preview', 'toggle', 'download', 'delete']);

function sizeText(bytes) {
  if (!bytes) return '-';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
function formatTime(iso) {
  try {
    return new Date(iso).toLocaleString('zh-CN', { hour12: false });
  } catch {
    return iso;
  }
}
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}
.cell {
  overflow: hidden;
  transition: all 0.2s ease;
}
.cell.selected {
  border-color: var(--brand);
  box-shadow: var(--brand-glow);
}
.thumb-wrap {
  position: relative;
  cursor: pointer;
  aspect-ratio: 1;
  overflow: hidden;
}
.thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}
.thumb-wrap:hover .thumb {
  transform: scale(1.05);
}
.pick {
  position: absolute;
  top: 10px;
  left: 10px;
}
.pick input {
  width: 18px;
  height: 18px;
  accent-color: var(--brand);
  cursor: pointer;
}
.meta {
  padding: 12px;
}
.fn {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.row {
  font-size: 12px;
  margin-top: 4px;
}
.acts {
  display: flex;
  gap: 14px;
  margin-top: 10px;
}
.link-btn {
  color: var(--brand);
  font-size: 13px;
}
.danger {
  color: var(--danger);
}
@media (max-width: 980px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
