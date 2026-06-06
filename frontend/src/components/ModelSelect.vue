<template>
  <div class="model-select">
    <span class="label">当前模型</span>
    <select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  options: { type: Array, default: () => [] },
});
defineEmits(['update:modelValue']);
</script>

<style scoped>
.model-select {
  display: flex;
  align-items: center;
  gap: 10px;
}
.label {
  font-size: 13px;
  color: var(--text-2);
}
select {
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--card-border);
  color: var(--text-1);
  font-size: 14px;
  cursor: pointer;
}
select:focus {
  outline: none;
  border-color: var(--brand);
}
</style>
