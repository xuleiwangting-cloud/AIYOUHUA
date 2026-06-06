import dotenv from 'dotenv';

dotenv.config();

function parseCorsOrigins(value) {
  return `http://localhost:5173,http://localhost:5174,${value || ''}`
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const config = {
  port: process.env.PORT || 3001,
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGIN),
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
  jwtSecret: process.env.JWT_SECRET || 'dev_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};

export function assertConfig() {
  const missing = [];
  if (!config.supabaseUrl) missing.push('SUPABASE_URL');
  if (!config.supabaseServiceKey) missing.push('SUPABASE_SERVICE_KEY');
  if (missing.length) {
    console.warn(`[config] 缺少环境变量: ${missing.join(', ')}，请检查 backend/.env`);
  }
}
