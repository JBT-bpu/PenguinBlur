import React, { useState, useRef, useCallback } from 'react';
import { Box, Card, Typography, Paper } from '@mui/material';
import ReactCompareSlider from 'react-compare-slider';
import { useVideoSync } from '../../hooks/useVideoSync';
import { designTokens } from '../../styles/theme';

interface VideoStageProps {
    originalVideoUrl?: string;
    processedVideoUrl?: string;
    isLoading?: boolean;
}

export const VideoStage: React.FC<VideoStageProps> = ({
    originalVideoUrl,
    processedVideoUrl,
    isLoading = false
}) => {
    const originalVideoRef = useRef<HTMLVideoElement>(null);
    const processedVideoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Use our custom video sync hook
    const { syncVideos, handlePlay, handlePause, handleSeek } = useVideoSync({
        originalVideoRef,
        processedVideoRef
    });

    const handleSliderChange = useCallback(() => {
        // Sync videos when slider moves
        if (originalVideoRef.current && processedVideoRef.current) {
            syncVideos();
        }
    }, [syncVideos]);

    if (isLoading) {
        return (
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '100%',
                    aspectRatio: '16/9',
                    backgroundColor: '#F4F6F8',
                    borderRadius: designTokens.borderRadius.large,
                    border: `2px solid ${designTokens.colors.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 2
                }}
            >
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#000000' }}>
                    🐧 Processing your video...
                </Typography>
                <Typography variant="body1" sx={{ color: '#333333' }}>
                    Applying cute penguin blur effects!
                </Typography>
            </Box>
        );
    }

    if (!originalVideoUrl && !processedVideoUrl) {
        return (
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '100%',
                    aspectRatio: '16/9',
                    backgroundColor: '#F4F6F8',
                    borderRadius: designTokens.borderRadius.large,
                    border: `2px dashed ${designTokens.colors.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 2
                }}
            >
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#000000' }}>
                    🐧
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#000000' }}>
                    Upload a video to get started
                </Typography>
                <Typography variant="body1" sx={{ color: '#333333', textAlign: 'center' }}>
                    Drag & drop or click to select a video file
                </Typography>
            </Box>
        );
    }

    return (
        <Card
            sx={{
                position: 'relative',
                width: '100%',
                maxWidth: '100%',
                aspectRatio: '16/9',
                overflow: 'hidden',
                backgroundColor: '#000000'
            }}
        >
            {/* Compare Slider Container */}
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden'
                }}
            >
                {originalVideoUrl && processedVideoUrl ? (
                    <ReactCompareSlider
                        handle={
                            <Paper
                                elevation={3}
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%',
                                    backgroundColor: '#FF4500',
                                    border: '3px solid #000000',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'grab',
                                    '&:active': {
                                        cursor: 'grabbing'
                                    },
                                    zIndex: 10
                                }}
                            >
                                <Typography sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: '12px' }}>
                                    ↔
                                </Typography>
                            </Paper>
                        }
                        onPositionChange={handleSliderChange}
                        style={{
                            position: 'relative',
                            width: '100%',
                            height: '100%'
                        }}
                    >
                        {/* Original Video (Left Side) */}
                        <Box
                            sx={{
                                position: 'relative',
                                width: '100%',
                                height: '100%',
                                backgroundColor: '#000000'
                            }}
                        >
                            <video
                                ref={originalVideoRef}
                                src={originalVideoUrl}
                                onPlay={handlePlay}
                                onPause={handlePause}
                                onSeeked={handleSeek}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain'
                                }}
                                muted
                                playsInline
                            />
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 16,
                                    left: 16,
                                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                    color: '#FFFFFF',
                                    padding: '8px 12px',
                                    borderRadius: designTokens.borderRadius.medium,
                                    border: '2px solid #FFFFFF'
                                }}
                            >
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    Original
                                </Typography>
                            </Box>
                        </Box>

                        {/* Processed Video (Right Side) */}
                        <Box
                            sx={{
                                position: 'relative',
                                width: '100%',
                                height: '100%',
                                backgroundColor: '#000000'
                            }}
                        >
                            <video
                                ref={processedVideoRef}
                                src={processedVideoUrl}
                                onPlay={handlePlay}
                                onPause={handlePause}
                                onSeeked={handleSeek}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain'
                                }}
                                muted
                                playsInline
                            />
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 16,
                                    right: 16,
                                    backgroundColor: 'rgba(255, 69, 0, 0.8)',
                                    color: '#FFFFFF',
                                    padding: '8px 12px',
                                    borderRadius: designTokens.borderRadius.medium,
                                    border: '2px solid #FFFFFF'
                                }}
                            >
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    🐧 Penguin Blur
                                </Typography>
                            </Box>
                        </Box>
                    </ReactCompareSlider>
                ) : (
                    // Single video view (when only one video is available)
                    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                        <video
                            ref={originalVideoRef || processedVideoRef}
                            src={originalVideoUrl || processedVideoUrl}
                            onPlay={handlePlay}
                            onPause={handlePause}
                            onSeeked={handleSeek}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain'
                            }}
                            controls
                            playsInline
                        />
                    </Box>
                )}
            </Box>
        </Card>
    );
};
