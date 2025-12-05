import React, { useState } from 'react';
import { Button, Typography, Box } from '@mui/material';
import { Download } from 'lucide-react';
import { designTokens } from '../../styles/theme';

interface ExportButtonProps {
    disabled?: boolean;
    processedVideoUrl?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
    disabled = false,
    processedVideoUrl
}) => {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        if (!processedVideoUrl || disabled || isExporting) {
            return;
        }

        setIsExporting(true);

        try {
            // Create a temporary anchor element to trigger download
            const response = await fetch(processedVideoUrl);
            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Generate filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            link.download = `penguin-blur-${timestamp}.mp4`;

            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export video. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    if (!processedVideoUrl) {
        return null;
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Button
                variant="contained"
                onClick={handleExport}
                disabled={disabled || isExporting}
                startIcon={<Download size={20} />}
                sx={{
                    borderRadius: designTokens.borderRadius.large,
                    backgroundColor: designTokens.colors.primary.main,
                    color: designTokens.colors.background.primary,
                    border: `2px solid ${designTokens.colors.primary.main}`,
                    fontWeight: 600,
                    padding: '12px 20px',
                    minWidth: 200,
                    transition: 'all 0.2s ease-in-out',
                    cursor: disabled || isExporting ? 'not-allowed' : 'pointer',
                    '&:hover': !disabled && !isExporting ? {
                        backgroundColor: designTokens.colors.primary.dark,
                        borderColor: designTokens.colors.primary.dark,
                        transform: 'translateY(-2px)',
                        boxShadow: designTokens.shadows.medium,
                    } : {},
                    '&:active': !disabled && !isExporting ? {
                        transform: 'translateY(-1px)',
                        boxShadow: designTokens.shadows.light,
                    } : {},
                    '&.Mui-disabled': {
                        backgroundColor: designTokens.colors.text.secondary,
                        borderColor: designTokens.colors.text.secondary,
                        opacity: 0.6,
                    },
                }}
            >
                {isExporting ? '🐧 Exporting...' : '📥 Export Video'}
            </Button>

            {isExporting && (
                <Box
                    sx={{
                        p: 2,
                        backgroundColor: 'rgba(255, 69, 0, 0.1)',
                        borderRadius: designTokens.borderRadius.medium,
                        border: `1px solid ${designTokens.colors.primary.main}`,
                        mt: 1
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            color: designTokens.colors.primary.dark,
                            fontWeight: 600,
                            textAlign: 'center'
                        }}
                    >
                        🐧 Preparing your penguin-blurred video...
                    </Typography>
                </Box>
            )}

            {!isExporting && !disabled && (
                <Box
                    sx={{
                        p: 2,
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        borderRadius: designTokens.borderRadius.medium,
                        border: `1px solid ${designTokens.colors.border}`,
                        mt: 1
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            color: designTokens.colors.text.secondary,
                            fontWeight: 600,
                            textAlign: 'center'
                        }}
                    >
                        💾 Download your privacy-protected video with penguin blur
                    </Typography>
                </Box>
            )}
        </Box>
    );
};
