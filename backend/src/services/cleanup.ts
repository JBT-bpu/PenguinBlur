import { existsSync, unlinkSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger';
import { wss } from '../server';

interface FileJob {
    id: string;
    filePath: string;
    outputPath?: string;
    createdAt: Date;
    expiresAt: Date;
    status: 'processing' | 'completed' | 'failed';
}

class CleanupService {
    private cleanupInterval: NodeJS.Timeout | null = null;
    private activeJobs: Map<string, FileJob> = new Map();

    start(intervalMs: number, expiryTimeMs: number): void {
        logger.info('Starting cleanup service', {
            interval: `${intervalMs / 1000 / 60} minutes`,
            expiryTime: `${expiryTimeMs / 1000 / 60} minutes`,
        });

        // Run cleanup immediately on start
        this.cleanup(expiryTimeMs);

        // Schedule regular cleanup
        this.cleanupInterval = setInterval(() => {
            this.cleanup(expiryTimeMs);
        }, intervalMs);
    }

    stop(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
            logger.info('Cleanup service stopped');
        }
    }

    addJob(job: FileJob): void {
        this.activeJobs.set(job.id, job);
        logger.info('File job added', {
            jobId: job.id,
            filePath: job.filePath,
            status: job.status,
            expiresAt: job.expiresAt,
        });

        // Notify WebSocket clients about new job
        this.broadcastJobUpdate(job);
    }

    updateJobStatus(jobId: string, status: FileJob['status'], outputPath?: string): void {
        const job = this.activeJobs.get(jobId);
        if (job) {
            job.status = status;
            if (outputPath) {
                job.outputPath = outputPath;
            }
            this.activeJobs.set(jobId, job);

            logger.info('File job status updated', {
                jobId,
                status,
                outputPath,
            });

            // Notify WebSocket clients
            this.broadcastJobUpdate(job);
        }
    }

    removeJob(jobId: string): void {
        const job = this.activeJobs.get(jobId);
        if (job) {
            // Delete associated files
            this.deleteFileIfExists(job.filePath);
            if (job.outputPath) {
                this.deleteFileIfExists(job.outputPath);
            }

            this.activeJobs.delete(jobId);
            logger.info('File job removed and files deleted', {
                jobId,
                filePath: job.filePath,
                outputPath: job.outputPath,
            });

            // Notify WebSocket clients
            this.broadcastJobUpdate({ ...job, status: 'expired' });
        }
    }

    getJob(jobId: string): FileJob | undefined {
        return this.activeJobs.get(jobId);
    }

    getAllJobs(): FileJob[] {
        return Array.from(this.activeJobs.values());
    }

    private cleanup(expiryTimeMs: number): void {
        const now = new Date();
        const expiredJobs: string[] = [];

        // Find expired jobs
        for (const [jobId, job] of this.activeJobs.entries()) {
            if (now > job.expiresAt) {
                expiredJobs.push(jobId);
            }
        }

        // Remove expired jobs and their files
        for (const jobId of expiredJobs) {
            this.removeJob(jobId);
        }

        // Also clean up any orphaned temp files
        this.cleanupTempFiles(expiryTimeMs);

        if (expiredJobs.length > 0) {
            logger.info('Cleanup completed', {
                expiredJobsCount: expiredJobs.length,
                totalJobs: this.activeJobs.size,
            });
        }
    }

    private cleanupTempFiles(expiryTimeMs: number): void {
        try {
            const tempDir = require('os').tmpdir();
            const penguinblurDir = join(tempDir, 'penguinblur');

            if (!existsSync(penguinblurDir)) {
                return;
            }

            const files = readdirSync(penguinblurDir);
            const now = new Date();

            for (const file of files) {
                const filePath = join(penguinblurDir, file);
                const stats = statSync(filePath);

                // Remove files older than expiry time
                if (now.getTime() - stats.mtime.getTime() > expiryTimeMs) {
                    try {
                        unlinkSync(filePath);
                        logger.debug('Orphaned temp file deleted', { filePath });
                    } catch (error) {
                        logger.error('Failed to delete orphaned temp file', {
                            filePath,
                            error,
                        });
                    }
                }
            }
        } catch (error) {
            logger.error('Error during temp file cleanup', { error });
        }
    }

    private deleteFileIfExists(filePath: string): void {
        try {
            if (existsSync(filePath)) {
                unlinkSync(filePath);
                logger.debug('File deleted', { filePath });
            }
        } catch (error) {
            logger.error('Failed to delete file', { filePath, error });
        }
    }

    private broadcastJobUpdate(job: FileJob): void {
        const message = JSON.stringify({
            type: 'jobUpdate',
            job: {
                id: job.id,
                status: job.status,
                createdAt: job.createdAt,
                expiresAt: job.expiresAt,
                timeRemaining: Math.max(0, job.expiresAt.getTime() - new Date().getTime()),
            },
        });

        wss.clients.forEach((client) => {
            if (client.readyState === client.OPEN) {
                client.send(message);
            }
        });
    }
}

export const cleanupService = new CleanupService();
