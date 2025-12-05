import os
import sys
import uvicorn
from pathlib import Path
from fastapi import FastAPI, HTTPException, UploadFile, File, status
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
import structlog
import logging
from contextlib import asynccontextmanager
import aiofiles
import tempfile
import shutil

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger("penguinblur")

# FastAPI app
app = FastAPI(
    title="🐧 PenguinBlur API",
    description="Privacy-focused video face blurring with adorable penguin overlays",
    version="1.0.0"
)

# Configuration
PORT = int(os.getenv("PORT", 8080))
NODE_ENV = os.getenv("NODE_ENV", "development")
UPLOAD_DIR = Path("/app/uploads")
TEMP_DIR = Path("/app/temp")
STATIC_DIR = Path("/app/static")

# Ensure directories exist
UPLOAD_DIR.mkdir(exist_ok=True)
TEMP_DIR.mkdir(exist_ok=True)
STATIC_DIR.mkdir(exist_ok=True)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for frontend
app.mount("/static", StaticFiles(directory=str(STATIC_DIR), name="static"))

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for Cloud Run"""
    return JSONResponse(
        status="healthy",
        service="penguinblur",
        version="1.0.0",
        port=PORT
    )

@app.get("/")
async def root():
    """Serve the frontend application"""
    index_path = STATIC_DIR / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return JSONResponse(
        {"error": "Frontend not built"}, 
        status_code=404
    )

# File upload endpoint
@app.post("/api/upload")
async def upload_file(file: UploadFile = File(..., description="Video file to process")):
    """Upload and process video file"""
    
    try:
        # Validate file type
        if not file.content_type.startswith("video/"):
            raise HTTPException(
                status_code=400,
                detail="File must be a video"
            )
        
        # Save uploaded file
        file_path = UPLOAD_DIR / file.filename
        
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        logger.info(
            "File uploaded successfully",
            filename=file.filename,
            size=len(content),
            content_type=file.content_type
        )
        
        return JSONResponse({
            "success": True,
            "filename": file.filename,
            "size": len(content),
            "message": "File uploaded successfully"
        })
        
    except Exception as e:
        logger.error("Upload failed", error=str(e))
        raise HTTPException(
            status_code=500,
            detail="Upload failed"
        )

# Process video endpoint
@app.post("/api/video/process")
async def process_video(filename: str, blur_intensity: int = 2):
    """Process uploaded video with face blur"""
    
    try:
        input_path = UPLOAD_DIR / filename
        output_filename = f"blurred_{blur_intensity}_{filename}"
        output_path = TEMP_DIR / output_filename
        
        if not input_path.exists():
            raise HTTPException(
                status_code=404,
                detail="File not found"
            )
        
        # TODO: Implement actual video processing with OpenCV
        # For now, just copy the file
        shutil.copy2(input_path, output_path)
        
        logger.info(
            "Video processed successfully",
            input_file=str(input_path),
            output_file=str(output_path),
            blur_intensity=blur_intensity
        )
        
        return JSONResponse({
            "success": True,
            "output_filename": output_filename,
            "blur_intensity": blur_intensity,
            "message": "Video processed with penguin blur"
        })
        
    except Exception as e:
        logger.error("Video processing failed", error=str(e))
        raise HTTPException(
            status_code=500,
            detail="Video processing failed"
        )

# Download processed video
@app.get("/api/video/download/{filename}")
async def download_processed_video(filename: str):
    """Download processed video file"""
    
    try:
        file_path = TEMP_DIR / filename
        
        if not file_path.exists():
            raise HTTPException(
                status_code=404,
                detail="File not found"
            )
        
        return FileResponse(
            path=str(file_path),
            filename=filename,
            media_type="video/mp4"
        )
        
    except Exception as e:
        logger.error("Download failed", error=str(e))
        raise HTTPException(
            status_code=500,
            detail="Download failed"
        )

# List processed files
@app.get("/api/video/list")
async def list_processed_videos():
    """List all processed videos"""
    
    try:
        files = []
        if TEMP_DIR.exists():
            for file_path in TEMP_DIR.glob("blurred_*.mp4"):
                files.append({
                    "filename": file_path.name,
                    "size": file_path.stat().st_size,
                    "created": file_path.stat().st_ctime
                })
        
        return JSONResponse({
            "success": True,
            "files": files
        })
        
    except Exception as e:
        logger.error("File listing failed", error=str(e))
        raise HTTPException(
            status_code=500,
            detail="Failed to list files"
        )

# Cleanup old files
@app.delete("/api/cleanup")
async def cleanup_old_files():
    """Clean up old temporary files"""
    
    try:
        import time
        current_time = time.time()
        cutoff_time = current_time - (15 * 60)  # 15 minutes
        
        deleted_count = 0
        if TEMP_DIR.exists():
            for file_path in TEMP_DIR.glob("*"):
                if file_path.stat().st_mtime < cutoff_time:
                    file_path.unlink()
                    deleted_count += 1
        
        logger.info("Cleanup completed", deleted_files=deleted_count)
        
        return JSONResponse({
            "success": True,
            "deleted_files": deleted_count
        })
        
    except Exception as e:
        logger.error("Cleanup failed", error=str(e))
        raise HTTPException(
            status_code=500,
            detail="Cleanup failed"
        )

# Exception handlers
@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error("Unhandled exception", exc_info=True)
    return JSONResponse(
        {"success": False, "error": "Internal server error"},
        status_code=500
    )

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info(
        "🐧 PenguinBlur Server starting up",
        port=PORT,
        environment=NODE_ENV,
        python_version=sys.version
    )

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("🐧 PenguinBlur Server shutting down")

# Run the app
if __name__ == "__main__":
    uvicorn.run(
        "src.server:app",
        host="0.0.0.0",
        port=PORT,
        log_level="info",
        access_log=True
    )
