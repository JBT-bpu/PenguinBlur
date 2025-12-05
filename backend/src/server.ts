import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import os from 'os';

import { uploadRouter } from './routes/upload';
import { videoRouter } from './routes/video';
import { healthRouter } from './routes/health';
import { cleanupService } from './services/cleanup';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Configuration
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FILE_CLEANUP_INTERVAL = parseInt(process.env.FILE_CLEANUP_INTERVAL || '5') * 60 * 1000; // 5 minutes
const FILE_EXPIRY_TIME = parseInt(process.env.FILE_EXPIRY_TIME || '15') * 60 * 1000; // 15 minutes

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'", "ws:", "wss:"],
        },
    },
}));

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));

app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
    });
    next();
});

// Static files for uploads (temporary)
app.use('/temp', express.static(path.join(os.tmpdir(), 'penguinblur'), {
    maxAge: 0, // No caching for temporary files
    setHeaders: (res, filePath) => {
        // Set security headers for file downloads
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
    },
}));

// Routes
app.use('/api/upload', uploadRouter);
app.use('/api/video', videoRouter);
app.use('/api/health', healthRouter);

// Serve frontend in production
if (NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../frontend/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
    });
}

// WebSocket connection for real-time progress updates
wss.on('connection', (ws) => {
    logger.info('New WebSocket connection established');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());
            logger.info('WebSocket message received', { data });
        } catch (error) {
            logger.error('Invalid WebSocket message', { error });
        }
    });

    ws.on('close', () => {
        logger.info('WebSocket connection closed');
    });

    ws.on('error', (error) => {
        logger.error('WebSocket error', { error });
    });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.originalUrl,
    });
});

// Start cleanup service
cleanupService.start(FILE_CLEANUP_INTERVAL, FILE_EXPIRY_TIME);

// Start server
server.listen(PORT, () => {
    logger.info(`🐧 PenguinBlur Server started successfully!`, {
        port: PORT,
        environment: NODE_ENV,
        fileCleanupInterval: `${FILE_CLEANUP_INTERVAL / 1000 / 60} minutes`,
        fileExpiryTime: `${FILE_EXPIRY_TIME / 1000 / 60} minutes`,
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    cleanupService.stop();
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    cleanupService.stop();
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});

export { app, wss };
