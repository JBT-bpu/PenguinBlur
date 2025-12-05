import React from 'react';
import { Box, Container, AppBar, Toolbar, Typography } from '@mui/material';
import { VideoStage } from '../VideoStage/VideoStage';
import { ControlPanel } from '../Controls/ControlPanel';

export const MainLayout: React.FC = () => {
    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
            {/* Header */}
            <AppBar
                position="static"
                elevation={0}
                sx={{
                    backgroundColor: '#FFFFFF',
                    borderBottom: '2px solid #000000',
                    color: '#000000'
                }}
            >
                <Toolbar>
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            fontWeight: 700,
                            color: '#000000',
                            flexGrow: 1
                        }}
                    >
                        🐧 PenguinBlur
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: '#333333' }}
                    >
                        Privacy-Powered Face Blurring
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Container
                maxWidth="xl"
                sx={{
                    paddingTop: 3,
                    paddingBottom: 3,
                    minHeight: 'calc(100vh - 64px)',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Video Stage - 16:9 Cinema Mode */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <VideoStage />
                    <ControlPanel />
                </Box>
            </Container>
        </Box>
    );
};
