import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { EyeOff } from 'lucide-react';
import { designTokens } from '../../styles/theme';

interface PrivacyToggleProps {
    disabled?: boolean;
    originalVideoUrl?: string;
    processedVideoUrl?: string;
}

export const PrivacyToggle: React.FC<PrivacyToggleProps> = ({
    disabled = false,
    originalVideoUrl,
    processedVideoUrl
}) => {
    const [isShowingOriginal, setIsShowingOriginal] = useState(false);
    const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseDown = useCallback(() => {
        if (disabled) return;

        setIsShowingOriginal(true);

        // Clear any existing timeout
        if (holdTimeoutRef.current) {
            clearTimeout(holdTimeoutRef.current);
        }
    }, [disabled]);

    const handleMouseUp = useCallback(() => {
        setIsShowingOriginal(false);

        // Clear any existing timeout
        if (holdTimeoutRef.current) {
            clearTimeout(holdTimeoutRef.current);
        }
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsShowingOriginal(false);

        // Clear any existing timeout
        if (holdTimeoutRef.current) {
            clearTimeout(holdTimeoutRef.current);
        }
    }, []);

    const handleTouchStart = useCallback(() => {
        if (disabled) return;

        setIsShowingOriginal(true);

        // Clear any existing timeout
        if (holdTimeoutRef.current) {
            clearTimeout(holdTimeoutRef.current);
        }
    }, [disabled]);

    const handleTouchEnd = useCallback(() => {
        setIsShowingOriginal(false);

        // Clear any existing timeout
        if (holdTimeoutRef.current) {
            clearTimeout(holdTimeoutRef.current);
        }
    }, []);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (holdTimeoutRef.current) {
                clearTimeout(holdTimeoutRef.current);
            }
        };
    }, []);

    if (!originalVideoUrl || !processedVideoUrl) {
        return null;
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Typography
                variant="body2"
                sx={{
                    color: designTokens.colors.text.secondary,
                    textAlign: 'center',
                    mb: 1
                }}
            >
                {isShowingOriginal ? '👁️ Showing original' : '🙈️ Penguin blur applied'}
            </Typography>

            <Button
                variant={isShowingOriginal ? "contained" : "outlined"}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                disabled={disabled}
                startIcon={<EyeOff size={20} />}
                sx={{
                    borderRadius: designTokens.borderRadius.large,
                    border: `2px solid ${designTokens.colors.border}`,
                    backgroundColor: isShowingOriginal ? designTokens.colors.text.primary : designTokens.colors.background.primary,
                    color: isShowingOriginal ? designTokens.colors.background.primary : designTokens.colors.text.primary,
                    fontWeight: 600,
                    padding: '12px 20px',
                    minWidth: 200,
                    transition: 'all 0.2s ease-in-out',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    WebkitTouchCallout: 'none',
                    WebkitTapHighlightColor: 'transparent',
                    '&:hover': !disabled ? {
                        backgroundColor: isShowingOriginal ? designTokens.colors.text.secondary : designTokens.colors.primary.main,
                        borderColor: isShowingOriginal ? designTokens.colors.text.secondary : designTokens.colors.primary.main,
                        transform: 'translateY(-2px)',
                        boxShadow: designTokens.shadows.medium,
                    } : {},
                    '&:active': {
                        transform: isShowingOriginal ? 'translateY(-1px)' : 'translateY(-3px)',
                        boxShadow: designTokens.shadows.light,
                    },
                    opacity: disabled ? 0.6 : 1,
                }}
            >
                {isShowingOriginal ? 'Hold to show original' : 'Hold to check original'}
            </Button>

            {isShowingOriginal && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1000,
                        pointerEvents: 'none',
                        animation: 'pulse 1.5s ease-in-out infinite alternate',
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            color: '#FF4500',
                            fontWeight: 700,
                            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            padding: '8px 16px',
                            borderRadius: designTokens.borderRadius.medium,
                            border: `2px solid ${designTokens.colors.primary.main}`,
                        }}
                    >
                        👁️ ORIGINAL
                    </Typography>
                </Box>
            )}

            {/* Instructions */}
            <Box
                sx={{
                    mt: 1,
                    p: 2,
                    backgroundColor: isShowingOriginal ? 'rgba(255, 69, 0, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    borderRadius: designTokens.borderRadius.medium,
                    border: `1px solid ${isShowingOriginal ? designTokens.colors.primary.main : designTokens.colors.border}`,
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        color: isShowingOriginal ? designTokens.colors.primary.dark : designTokens.colors.text.secondary,
                        fontWeight: 600,
                        textAlign: 'center'
                    }}
                >
                    {isShowingOriginal
                        ? '🔍 Hold down to keep showing original video'
                        : '🐧 Hold down to temporarily show the original video without blur'
                    }
                </Typography>

                <Typography
                    variant="caption"
                    sx={{
                        color: isShowingOriginal ? designTokens.colors.primary.dark : designTokens.colors.text.secondary,
                        textAlign: 'center',
                        mt: 0.5
                    }}
                >
                    Release to return to penguin blur
                </Typography>
            </Box>
        </Box>
    );

    // Add CSS animation for pulse effect
    const style = document.createElement('style');
    style.textContent = `
    @keyframes pulse {
      0% {
        transform: translate(-50%, -50%) scale(1);
      }
      50% {
        transform: translate(-50%, -50%) scale(1.05);
      }
      100% {
        transform: translate(-50%, -50%) scale(1);
      }
    }
  `;
    document.head.appendChild(style);
};
