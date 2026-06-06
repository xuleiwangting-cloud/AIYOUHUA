<template>
  <div class="modal-mask" @click.self="$emit('close')">
    <div class="modal">
      <button class="close" @click="$emit('close')">✕</button>
      <button class="nav prev" @click="$emit('prev')" v-if="hasPrev">‹</button>
      <button class="nav next" @click="$emit('next')" v-if="hasNext">›</button>

      <img :src="image.url" :alt="image.filename" class="big" />

      <div class="bar">
        <div class="info">
          <span class="fn">{{ image.filename }}</span>
          <span class="size text-2">{{ image.width }} × {{ image.height }}</span>
        </div>
        <div class="acts">
          <button class="btn-ghost" @click="$emit('download', image)">下载</button>
          <button class="btn-ghost danger" @click="$emit('delete', image)">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  image: { type: Object, required: true },
  hasPrev: { type: Boolean, default: false },
  hasNext: { type: Boolean, default: false },
});
defineEmits(['close', 'prev', 'next', 'download', 'delete']);
</script>

<style scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 40px;
}
.modal {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.close {
  position: absolute;
  top: -40px;
  right: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--card-bg-solid);
  border: 1px solid var(--card-border);
  color: #fff;
  font-size: 15px;
  z-index: 2;
}
.nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid var(--card-border);
  color: #fff;
  font-size: 26px;
  line-height: 1;
}
.prev {
  left: 8px;
}
.next {
  right: 8px;
}
.big {
  max-width: 100%;
  max-height: 75vh;
  object-fit: contain;
  border-radius: var(--radius-sm);
}
.bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--card-bg-solid);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-sm);
  padding: 12px 18px;
}
.fn {
  font-weight: 600;
  margin-right: 12px;
  word-break: break-all;
}
.size {
  font-size: 13px;
}
.acts {
  display: flex;
  gap: 12px;
}
.danger {
  color: var(--danger);
}
</style>
