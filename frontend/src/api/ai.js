import http from './http.js';

// 将前端存储的模型配置转换为后端代理所需的最小字段
function toModelPayload(m) {
  if (!m) return null;
  return {
    apiFormat: m.apiFormat,
    baseUrl: m.baseUrl,
    fullUrl: !!m.fullUrl,
    modelId: m.modelId,
    apiKey: m.apiKey,
  };
}

export async function aiDiagnose(model, imageDataUrl) {
  const { data } = await http.post(
    '/ai/diagnose',
    { model: toModelPayload(model), imageDataUrl },
    { timeout: 120000 }
  );
  return data.result;
}

export async function aiSchemes(model, diagnosis, direction, count = 8) {
  const { data } = await http.post(
    '/ai/schemes',
    { model: toModelPayload(model), diagnosis, direction, count },
    { timeout: 120000 }
  );
  return data.schemes;
}

export async function aiGenerate(model, schemes, params) {
  const { data } = await http.post(
    '/ai/generate',
    {
      model: toModelPayload(model),
      schemes: schemes.map((s) => ({
        id: s.id,
        title: s.title,
        image_prompt: s.image_prompt,
        original_prompt: s.original_prompt,
        negative_prompt: s.negative_prompt,
      })),
      params,
    },
    { timeout: 300000 }
  );
  return data.images;
}
