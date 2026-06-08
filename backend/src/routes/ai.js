import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { callVisionModel, extractJson } from '../services/llm.js';

const router = Router();
router.use(authRequired);

const DIAGNOSE_SYSTEM = `你是资深电商商品主图与点击率优化专家。请仔细观察用户上传的商品主图，结合电商投放经验，输出结构化诊断结果。只输出 JSON，不要任何多余说明文字，不要使用 markdown 代码块。`;

const DIAGNOSE_USER = `请基于这张商品主图进行点击率诊断，严格按以下 JSON 结构输出（字段名保持英文，值用中文）：
{
  "score": 整数0-100的点击率潜力分,
  "product_name": "识别出的商品名称",
  "category": "商品类目",
  "core_selling_points": ["卖点1","卖点2","卖点3"],
  "image_copy": {
    "main_title": "图中主标题文字",
    "brand": "品牌名(无则填未知)",
    "parameters": ["参数1","参数2"],
    "trust_text": "背书/信任文案(无则填无)",
    "model_text": "型号或英文标识(无则填无)"
  },
  "visual_analysis": {
    "composition": "构图分析",
    "color": "色彩分析",
    "lighting": "光影分析",
    "layout": "排版分析",
    "atmosphere": "氛围分析"
  },
  "ctr_problems": ["影响点击率的问题1","问题2","问题3"],
  "suggested_direction": "copy 或 visual 或 both 三选一"
}
请确保所有字段都基于实际看到的图片内容，不要套用示例。`;

function normalizeDiagnosis(obj) {
  const safeArr = (v) => (Array.isArray(v) ? v.filter(Boolean).map(String) : []);
  const ic = obj.image_copy || {};
  const va = obj.visual_analysis || {};
  let dir = String(obj.suggested_direction || 'both').toLowerCase();
  if (!['copy', 'visual', 'both'].includes(dir)) dir = 'both';
  let score = Number(obj.score);
  if (!Number.isFinite(score)) score = 70;
  score = Math.max(0, Math.min(100, Math.round(score)));
  return {
    score,
    product_name: String(obj.product_name || '未识别商品'),
    category: String(obj.category || ''),
    core_selling_points: safeArr(obj.core_selling_points),
    image_copy: {
      main_title: String(ic.main_title || ''),
      brand: String(ic.brand || ''),
      parameters: safeArr(ic.parameters),
      trust_text: String(ic.trust_text || ''),
      model_text: String(ic.model_text || ''),
    },
    visual_analysis: {
      composition: String(va.composition || ''),
      color: String(va.color || ''),
      lighting: String(va.lighting || ''),
      layout: String(va.layout || ''),
      atmosphere: String(va.atmosphere || ''),
    },
    ctr_problems: safeArr(obj.ctr_problems),
    suggested_direction: dir,
  };
}

router.post('/diagnose', async (req, res) => {
  const { model, imageDataUrl } = req.body || {};
  if (!model) return res.status(400).json({ error: '缺少模型配置，请先在设置中添加视觉模型' });
  if (!imageDataUrl) return res.status(400).json({ error: '缺少图片数据' });
  try {
    const text = await callVisionModel({
      model,
      systemPrompt: DIAGNOSE_SYSTEM,
      userPrompt: DIAGNOSE_USER,
      imageDataUrl,
    });
    const parsed = extractJson(text);
    if (!parsed) {
      return res.status(502).json({ error: '模型未返回有效 JSON，请更换模型或重试', raw: String(text).slice(0, 800) });
    }
    res.json({ result: normalizeDiagnosis(parsed) });
  } catch (err) {
    console.error('[ai/diagnose]', err.message);
    res.status(502).json({ error: `诊断失败：${err.message}` });
  }
});

const DIR_LABEL = { copy: '优化文案', visual: '优化视觉', both: '文案视觉均优化' };

const SCHEMES_SYSTEM = `你是资深电商主图设计与文案策划专家。请根据商品诊断结果，产出可直接用于 AI 生图的优化方案。只输出 JSON，不要任何多余说明，不要使用 markdown 代码块。`;

function buildSchemesUser(diagnosis, direction, count) {
  return `已知商品诊断结果如下（JSON）：
${JSON.stringify(diagnosis)}

优化方向：${DIR_LABEL[direction] || '文案视觉均优化'}。
请生成 ${count} 个不同切入点的优化方案，严格按以下 JSON 结构输出：
{
  "schemes": [
    {
      "title": "方案标题",
      "target_problem": "针对的原图问题",
      "strategy": "优化策略说明",
      "copywriting": { "main_title": "主标题", "subtitle": "副标题", "support_points": ["支撑点1","支撑点2"] },
      "image_prompt": "用于AI生图的详细中文提示词，包含镜头、产品保真要求、场景、文案、风格、禁止项",
      "negative_prompt": "负向提示词"
    }
  ]
}
要求：image_prompt 必须强调保持原产品外观结构不变、不乱码文字、不夸大参数；每个方案切入点不同。`;
}

function normalizeSchemes(arr, direction) {
  const safeArr = (v) => (Array.isArray(v) ? v.filter(Boolean).map(String) : []);
  return (Array.isArray(arr) ? arr : []).map((s, i) => {
    const cw = s.copywriting || {};
    const prompt = String(s.image_prompt || '');
    return {
      id: Date.now() + i,
      title: String(s.title || `优化方案 ${i + 1}`),
      target_problem: String(s.target_problem || ''),
      strategy: String(s.strategy || ''),
      direction,
      copywriting: {
        main_title: String(cw.main_title || ''),
        subtitle: String(cw.subtitle || ''),
        support_points: safeArr(cw.support_points),
      },
      original_prompt: prompt,
      image_prompt: prompt,
      negative_prompt: String(s.negative_prompt || '不要改变产品结构，不要乱码文字，不要错误 logo，不要夸大虚假参数'),
      selected: false,
      editing: false,
    };
  });
}

router.post('/schemes', async (req, res) => {
  const { model, diagnosis, direction = 'both', count = 8 } = req.body || {};
  if (!model) return res.status(400).json({ error: '缺少模型配置' });
  if (!diagnosis) return res.status(400).json({ error: '缺少诊断结果' });
  try {
    const text = await callVisionModel({
      model,
      systemPrompt: SCHEMES_SYSTEM,
      userPrompt: buildSchemesUser(diagnosis, direction, count),
      imageDataUrl: null,
    });
    const parsed = extractJson(text);
    const schemes = normalizeSchemes(parsed?.schemes, direction);
    if (!schemes.length) {
      return res.status(502).json({ error: '模型未返回有效方案，请重试', raw: String(text).slice(0, 800) });
    }
    res.json({ schemes });
  } catch (err) {
    console.error('[ai/schemes]', err.message);
    res.status(502).json({ error: `方案生成失败：${err.message}` });
  }
});

export default router;
