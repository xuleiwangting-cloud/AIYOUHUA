import express from 'express';
import cors from 'cors';
import { config, assertConfig } from './config.js';
import authRoutes from './routes/auth.js';
import mockRoutes from './routes/mock.js';
import aiRoutes from './routes/ai.js';

assertConfig();

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '25mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'aiyouhua-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/mock', mockRoutes);
app.use('/api/ai', aiRoutes);

app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

app.listen(config.port, () => {
  console.log(`[backend] 服务已启动: http://localhost:${config.port}`);
});
