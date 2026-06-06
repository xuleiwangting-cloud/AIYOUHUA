<template>
  <div class="optimizer">
    <header class="page-head">
      <h1 class="page-title">点击率优化</h1>
      <p class="page-sub text-2">
        上传产品图，AI 自动诊断点击率问题，并生成更容易吸引点击的商品主图方案。
      </p>
    </header>

    <StepCards :current="currentStep" />

    <UploadBox :image="sourceImage" @update="onImageUpdate" />

    <div class="diagnose-bar card">
      <ModelSelect v-model="model" :options="visionModelOptions" />
      <button class="btn-primary" :disabled="!sourceImage || diagnosing" @click="runDiagnose">
        {{ diagnoseButtonText }}
      </button>
    </div>

    <div v-if="diagnosing" class="progress card">
      <div class="bar"><div class="fill" :style="{ width: diagProgress + '%' }"></div></div>
      <p class="progress-text">{{ diagStepText }}</p>
    </div>

    <DiagnoseResult v-if="diagnosis" :result="diagnosis" />

    <DirectionCards
      v-if="diagnosis"
      v-model="direction"
      :disabled="!diagnosis"
    />

    <div v-if="diagnosis && direction" class="gen-scheme-bar">
      <button class="btn-primary" :disabled="schemeLoading" @click="generateSchemes">
        {{ schemeLoading ? '正在生成方案...' : (schemes.length ? '重新生成方案' : '生成优化方案') }}
      </button>
      <button v-if="schemes.length" class="btn-ghost" :disabled="schemeLoading" @click="generateMore">
        衍生更多方案
      </button>
    </div>

    <div v-if="schemes.length" class="schemes">
      <div class="section-title">💡 优化方案（可多选）</div>
      <div class="scheme-grid">
        <SchemeCard
          v-for="(s, i) in schemes"
          :key="s.id"
          :scheme="s"
          :index="i"
          @toggle="s.selected = !s.selected"
          @edit="startEdit(s)"
          @save="saveEdit(s)"
          @cancel="cancelEdit(s)"
          @reset="resetPrompt(s)"
          @input="(val) => (s._draft = val) || (s.image_prompt = val)"
        />
      </div>
    </div>

    <GenerateBar
      v-if="schemes.length"
      :selected-count="selectedSchemes.length"
      :generating="generating"
      :progress-text="genProgressText"
      @generate="runGenerate"
    />

    <div v-if="lastGenerated.length" class="result-tip card">
      ✅ 已生成 {{ lastGenerated.length }} 张图片，
      <router-link to="/history" class="link">前往历史图库查看</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import StepCards from '../components/StepCards.vue';
import UploadBox from '../components/UploadBox.vue';
import ModelSelect from '../components/ModelSelect.vue';
import DiagnoseResult from '../components/DiagnoseResult.vue';
import DirectionCards from '../components/DirectionCards.vue';
import SchemeCard from '../components/SchemeCard.vue';
import GenerateBar from '../components/GenerateBar.vue';
import { mockDiagnose, mockSchemes, mockGenerate, appendHistory } from '../api/mock.js';
import { useSettingsStore } from '../stores/settings.js';

const settings = useSettingsStore();

const visionModelOptions = computed(() => {
  const list = settings.visionModels;
  if (!list.length) return [{ value: '', label: '请在设置中添加视觉模型' }];
  return list.map((m) => ({ value: m.id, label: m.name || m.modelId }));
});

const sourceImage = ref(null);
const model = ref(settings.visionModelId || '');

const diagnosing = ref(false);
const diagnosis = ref(null);
const diagProgress = ref(0);
const diagStepText = ref('');

const direction = ref('');
const schemes = ref([]);
const schemeLoading = ref(false);

const generating = ref(false);
const genProgressText = ref('');
const lastGenerated = ref([]);

const currentStep = computed(() => {
  if (!sourceImage.value) return 0;
  if (!diagnosis.value) return 1;
  return 2;
});

const diagnoseButtonText = computed(() => {
  if (!sourceImage.value) return '请先上传图片';
  if (diagnosing.value) return '诊断中...';
  if (diagnosis.value) return '重新诊断';
  return 'AI 诊断图片';
});

const selectedSchemes = computed(() => schemes.value.filter((s) => s.selected));

function onImageUpdate(img) {
  sourceImage.value = img;
  if (!img) {
    diagnosis.value = null;
    direction.value = '';
    schemes.value = [];
    lastGenerated.value = [];
  }
}

const DIAG_STEPS = [
  '正在识别商品信息...',
  '正在分析主图文案...',
  '正在判断点击率问题...',
  '正在生成诊断结论...',
];

async function runDiagnose() {
  diagnosing.value = true;
  diagProgress.value = 0;
  schemes.value = [];
  direction.value = '';
  lastGenerated.value = [];
  let i = 0;
  diagStepText.value = DIAG_STEPS[0];
  const timer = setInterval(() => {
    i = Math.min(i + 1, DIAG_STEPS.length - 1);
    diagStepText.value = DIAG_STEPS[i];
    diagProgress.value = Math.min(diagProgress.value + 25, 95);
  }, 400);
  try {
    const res = await mockDiagnose();
    diagnosis.value = res;
    direction.value = res.suggested_direction || '';
  } catch {
    alert('诊断失败，请重试');
  } finally {
    clearInterval(timer);
    diagProgress.value = 100;
    diagnosing.value = false;
  }
}

async function generateSchemes() {
  schemeLoading.value = true;
  try {
    schemes.value = await mockSchemes(direction.value, 8);
  } finally {
    schemeLoading.value = false;
  }
}

async function generateMore() {
  schemeLoading.value = true;
  try {
    const more = await mockSchemes(direction.value, 4);
    schemes.value = [...schemes.value, ...more];
  } finally {
    schemeLoading.value = false;
  }
}

function startEdit(s) {
  s._draft = s.image_prompt;
  s.editing = true;
}
function saveEdit(s) {
  s.editing = false;
}
function cancelEdit(s) {
  if (s._draft !== undefined) s.image_prompt = s._draft;
  s.editing = false;
}
function resetPrompt(s) {
  s.image_prompt = s.original_prompt;
}

async function runGenerate(params) {
  if (!selectedSchemes.value.length) return;
  generating.value = true;
  lastGenerated.value = [];
  try {
    const images = await mockGenerate(selectedSchemes.value, params, (cur, total) => {
      genProgressText.value = `正在生成第 ${cur} / ${total} 张...`;
    });
    appendHistory(images);
    lastGenerated.value = images;
  } catch {
    alert('生成失败，请重试');
  } finally {
    generating.value = false;
    genProgressText.value = '';
  }
}
</script>

<style scoped>
.optimizer {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.page-head {
  margin-bottom: 4px;
}
.page-title {
  font-size: 26px;
  font-weight: 800;
}
.page-sub {
  margin-top: 6px;
  font-size: 14px;
}
.diagnose-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 22px;
  gap: 16px;
  flex-wrap: wrap;
}
.progress {
  padding: 18px 22px;
}
.bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  overflow: hidden;
}
.fill {
  height: 100%;
  background: var(--brand-gradient);
  transition: width 0.4s ease;
}
.progress-text {
  margin-top: 10px;
  font-size: 13px;
  color: var(--text-2);
}
.gen-scheme-bar {
  display: flex;
  gap: 14px;
}
.scheme-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.result-tip {
  padding: 16px 22px;
  font-size: 14px;
}
.link {
  color: var(--brand);
  font-weight: 600;
}
</style>
