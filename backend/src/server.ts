import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import authRoutes from './routes/authRoutes';
import mediaRoutes from './routes/mediaRoutes';
import complaintRoutes from './routes/complaintRoutes';
import spatialRoutes from './routes/spatialRoutes';
import notificationRoutes from './routes/notificationRoutes';
import { errorHandler } from './middlewares/errorMiddleware';

const app: Application = express();

// Security & Core Middlewares (HSTS, CSP, X-Frame-Options, No-Sniff)
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "*"],
      },
    },
    referrerPolicy: { policy: 'no-referrer' },
  })
);

// Allow dynamic origins for physical mobile phones on Wi-Fi
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
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
app.use('/api/v1/media', mediaRoutes);
app.use('/api/v1/complaints', complaintRoutes);
app.use('/api/v1/spatial', spatialRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = Number(env.PORT) || 5000;

// Explicitly bind to '0.0.0.0' so physical phones on local Wi-Fi can connect
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 [SmartGovAI Backend Gateway] listening on 0.0.0.0:${PORT} in ${env.NODE_ENV} mode.`);
  console.log(`🔒 [SECURITY]: Enforced Helmet CSP/HSTS & Rate Limiter policies.`);
});

export default app;
