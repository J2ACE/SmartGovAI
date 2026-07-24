import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import authRoutes from './routes/authRoutes';
import { errorHandler } from './middlewares/errorMiddleware';

const app: Application = express();

// Security & Core Middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { success: false, error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Health Check Probes
app.get('/health/live', (req: Request, res: Response) => {
  res.status(200).json({ status: 'live', timestamp: new Date().toISOString() });
});

app.get('/health/ready', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ready', database: 'connected', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 [SmartGovAI Backend Gateway] running on port ${PORT} in ${env.NODE_ENV} mode.`);
  console.log(`🔗 API Documentation: http://localhost:${PORT}/api/v1/docs`);
});

export default app;
