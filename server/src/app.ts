import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';

import authRoutes    from './modules/auth/auth.routes';
import userRoutes    from './modules/users/user.routes';
import villaRoutes   from './modules/villas/villa.routes';
import readingRoutes from './modules/readings/reading.routes';
import billingRoutes from './modules/billing/billing.routes';
import rateRoutes    from './modules/rates/rate.routes';
import { errorMiddleware } from './middleware/error.middleware';
import { env } from './config/env';

const app = express();

// ── Core middleware ───────────────────────────────────────────
app.use(cors({ origin: [env.CLIENT_URL, 'https://gdvsociety.in'], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// ── API routes ────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/villas',   villaRoutes);
app.use('/api/readings', readingRoutes);
app.use('/api/billing',  billingRoutes);
app.use('/api/rates',    rateRoutes);

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Serve React build in production ──────────────────────────
if (env.NODE_ENV === 'production') {
  const clientBuild = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientBuild));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientBuild, 'index.html'));
  });
}

// ── Global error handler (must be last) ──────────────────────
app.use(errorMiddleware);

export default app;
