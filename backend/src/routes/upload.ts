import { Router, Request, Response } from 'express';
import multer from 'multer';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { cleanupService } from '../services/cleanup';
import { logger } from '../utils/logger';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const tempDir = join(require('os').tmpdir(), 'penguinblur');

        // Ensure temp directory exists
        if (!existsSync(tempDir)) {
            mkdirSync(tempDir, { recursive: true });
        }

        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = uuidv4();
        const ext = file.originalname.split('.').pop();
        cb(null, `${uniqueSuffix}.${ext}`);
    },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept video files and images
    const allowedTypes = [
        'video/mp4',
        'video/avi',
        'video/mov',
        'video/wmv',
        'video/flv',
        'video/webm',
        'image/jpeg',
        'image/png',
        'image/bmp',
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type ${file.mimetype} is not allowed`), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
        files: 1, // Only one file at a time
    },
});

// Upload endpoint
router.post('/', upload.single('video'), asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No file uploaded',
        });
    }

    const fileId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now

    // Add file to cleanup service
    cleanupService.addJob({
        id: fileId,
        filePath: req.file.path,
        createdAt: now,
        expiresAt,
        status: 'processing',
    });

    logger.info('File uploaded successfully', {
        fileId,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: req.file.path,
    });

    res.status(200).json({
        success: true,
        data: {
            fileId,
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            uploadedAt: now.toISOString(),
            expiresAt: expiresAt.toISOString(),
            downloadUrl: `/api/video/download/${fileId}`,
        },
    });
}));

// Check upload status
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
        },
    });
}));

// Delete uploaded file
router.delete('/:fileId', asyncHandler(async (req: Request, res: Response) => {
    const { fileId } = req.params;

    const job = cleanupService.getJob(fileId);

    if (!job) {
        return res.status(404).json({
            success: false,
            message: 'File not found or has expired',
        });
    }

    // Remove job and associated files
    cleanupService.removeJob(fileId);

    logger.info('File deleted by user', {
        fileId,
        filePath: job.filePath,
    });

    res.status(200).json({
        success: true,
        message: 'File deleted successfully',
    });
}));

export { router as uploadRouter };
