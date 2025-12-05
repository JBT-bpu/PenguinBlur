import { Router } from 'express';
import { cleanupService } from '../services/cleanup';
import { logger } from '../utils/logger';

const router = Router();

// Basic health check
router.get('/', (req, res) => {
    const now = new Date();
    const uptime = process.uptime();

    const healthStatus = {
        status: 'healthy',
        timestamp: now.toISOString(),
        uptime: {
            seconds: Math.floor(uptime),
            human: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
        },
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        },
        jobs: {
            active: cleanupService.getAllJobs().length,
            processing: cleanupService.getAllJobs().filter(job => job.status === 'processing').length,
            completed: cleanupService.getAllJobs().filter(job => job.status === 'completed').length,
            failed: cleanupService.getAllJobs().filter(job => job.status === 'failed').length,
        },
    };

    res.status(200).json({
        success: true,
        data: healthStatus,
    });
});

// Detailed system info
router.get('/detailed', (req, res) => {
    const jobs = cleanupService.getAllJobs();

    const systemInfo = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        system: {
            platform: process.platform,
            arch: process.arch,
            nodeVersion: process.version,
            pid: process.pid,
        },
        memory: process.memoryUsage(),
        jobs: {
            total: jobs.length,
            details: jobs.map(job => ({
                id: job.id,
                status: job.status,
                createdAt: job.createdAt,
                expiresAt: job.expiresAt,
                timeRemaining: Math.max(0, job.expiresAt.getTime() - new Date().getTime()),
            })),
        },
    };

    res.status(200).json({
        success: true,
        data: systemInfo,
    });
});

// Cleanup service status
router.get('/cleanup', (req, res) => {
    const jobs = cleanupService.getAllJobs();

    res.status(200).json({
        success: true,
        data: {
            activeJobs: jobs.length,
            jobs: jobs.map(job => ({
                id: job.id,
                status: job.status,
                createdAt: job.createdAt,
                expiresAt: job.expiresAt,
                timeRemaining: Math.max(0, job.expiresAt.getTime() - new Date().getTime()),
            })),
        },
    });
});

export { router as healthRouter };
