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
  const { data } = await http.post('/ai/diagnose', {
    model: toModelPayload(model),
    imageDataUrl,
  });
  return data.result;
}

export async function aiSchemes(model, diagnosis, direction, count = 8) {
  const { data } = await http.post('/ai/schemes', {
    model: toModelPayload(model),
    diagnosis,
    direction,
    count,
  });
  return data.schemes;
}
