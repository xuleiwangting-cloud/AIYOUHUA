// LLM service: normalize a frontend-provided model config into provider API calls.
// Supported apiFormat: openai-chat / openai-image / dashscope / gemini / anthropic.

function buildChatUrl(model) {
  const base = (model.baseUrl || '').trim().replace(/\/+$/, '');
  if (model.fullUrl) return base;
  return `${base}/chat/completions`;
}

function extractJson(text) {
  if (!text) return null;
  let t = String(text).trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  const slice = t.slice(start, end + 1);
  try {
    return JSON.parse(slice);
  } catch {
    return null;
  }
}

async function callOpenAIChat({ model, systemPrompt, userPrompt, imageDataUrl }) {
  const content = [{ type: 'text', text: userPrompt }];
  if (imageDataUrl) {
    content.push({ type: 'image_url', image_url: { url: imageDataUrl } });
  }
  const messages = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content });

  const res = await fetch(buildChatUrl(model), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${model.apiKey}`,
    },
    body: JSON.stringify({ model: model.modelId, messages, temperature: 0.7 }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Model API ${res.status}: ${txt.slice(0, 500)}`);
  }
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || '';
}

async function callDashscope({ model, systemPrompt, userPrompt, imageDataUrl }) {
  const base = (model.baseUrl || '').trim().replace(/\/+$/, '');
  const url = model.fullUrl ? base : `${base}/services/aigc/multimodal-generation/generation`;
  const userContent = [{ text: userPrompt }];
  if (imageDataUrl) userContent.push({ image: imageDataUrl });
  const input = { messages: [] };
  if (systemPrompt) input.messages.push({ role: 'system', content: [{ text: systemPrompt }] });
  input.messages.push({ role: 'user', content: userContent });

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${model.apiKey}`,
    },
    body: JSON.stringify({ model: model.modelId, input }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Model API ${res.status}: ${txt.slice(0, 500)}`);
  }
  const data = await res.json();
  const choice = data?.output?.choices?.[0]?.message?.content;
  if (Array.isArray(choice)) return choice.map((c) => c.text || '').join('');
  return data?.output?.text || '';
}

async function callGemini({ model, systemPrompt, userPrompt, imageDataUrl }) {
  const base = (model.baseUrl || '').trim().replace(/\/+$/, '');
  const url = model.fullUrl
    ? `${base}${base.includes('?') ? '&' : '?'}key=${model.apiKey}`
    : `${base}/models/${model.modelId}:generateContent?key=${model.apiKey}`;
  const parts = [{ text: userPrompt }];
  if (imageDataUrl) {
    const m = imageDataUrl.match(/^data:(.+?);base64,(.*)$/);
    if (m) parts.push({ inline_data: { mime_type: m[1], data: m[2] } });
  }
  const body = { contents: [{ role: 'user', parts }] };
  if (systemPrompt) body.systemInstruction = { parts: [{ text: systemPrompt }] };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Model API ${res.status}: ${txt.slice(0, 500)}`);
  }
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
}

async function callAnthropic({ model, systemPrompt, userPrompt, imageDataUrl }) {
  const base = (model.baseUrl || '').trim().replace(/\/+$/, '');
  const url = model.fullUrl ? base : `${base}/messages`;
  const content = [{ type: 'text', text: userPrompt }];
  if (imageDataUrl) {
    const m = imageDataUrl.match(/^data:(.+?);base64,(.*)$/);
    if (m) {
      content.unshift({
        type: 'image',
        source: { type: 'base64', media_type: m[1], data: m[2] },
      });
    }
  }
  const body = { model: model.modelId, max_tokens: 2048, messages: [{ role: 'user', content }] };
  if (systemPrompt) body.system = systemPrompt;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': model.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Model API ${res.status}: ${txt.slice(0, 500)}`);
  }
  const data = await res.json();
  return data?.content?.map((c) => c.text || '').join('') || '';
}

function buildImageUrl(model) {
  const base = (model.baseUrl || '').trim().replace(/\/+$/, '');
  if (model.fullUrl) return base;
  return `${base}/images/generations`;
}

// 调用 OpenAI Images 兼容接口（云雾 / 向量引擎等）生成图片，返回 data URL 或图片 URL
export async function callImageModel({ model, prompt, size, n = 1 }) {
  if (!model || !model.modelId || !model.apiKey || !model.baseUrl) {
    throw new Error('Incomplete image model config: baseUrl, modelId and apiKey are required');
  }
  const body = { model: model.modelId, prompt, n };
  if (size) body.size = size;
  const res = await fetch(buildImageUrl(model), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${model.apiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Image API ${res.status}: ${txt.slice(0, 500)}`);
  }
  const data = await res.json();
  const item = data?.data?.[0] || {};
  if (item.b64_json) return `data:image/png;base64,${item.b64_json}`;
  if (item.url) return item.url;
  throw new Error('Image API 未返回图片数据');
}

export async function callVisionModel({ model, systemPrompt, userPrompt, imageDataUrl }) {
  if (!model || !model.modelId || !model.apiKey || !model.baseUrl) {
    throw new Error('Incomplete model config: baseUrl, modelId and apiKey are required');
  }
  const format = model.apiFormat || 'openai-chat';
  switch (format) {
    case 'dashscope':
      return callDashscope({ model, systemPrompt, userPrompt, imageDataUrl });
    case 'gemini':
      return callGemini({ model, systemPrompt, userPrompt, imageDataUrl });
    case 'anthropic':
      return callAnthropic({ model, systemPrompt, userPrompt, imageDataUrl });
    case 'openai-chat':
    case 'openai-image':
    default:
      return callOpenAIChat({ model, systemPrompt, userPrompt, imageDataUrl });
  }
}

export { extractJson };
