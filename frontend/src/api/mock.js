function imgUrl(prompt, size = 'square_hd') {
  const p = encodeURIComponent(prompt);
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${p}&image_size=${size}`;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const MODEL_OPTIONS = [
  { value: 'qwen-vl-plus', label: 'qwen-vl-plus（视觉诊断）' },
  { value: 'gpt-4o', label: 'gpt-4o（视觉诊断）' },
];

export const IMAGE_MODEL_OPTIONS = [
  { value: 'gpt-image', label: 'gpt-image' },
  { value: 'jimeng', label: '即梦' },
  { value: 'tongyi-wanxiang', label: '通义万相' },
];

export const STYLE_OPTIONS = ['电商主图', '科技质感', '场景大片'];
export const RATIO_OPTIONS = ['1:1', '3:4', '4:5', '9:16'];
export const QUALITY_OPTIONS = ['1K', '2K', '4K'];

export async function mockDiagnose() {
  await delay(1600);
  return {
    score: 72,
    product_name: '超高速小风炮 Pro1 S',
    category: '手持风扇 / 小风炮',
    core_selling_points: ['强劲风力', '40h 长续航', '9.0m/s 风速', '100 档无极调节', '数显屏幕'],
    image_copy: {
      main_title: '超高速小风炮 Pro1 S',
      brand: 'JisuLife 几素',
      parameters: ['续航长达40h', '风速高达9.0m/s', '100档无极调节'],
      trust_text: '全球 USB 小风扇连续四年销量 NO.1',
      model_text: 'Handheld Fan Pro1 S',
    },
    visual_analysis: {
      composition: '左文右图，产品主体清晰',
      color: '白色和浅灰为主，简洁科技风',
      lighting: '产品光影均匀',
      layout: '文字层级清楚，但视觉冲击力不足',
      atmosphere: '偏静态展示，缺少场景代入',
    },
    ctr_problems: [
      '缺少使用场景，用户不容易代入',
      '强风卖点没有被视觉化',
      '画面过于静态，缺少冲击力',
      '清凉感、冰爽感不足',
      '用户关心的痛点没有明显表达',
    ],
    suggested_direction: 'both',
  };
}

const SCHEME_TEMPLATES = [
  { title: '动态风场可视化方案', target: '原图无法让用户直观看到风力强度', strategy: '通过动态气流、头发飘动、纸片飞起把风力可视化', main: '狂飙 9m/s', sub: '五米外发丝狂舞' },
  { title: '全天候续航叙事方案', target: '续航卖点缺乏画面表达', strategy: '用清晨到夜晚的时间线展现 40h 续航', main: '40h 不断电', sub: '一次充电用一周' },
  { title: '都市通勤场景方案', target: '缺少使用场景，用户难代入', strategy: '展现地铁、街头通勤场景中的真实使用', main: '通勤随身风', sub: '挤地铁也清凉' },
  { title: '极端环境测试方案', target: '卖点说服力不足', strategy: '用高温户外极端环境证明强风降温能力', main: '40℃ 也能扛', sub: '强风瞬间降温' },
  { title: '科技美学主义方案', target: '画面质感与高端感不足', strategy: '黑金科技光效突出数显屏与质感', main: '硬核科技风', sub: '数显精准控温' },
  { title: '对比评测增强方案', target: '优势不够直观', strategy: '普通小风扇 vs 小风炮强风对比', main: '风力碾压', sub: '普通风扇弱爆了' },
  { title: '痛点解决方案', target: '用户担心的问题未被回应', strategy: '强调不夹发、低噪音、轻便', main: '不夹发不吵', sub: '轻到忘记存在' },
  { title: '促销信任强化方案', target: '信任背书未被强化', strategy: '突出销量四连冠与品牌背书', main: '四年销量 NO.1', sub: '全球热销验证' },
];

function buildPrompt(t) {
  return [
    `【镜头】低角度仰拍，产品占画面 60%`,
    `【产品】深灰色手持风扇，保持原产品外观、颜色、结构与比例`,
    `【人物/场景】${t.strategy}`,
    `【文案】主标题「${t.main}」，副标题「${t.sub}」`,
    `【产品强调】出风口、数显屏清晰可见`,
    `【场景+风格】电商主图，科技质感，背景干净`,
    `【禁止项】不要改变产品结构，不要乱码文字，不要错误 logo，不要夸大虚假参数`,
  ].join('\n');
}

export async function mockSchemes(direction = 'both', count = 8) {
  await delay(1800);
  return SCHEME_TEMPLATES.slice(0, count).map((t, i) => {
    const prompt = buildPrompt(t);
    return {
      id: Date.now() + i,
      title: t.title,
      target_problem: t.target,
      strategy: t.strategy,
      direction,
      copywriting: { main_title: t.main, subtitle: t.sub, support_points: ['40h 长续航', '100 档无极调节'] },
      original_prompt: prompt,
      image_prompt: prompt,
      negative_prompt: '不要改变产品结构，不要乱码文字，不要错误 logo，不要夸大虚假参数',
      selected: false,
      editing: false,
    };
  });
}

export async function mockGenerate(schemes, params, onProgress) {
  const results = [];
  for (let i = 0; i < schemes.length; i++) {
    onProgress?.(i + 1, schemes.length);
    await delay(1200);
    const s = schemes[i];
    const sizeMap = { '1:1': 'square_hd', '3:4': 'portrait_4_3', '4:5': 'portrait_4_3', '9:16': 'portrait_16_9' };
    results.push({
      id: Date.now() + i,
      scheme_id: s.id,
      scheme_title: s.title,
      filename: `${s.title}_${Date.now() + i}.png`,
      url: imgUrl(`${s.copywriting.main_title} ${s.strategy} ecommerce product main image tech style`, sizeMap[params.ratio] || 'square_hd'),
      width: 1024,
      height: params.ratio === '9:16' ? 1820 : 1024,
      size_bytes: 380000 + i * 12000,
      ratio: params.ratio,
      model: params.image_model,
      quality: params.quality,
      created_at: new Date().toISOString(),
    });
  }
  return results;
}

const STORE_KEY = 'mock_history_images';

export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveHistory(list) {
  localStorage.setItem(STORE_KEY, JSON.stringify(list));
}

export function appendHistory(images) {
  const list = loadHistory();
  const next = [...images, ...list];
  saveHistory(next);
  return next;
}
