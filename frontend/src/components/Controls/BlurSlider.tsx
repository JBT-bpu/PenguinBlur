import React from 'react';
import { Box, Typography, Slider } from '@mui/material';
import { designTokens } from '../../styles/theme';

interface BlurSliderProps {
    value: number;
    onChange: (value: number) => void;
    disabled?: boolean;
}

export const BlurSlider: React.FC<BlurSliderProps> = ({
    value,
    onChange,
    disabled = false
}) => {
    const handleChange = (event: Event, newValue: number | number[]) => {
        if (typeof newValue === 'number') {
            onChange(newValue);
        }
    };

    const getBlurLabel = (value: number): string => {
        switch (value) {
            case 0:
                return '🐧 Subtle';
            case 1:
                return '🐧 Gentle';
            case 2:
                return '🐧 Medium';
            case 3:
                return '🐧 Strong';
            case 4:
                return '🐧 Maximum';
            default:
                return '🐧 Custom';
        }
    };

    const getBlurDescription = (value: number): string => {
        switch (value) {
            case 0:
                return 'Light penguin blur, faces still recognizable';
            case 1:
                return 'Soft blur with cute penguin overlay';
            case 2:
                return 'Balanced privacy and visibility';
            case 3:
                return 'Strong penguin blur for maximum privacy';
            case 4:
                return 'Complete penguin coverage, total privacy';
            default:
                return `Custom blur level: ${value}`;
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Typography
                variant="h6"
                sx={{
                    fontWeight: 700,
                    color: designTokens.colors.text.primary,
                    mb: 2
                }}
            >
                🐧 Blur Intensity
            </Typography>

            <Box sx={{ px: 2, mb: 2 }}>
                <Slider
                    value={value}
                    onChange={handleChange}
                    disabled={disabled}
                    min={0}
                    max={4}
                    step={1}
                    marks={[
                        { value: 0, label: '🐧 Subtle' },
                        { value: 1, label: '🐧 Gentle' },
                        { value: 2, label: '🐧 Medium' },
                        { value: 3, label: '🐧 Strong' },
                        { value: 4, label: '🐧 Maximum' }
                    ]}
                    valueLabelDisplay="auto"
                    valueLabelFormat={getBlurLabel}
                    sx={{
                        '& .MuiSlider-track': {
                            height: 8,
                            borderRadius: 4,
                        },
                        '& .MuiSlider-rail': {
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: designTokens.colors.background.secondary,
                        },
                        '& .MuiSlider-thumb': {
                            width: 24,
                            height: 24,
                            backgroundColor: designTokens.colors.primary.main,
                            border: `3px solid ${designTokens.colors.border}`,
                            '&:hover, &.Mui-active': {
                                boxShadow: `0 0 0 12px ${designTokens.colors.primary.main}40`,
                                transform: 'scale(1.1)',
                            },
                        },
                        '& .MuiSlider-mark': {
                            backgroundColor: designTokens.colors.text.secondary,
                        },
                        '& .MuiSlider-markActive': {
                            backgroundColor: designTokens.colors.primary.main,
                        },
                        '& .MuiSlider-valueLabel': {
                            backgroundColor: designTokens.colors.primary.main,
                            color: designTokens.colors.background.primary,
                            fontWeight: 700,
                            border: `2px solid ${designTokens.colors.border}`,
                            borderRadius: designTokens.borderRadius.medium,
                            fontSize: '0.75rem',
                            padding: '4px 8px',
                        },
                        opacity: disabled ? 0.5 : 1,
                    }}
                />
            </Box>

            <Typography
                variant="body2"
                sx={{
                    color: designTokens.colors.text.secondary,
                    textAlign: 'center',
                    fontStyle: 'italic',
                    mb: 1
                }}
            >
                {getBlurDescription(value)}
            </Typography>

            {value === 4 && (
                <Box
                    sx={{
                        p: 2,
                        backgroundColor: 'rgba(255, 69, 0, 0.1)',
                        borderRadius: designTokens.borderRadius.medium,
                        border: `1px solid ${designTokens.colors.primary.main}`,
                        mt: 2
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            color: designTokens.colors.primary.dark,
                            fontWeight: 600,
                            textAlign: 'center'
                        }}
                    >
                        ⚠️ Maximum blur applied - faces will be completely hidden
                    </Typography>
                </Box>
            )}

            {value === 0 && (
                <Box
                    sx={{
                        p: 2,
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        borderRadius: designTokens.borderRadius.medium,
                        border: `1px solid ${designTokens.colors.border}`,
                        mt: 2
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            color: designTokens.colors.text.secondary,
                            fontWeight: 600,
                            textAlign: 'center'
                        }}
                    >
                        ℹ️ Subtle blur - some facial features may still be visible
                    </Typography>
                </Box>
            )}
        </Box>
    );
};
