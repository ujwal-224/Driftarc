import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { router } from './routes.js';

const app = express();

const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
  : '*';

app.use(
  cors({
    origin: corsOrigin === '*' ? '*' : corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-github-token']
  })
);
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Mount API routes
app.use('/api', router);

// Root greeting / health
app.get('/', (req, res) => {
  res.json({
    app: 'DriftArc Backend',
    status: 'running',
    docs: '/api/health'
  });
});

const server = app.listen(config.port, () => {
  console.log(`[DriftArc] Backend server running on http://localhost:${config.port}`);
});

export { app, server };
