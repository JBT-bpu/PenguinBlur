import React from 'react';
import { Box, Card, Grid } from '@mui/material';
import { UploadZone } from './UploadZone';
import { BlurSlider } from './BlurSlider';
import { PrivacyToggle } from './PrivacyToggle';
import { ExportButton } from './ExportButton';

interface ControlPanelProps {
    onFileUpload: (file: File) => void;
    blurIntensity: number;
    onBlurIntensityChange: (intensity: number) => void;
    isProcessing: boolean;
    hasVideo: boolean;
    originalVideoUrl?: string;
    processedVideoUrl?: string;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
    onFileUpload,
    blurIntensity,
    onBlurIntensityChange,
    isProcessing,
    hasVideo,
    originalVideoUrl,
    processedVideoUrl
}) => {
    return (
        <Card
            sx={{
                p: 3,
                backgroundColor: '#FFFFFF',
                border: '2px solid #000000'
            }}
        >
            <Grid container spacing={3}>
                {/* Upload Zone */}
                <Grid item xs={12} md={6}>
                    <UploadZone
                        onFileUpload={onFileUpload}
                        isDisabled={isProcessing}
                    />
                </Grid>

                {/* Blur Controls */}
                <Grid item xs={12} md={6}>
                    <BlurSlider
                        value={blurIntensity}
                        onChange={onBlurIntensityChange}
                        disabled={!hasVideo || isProcessing}
                    />
                </Grid>

                {/* Privacy and Export Controls */}
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <PrivacyToggle
                            disabled={!hasVideo || isProcessing}
                            originalVideoUrl={originalVideoUrl}
                            processedVideoUrl={processedVideoUrl}
                        />

                        <ExportButton
                            disabled={!hasVideo || !processedVideoUrl || isProcessing}
                            processedVideoUrl={processedVideoUrl}
                        />
                    </Box>
                </Grid>
            </Grid>
        </Card>
    );
};
