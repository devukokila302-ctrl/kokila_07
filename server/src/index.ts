import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import categoriesRouter from './routes/categories.js';
import providersRouter from './routes/providers.js';
import bookingsRouter from './routes/bookings.js';
import reviewsRouter from './routes/reviews.js';
import favoritesRouter from './routes/favorites.js';
import aiRouter from './routes/ai.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // fallback

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    service: 'ServiceNear API',
    supabaseUrl: process.env.SUPABASE_URL ? 'Configured' : 'Missing',
    geminiApiKey: process.env.GEMINI_API_KEY ? 'Configured' : 'Missing',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/categories', categoriesRouter);
app.use('/api/providers', providersRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/ai', aiRouter);

// Serve static build from client/dist if present (Production & Replit Unified Serving)
const clientDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` ServiceNear Backend Server Running on port ${PORT}`);
  console.log(` API Health: http://localhost:${PORT}/api/health`);
  console.log(` Supabase: ${process.env.SUPABASE_URL || 'Default'}`);
  console.log(` Gemini AI: ${process.env.GEMINI_API_KEY ? 'Ready' : 'Not configured'}`);
  if (fs.existsSync(clientDist)) {
    console.log(` Client UI Served: http://localhost:${PORT}/`);
  }
  console.log(`===============================================`);
});
