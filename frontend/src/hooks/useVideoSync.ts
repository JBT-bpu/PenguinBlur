import { useRef, useCallback, useEffect } from 'react';

interface VideoSyncProps {
    originalVideoRef: React.RefObject<HTMLVideoElement>;
    processedVideoRef: React.RefObject<HTMLVideoElement>;
}

interface VideoSyncReturn {
    syncVideos: () => void;
    handlePlay: () => void;
    handlePause: () => void;
    handleSeek: () => void;
    handleTimeUpdate: () => void;
    handleLoadedMetadata: () => void;
    isPlaying: boolean;
}

export const useVideoSync = ({
    originalVideoRef,
    processedVideoRef
}: VideoSyncProps): VideoSyncReturn => {
    const isPlayingRef = useRef(false);
    const isSeekingRef = useRef(false);
    const lastTimeUpdateRef = useRef(0);

    // Sync videos - this is the core function that keeps both videos in perfect sync
    const syncVideos = useCallback(() => {
        const originalVideo = originalVideoRef.current;
        const processedVideo = processedVideoRef.current;

        if (!originalVideo || !processedVideo || isSeekingRef.current) {
            return;
        }

        // Don't sync if both videos are already at the same time (within small threshold)
        const timeDiff = Math.abs(originalVideo.currentTime - processedVideo.currentTime);
        if (timeDiff < 0.05) { // 50ms threshold
            return;
        }

        // Determine which video to follow (the one that's further ahead)
        if (originalVideo.currentTime > processedVideo.currentTime) {
            processedVideo.currentTime = originalVideo.currentTime;
        } else {
            originalVideo.currentTime = processedVideo.currentTime;
        }
    }, [originalVideoRef, processedVideoRef]);

    // Handle play event - keep both videos playing together
    const handlePlay = useCallback(() => {
        if (isSeekingRef.current) return;

        const originalVideo = originalVideoRef.current;
        const processedVideo = processedVideoRef.current;

        if (originalVideo && processedVideo) {
            isPlayingRef.current = true;

            // Sync playback rates
            originalVideo.playbackRate = processedVideo.playbackRate;

            // If one video plays, make sure the other plays too
            const shouldPlayBoth = originalVideo.paused || processedVideo.paused;
            if (shouldPlayBoth) {
                const playPromise = Promise.all([
                    originalVideo.play().catch(() => { }),
                    processedVideo.play().catch(() => { })
                ]);

                // Sync after videos start playing
                playPromise.then(() => {
                    setTimeout(syncVideos, 50);
                });
            }
        }
    }, [originalVideoRef, processedVideoRef, syncVideos]);

    // Handle pause event - keep both videos paused together
    const handlePause = useCallback(() => {
        if (isSeekingRef.current) return;

        const originalVideo = originalVideoRef.current;
        const processedVideo = processedVideoRef.current;

        if (originalVideo && processedVideo) {
            isPlayingRef.current = false;

            // If one video pauses, pause the other too
            originalVideo.pause();
            processedVideo.pause();
        }
    }, [originalVideoRef, processedVideoRef]);

    // Handle seek event - sync seek operations
    const handleSeek = useCallback(() => {
        isSeekingRef.current = true;

        const originalVideo = originalVideoRef.current;
        const processedVideo = processedVideoRef.current;

        if (originalVideo && processedVideo) {
            // Sync the seeked time
            if (originalVideo.seeking) {
                processedVideo.currentTime = originalVideo.currentTime;
            } else if (processedVideo.seeking) {
                originalVideo.currentTime = processedVideo.currentTime;
            }
        }

        // Reset seeking flag after a short delay
        setTimeout(() => {
            isSeekingRef.current = false;
        }, 100);
    }, [originalVideoRef, processedVideoRef]);

    // Handle time update - continuous sync during playback
    const handleTimeUpdate = useCallback(() => {
        if (isPlayingRef.current && !isSeekingRef.current) {
            const now = Date.now();

            // Throttle sync calls to avoid performance issues
            if (now - lastTimeUpdateRef.current > 100) { // Sync every 100ms max
                syncVideos();
                lastTimeUpdateRef.current = now;
            }
        }
    }, [syncVideos]);

    // Handle loaded metadata - prepare for sync
    const handleLoadedMetadata = useCallback(() => {
        const originalVideo = originalVideoRef.current;
        const processedVideo = processedVideoRef.current;

        if (originalVideo && processedVideo) {
            // Reset to beginning when both videos are loaded
            originalVideo.currentTime = 0;
            processedVideo.currentTime = 0;

            // Pre-sync to ensure they start together
            syncVideos();
        }
    }, [originalVideoRef, processedVideoRef, syncVideos]);

    // Set up event listeners for both videos
    useEffect(() => {
        const originalVideo = originalVideoRef.current;
        const processedVideo = processedVideoRef.current;

        if (!originalVideo || !processedVideo) {
            return;
        }

        // Add event listeners to original video
        const originalPlayHandler = () => handlePlay();
        const originalPauseHandler = () => handlePause();
        const originalSeekedHandler = () => handleSeek();
        const originalTimeUpdateHandler = () => handleTimeUpdate();
        const originalLoadedMetadataHandler = () => handleLoadedMetadata();

        originalVideo.addEventListener('play', originalPlayHandler);
        originalVideo.addEventListener('pause', originalPauseHandler);
        originalVideo.addEventListener('seeked', originalSeekedHandler);
        originalVideo.addEventListener('timeupdate', originalTimeUpdateHandler);
        originalVideo.addEventListener('loadedmetadata', originalLoadedMetadataHandler);

        // Add event listeners to processed video
        const processedPlayHandler = () => handlePlay();
        const processedPauseHandler = () => handlePause();
        const processedSeekedHandler = () => handleSeek();
        const processedTimeUpdateHandler = () => handleTimeUpdate();
        const processedLoadedMetadataHandler = () => handleLoadedMetadata();

        processedVideo.addEventListener('play', processedPlayHandler);
        processedVideo.addEventListener('pause', processedPauseHandler);
        processedVideo.addEventListener('seeked', processedSeekedHandler);
        processedVideo.addEventListener('timeupdate', processedTimeUpdateHandler);
        processedVideo.addEventListener('loadedmetadata', processedLoadedMetadataHandler);

        // Cleanup function
        return () => {
            // Remove event listeners from original video
            originalVideo.removeEventListener('play', originalPlayHandler);
            originalVideo.removeEventListener('pause', originalPauseHandler);
            originalVideo.removeEventListener('seeked', originalSeekedHandler);
            originalVideo.removeEventListener('timeupdate', originalTimeUpdateHandler);
            originalVideo.removeEventListener('loadedmetadata', originalLoadedMetadataHandler);

            // Remove event listeners from processed video
            processedVideo.removeEventListener('play', processedPlayHandler);
            processedVideo.removeEventListener('pause', processedPauseHandler);
            processedVideo.removeEventListener('seeked', processedSeekedHandler);
            processedVideo.removeEventListener('timeupdate', processedTimeUpdateHandler);
            processedVideo.removeEventListener('loadedmetadata', processedLoadedMetadataHandler);
        };
    }, [
        originalVideoRef,
        processedVideoRef,
        handlePlay,
        handlePause,
        handleSeek,
        handleTimeUpdate,
        handleLoadedMetadata
    ]);

    return {
        syncVideos,
        handlePlay,
        handlePause,
        handleSeek,
        handleTimeUpdate,
        handleLoadedMetadata,
        isPlaying: isPlayingRef.current
    };
};
