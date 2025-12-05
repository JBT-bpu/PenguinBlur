import { Router, Request, Response } from 'express';
import { join } from 'path';
import { existsSync, createReadStream } from 'fs';
import { cleanupService } from '../services/cleanup';
import { faceDetectionService } from '../services/faceDetection';
import { videoProcessingService } from '../services/videoProcessing';
import { logger } from '../utils/logger';
import { asyncHandler } from '../middleware/errorHandler';
import { wss } from '../server';

const router = Router();

// Process video for face detection and blurring
router.post('/process/:fileId', asyncHandler(async (req: Request, res: Response) => {
    const { fileId } = req.params;
    const { blurIntensity = 'medium', detectionMode = 'auto' } = req.body;

    const job = cleanupService.getJob(fileId);

    if (!job) {
        return res.status(404).json({
            success: false,
            message: 'File not found or has expired',
        });
    }

    if (job.status === 'processing') {
        return res.status(400).json({
            success: false,
            message: 'File is already being processed',
        });
    }

    // Update job status to processing
    cleanupService.updateJobStatus(fileId, 'processing');

    try {
        logger.info('Starting video processing', {
            fileId,
            blurIntensity,
            detectionMode,
            inputPath: job.filePath,
        });

        // Start processing in background
        processVideoAsync(fileId, job.filePath, blurIntensity, detectionMode);

        res.status(200).json({
            success: true,
            message: 'Video processing started',
            data: {
                fileId,
                status: 'processing',
                estimatedTime: '2-5 minutes depending on video length',
            },
        });
    } catch (error) {
        logger.error('Failed to start video processing', {
            fileId,
            error: error.message,
        });

        cleanupService.updateJobStatus(fileId, 'failed');

        res.status(500).json({
            success: false,
            message: 'Failed to start video processing',
        });
    }
}));

// Download processed video
router.get('/download/:fileId', asyncHandler(async (req: Request, res: Response) => {
    const { fileId } = req.params;

    const job = cleanupService.getJob(fileId);

    if (!job) {
        return res.status(404).json({
            success: false,
            message: 'File not found or has expired',
        });
    }

    if (job.status !== 'completed' || !job.outputPath) {
        return res.status(400).json({
            success: false,
            message: 'Video processing not completed',
        });
    }

    if (!existsSync(job.outputPath)) {
        return res.status(404).json({
            success: false,
            message: 'Processed file not found',
        });
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="penguinblur-${fileId}.mp4"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');

    // Stream the file
    const fileStream = createReadStream(job.outputPath);
    fileStream.pipe(res);

    logger.info('File downloaded', {
        fileId,
        outputPath: job.outputPath,
    });
}));

// Get processing status with progress
router.get('/status/:fileId', asyncHandler(async (req: Request, res: Response) => {
    const { fileId } = req.params;

    const job = cleanupService.getJob(fileId);

    if (!job) {
        return res.status(404).json({
            success: false,
            message: 'File not found or has expired',
        });
    }

    const timeRemaining = Math.max(0, job.expiresAt.getTime() - new Date().getTime());

    res.status(200).json({
        success: true,
        data: {
            fileId: job.id,
            status: job.status,
            createdAt: job.createdAt.toISOString(),
            expiresAt: job.expiresAt.toISOString(),
            timeRemaining,
            downloadUrl: job.outputPath ? `/api/video/download/${fileId}` : null,
            progress: job.status === 'processing' ? getProcessingProgress(fileId) : 100,
        },
    });
}));

// Cancel processing
router.post('/cancel/:fileId', asyncHandler(async (req: Request, res: Response) => {
    const { fileId } = req.params;

    const job = cleanupService.getJob(fileId);

    if (!job) {
        return res.status(404).json({
            success: false,
            message: 'File not found or has expired',
        });
    }

    if (job.status !== 'processing') {
        return res.status(400).json({
            success: false,
            message: 'File is not currently being processed',
        });
    }

    // Cancel processing and update status
    cancelProcessing(fileId);
    cleanupService.updateJobStatus(fileId, 'failed');

    logger.info('Processing cancelled by user', {
        fileId,
    });

    res.status(200).json({
        success: true,
        message: 'Processing cancelled',
    });
}));

// Async processing function
async function processVideoAsync(
    fileId: string,
    inputPath: string,
    blurIntensity: string,
    detectionMode: string
): Promise<void> {
    try {
        // Update progress
        broadcastProgress(fileId, 0, 'Starting face detection...');

        // Detect faces in video
        const faces = await faceDetectionService.detectFaces(inputPath, detectionMode);

        broadcastProgress(fileId, 30, `Found ${faces.length} faces. Starting video processing...`);

        // Process video with face blurring
        const outputPath = await videoProcessingService.processVideo(
            inputPath,
            faces,
            blurIntensity,
            (progress) => {
                const totalProgress = 30 + (progress * 0.7); // 70% of processing time
                broadcastProgress(fileId, Math.round(totalProgress), `Processing video... ${progress}%`);
            }
        );

        // Update job with completed status
        cleanupService.updateJobStatus(fileId, 'completed', outputPath);

        broadcastProgress(fileId, 100, 'Processing completed!');

        logger.info('Video processing completed successfully', {
            fileId,
            outputPath,
            facesDetected: faces.length,
        });
    } catch (error) {
        logger.error('Video processing failed', {
            fileId,
            error: error.message,
            stack: error.stack,
        });

        cleanupService.updateJobStatus(fileId, 'failed');
        broadcastProgress(fileId, 0, `Processing failed: ${error.message}`);
    }
}

// Progress tracking
const processingProgress = new Map<string, number>();

function getProcessingProgress(fileId: string): number {
    return processingProgress.get(fileId) || 0;
}

function broadcastProgress(fileId: string, progress: number, message: string): void {
    processingProgress.set(fileId, progress);

    const update = JSON.stringify({
        type: 'processingProgress',
        data: {
            fileId,
            progress,
            message,
            timestamp: new Date().toISOString(),
        },
    });

    wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
            client.send(update);
        }
    });
}

function cancelProcessing(fileId: string): void {
    // This would integrate with the actual video processing service
    // For now, just remove from progress tracking
    processingProgress.delete(fileId);

    const update = JSON.stringify({
        type: 'processingCancelled',
        data: {
            fileId,
            timestamp: new Date().toISOString(),
        },
    });

    wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
            client.send(update);
        }
    });
}

export { router as videoRouter };
