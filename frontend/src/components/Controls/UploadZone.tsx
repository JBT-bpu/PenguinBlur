import React, { useCallback } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import { designTokens } from '../../styles/theme';

interface UploadZoneProps {
    onFileUpload: (file: File) => void;
    isDisabled?: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
    onFileUpload,
    isDisabled = false
}) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];

            // Validate file type (video only)
            const validVideoTypes = [
                'video/mp4',
                'video/avi',
                'video/mov',
                'video/wmv',
                'video/flv',
                'video/webm',
                'video/quicktime'
            ];

            if (validVideoTypes.includes(file.type)) {
                onFileUpload(file);
            } else {
                alert('Please upload a valid video file (MP4, AVI, MOV, WMV, FLV, WebM)');
            }
        }
    }, [onFileUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.qt']
        },
        maxFiles: 1,
        maxSize: 50 * 1024 * 1024, // 50MB limit
        multiple: false,
        disabled: isDisabled
    });

    return (
        <Box
            {...getRootProps()}
            sx={{
                p: 4,
                border: isDragActive
                    ? `3px dashed ${designTokens.colors.primary.main}`
                    : `2px dashed ${designTokens.colors.border}`,
                borderRadius: designTokens.borderRadius.large,
                backgroundColor: isDragActive
                    ? 'rgba(255, 69, 0, 0.05)'
                    : designTokens.colors.background.secondary,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease-in-out',
                textAlign: 'center',
                minHeight: 120,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                opacity: isDisabled ? 0.6 : 1,
                '&:hover': !isDisabled ? {
                    backgroundColor: 'rgba(255, 69, 0, 0.1)',
                    borderColor: designTokens.colors.primary.main,
                    transform: 'translateY(-2px)',
                } : {},
            }}
        >
            <input {...getInputProps()} />

            <UploadCloud
                size={48}
                color={isDragActive ? designTokens.colors.primary.main : designTokens.colors.text.primary}
                strokeWidth={2}
            />

            <Typography
                variant="h6"
                sx={{
                    fontWeight: 700,
                    color: designTokens.colors.text.primary,
                    mb: 1
                }}
            >
                {isDragActive ? 'Drop your video here!' : 'Upload Video'}
            </Typography>

            <Typography
                variant="body2"
                sx={{
                    color: designTokens.colors.text.secondary,
                    textAlign: 'center',
                    mb: 2
                }}
            >
                {isDragActive
                    ? 'Release to upload'
                    : 'Drag & drop or click to browse'
                }
            </Typography>

            <Typography
                variant="caption"
                sx={{
                    color: designTokens.colors.text.secondary,
                    textAlign: 'center'
                }}
            >
                MP4, AVI, MOV, WMV, FLV, WebM • Max 50MB
            </Typography>

            {!isDragActive && (
                <Button
                    variant="contained"
                    onClick={(e) => {
                        e.stopPropagation();
                        document.querySelector('input[type="file"]')?.click();
                    }}
                    disabled={isDisabled}
                    sx={{
                        mt: 2,
                        minWidth: 200
                    }}
                >
                    Choose Video File
                </Button>
            )}
        </Box>
    );
};
