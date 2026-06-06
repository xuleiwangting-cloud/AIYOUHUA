import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.use(authRequired);

router.post('/diagnose', (req, res) => {
  res.json({
    note: '占位接口：后续替换为真实视觉模型诊断。当前前端使用本地 mock 数据。',
  });
});

router.post('/schemes', (req, res) => {
  res.json({
    note: '占位接口：后续替换为真实方案生成模型。当前前端使用本地 mock 数据。',
  });
});

router.post('/generate', (req, res) => {
  res.json({
    note: '占位接口：后续替换为真实生图 API。当前前端使用占位图。',
  });
});

export default router;
