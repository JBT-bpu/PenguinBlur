import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import { logger } from '../utils/logger';

export interface DetectedFace {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
    timestamp: number;
}

export interface FaceDetectionOptions {
    mode?: 'auto' | 'manual' | 'conservative' | 'aggressive';
    confidence?: number;
    maxFaces?: number;
    eyeDistance?: number;
}

class FaceDetectionService {
    private cv: any; // OpenCV instance

    constructor() {
        // Initialize OpenCV (placeholder - would require actual opencv4nodejs)
        this.cv = null;
    }

    async detectFaces(
        inputPath: string,
        options: FaceDetectionOptions = {}
    ): Promise<DetectedFace[]> {
        try {
            logger.info('Starting face detection', {
                inputPath,
                options,
            });

            // Validate input file exists
            if (!existsSync(inputPath)) {
                throw new Error(`Input file not found: ${inputPath}`);
            }

            // Configuration based on ObscuraCam's AndroidFaceDetection
            const config = {
                mode: options.mode || 'auto',
                confidence: options.confidence || 0.15,
                maxFaces: options.maxFaces || 10,
                eyeDistance: options.eyeDistance || 2.0,
            };

            let faces: DetectedFace[] = [];

            // Try different detection methods based on mode
            switch (config.mode) {
                case 'conservative':
                    faces = await this.conservativeDetection(inputPath, config);
                    break;
                case 'aggressive':
                    faces = await this.aggressiveDetection(inputPath, config);
                    break;
                case 'manual':
                    faces = await this.manualDetection(inputPath, config);
                    break;
                default:
                    faces = await this.autoDetection(inputPath, config);
                    break;
            }

            logger.info('Face detection completed', {
                facesDetected: faces.length,
                mode: config.mode,
            });

            return faces;
        } catch (error) {
            logger.error('Face detection failed', {
                inputPath,
                error: error.message,
                stack: error.stack,
            });
            throw new Error(`Face detection failed: ${error.message}`);
        }
    }

    private async autoDetection(
        inputPath: string,
        config: any
    ): Promise<DetectedFace[]> {
        // Simulate automatic face detection
        // In production, this would use OpenCV's face detection algorithms
        // Based on ObscuraCam's AndroidFaceDetection approach

        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate detecting faces at different time intervals
                const faces: DetectedFace[] = [
                    {
                        id: 'face-1',
                        x: 100,
                        y: 80,
                        width: 60,
                        height: 80,
                        confidence: 0.85,
                        timestamp: 0,
                    },
                    {
                        id: 'face-2',
                        x: 300,
                        y: 120,
                        width: 55,
                        height: 75,
                        confidence: 0.78,
                        timestamp: 1000,
                    },
                ];

                // Filter by confidence
                const filteredFaces = faces.filter(
                    face => face.confidence >= config.confidence
                );

                // Limit to max faces
                resolve(filteredFaces.slice(0, config.maxFaces));
            }, 1500); // Simulate processing time
        });
    }

    private async conservativeDetection(
        inputPath: string,
        config: any
    ): Promise<DetectedFace[]> {
        // More conservative detection - higher confidence threshold
        return new Promise((resolve) => {
            setTimeout(() => {
                const faces: DetectedFace[] = [
                    {
                        id: 'face-1',
                        x: 120,
                        y: 90,
                        width: 50,
                        height: 70,
                        confidence: 0.92,
                        timestamp: 0,
                    },
                ];

                const filteredFaces = faces.filter(
                    face => face.confidence >= 0.8
                );

                resolve(filteredFaces.slice(0, config.maxFaces));
            }, 2000);
        });
    }

    private async aggressiveDetection(
        inputPath: string,
        config: any
    ): Promise<DetectedFace[]> {
        // More aggressive detection - lower confidence threshold
        return new Promise((resolve) => {
            setTimeout(() => {
                const faces: DetectedFace[] = [
                    {
                        id: 'face-1',
                        x: 80,
                        y: 60,
                        width: 65,
                        height: 85,
                        confidence: 0.65,
                        timestamp: 0,
                    },
                    {
                        id: 'face-2',
                        x: 280,
                        y: 100,
                        width: 58,
                        height: 78,
                        confidence: 0.58,
                        timestamp: 500,
                    },
                    {
                        id: 'face-3',
                        x: 180,
                        y: 140,
                        width: 52,
                        height: 68,
                        confidence: 0.52,
                        timestamp: 1500,
                    },
                ];

                const filteredFaces = faces.filter(
                    face => face.confidence >= 0.5
                );

                resolve(filteredFaces.slice(0, config.maxFaces));
            }, 1000);
        });
    }

    private async manualDetection(
        inputPath: string,
        config: any
    ): Promise<DetectedFace[]> {
        // Manual detection - return empty array for user to manually specify regions
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([]);
            }, 500);
        });
    }

    // Convert detected faces to blur regions for video processing
    facesToBlurRegions(faces: DetectedFace[]): any[] {
        // Based on ObscuraCam's approach - extend face regions
        // widthBuffer = eyeDistance * 1.5f
        // heightBuffer = eyeDistance * 2f

        return faces.map(face => ({
            id: face.id,
            x: Math.max(0, face.x - face.width * 0.75),
            y: Math.max(0, face.y - face.height * 1.0),
            width: face.width * 2.5,
            height: face.height * 2.0,
            confidence: face.confidence,
            timestamp: face.timestamp,
        }));
    }

    // Face tracking across video frames
    trackFacesAcrossTime(
        facesByFrame: Map<number, DetectedFace[]>
    ): DetectedFace[] {
        const trackedFaces: DetectedFace[] = [];
        const faceTracks = new Map<string, DetectedFace[]>();

        // Group faces by similar positions across frames
        for (const [frameNum, faces] of facesByFrame.entries()) {
            for (const face of faces) {
                let assigned = false;

                // Try to match with existing tracks
                for (const [trackId, track] of faceTracks.entries()) {
                    const lastFace = track[track.length - 1];
                    if (this.isSameFace(face, lastFace)) {
                        track.push(face);
                        faceTracks.set(trackId, track);
                        assigned = true;
                        break;
                    }
                }

                // Create new track if not assigned
                if (!assigned) {
                    faceTracks.set(`track-${faceTracks.size}`, [face]);
                }
            }
        }

        // Convert tracks to stable face detections
        for (const [trackId, track] of faceTracks.entries()) {
            if (track.length > 2) { // Only include faces that appear in multiple frames
                const stableFace = this.calculateStableFace(track);
                trackedFaces.push({
                    ...stableFace,
                    id: trackId,
                });
            }
        }

        return trackedFaces;
    }

    private isSameFace(face1: DetectedFace, face2: DetectedFace): boolean {
        const positionThreshold = 50;
        const sizeThreshold = 20;

        return (
            Math.abs(face1.x - face2.x) < positionThreshold &&
            Math.abs(face1.y - face2.y) < positionThreshold &&
            Math.abs(face1.width - face2.width) < sizeThreshold &&
            Math.abs(face1.height - face2.height) < sizeThreshold
        );
    }

    private calculateStableFace(track: DetectedFace[]): DetectedFace {
        // Calculate average position and size across the track
        const avgX = track.reduce((sum, face) => sum + face.x, 0) / track.length;
        const avgY = track.reduce((sum, face) => sum + face.y, 0) / track.length;
        const avgWidth = track.reduce((sum, face) => sum + face.width, 0) / track.length;
        const avgHeight = track.reduce((sum, face) => sum + face.height, 0) / track.length;
        const avgConfidence = track.reduce((sum, face) => sum + face.confidence, 0) / track.length;
        const avgTimestamp = track[Math.floor(track.length / 2)].timestamp;

        return {
            id: track[0].id,
            x: avgX,
            y: avgY,
            width: avgWidth,
            height: avgHeight,
            confidence: avgConfidence,
            timestamp: avgTimestamp,
        };
    }
}

export const faceDetectionService = new FaceDetectionService();
