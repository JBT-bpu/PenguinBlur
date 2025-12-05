# 🐧 PenguinBlur - Cloud Native Deployment Guide

## Overview
This guide shows you how to deploy PenguinBlur directly to Google Cloud Run from GitHub - **zero local installation required!**

## 🚀 Quick Start Deployment

### Step 1: Push to GitHub
1. Make sure all your code is committed to your GitHub repository
2. The repository should contain:
   - `Dockerfile` (root level)
   - `app.yaml` (Cloud Run configuration)
   - `frontend/` directory with React app
   - `backend/` directory with Python FastAPI server

### Step 2: Deploy to Google Cloud Run
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **Cloud Run** 
3. Click **"Create Service"**
4. Select **"Continuously deploy from GitHub"**
5. Connect your GitHub repository
6. Choose the main branch
7. Use the provided `app.yaml` configuration
8. Click **"Deploy"**

### Step 3: Wait & Test
- Google Cloud will automatically build your Docker image
- Install all dependencies (React, Python, OpenCV, FFmpeg)
- Deploy your PenguinBlur app
- You'll get a public URL when it's ready! 🎉

## 📋 Pre-Deployment Checklist

### ✅ Repository Structure
```
your-repo/
├── Dockerfile                    # Multi-stage build (included)
├── app.yaml                      # Cloud Run config (included)
├── frontend/
│   ├── package.json              # React dependencies
│   ├── src/                      # React components
│   └── index.html               # HTML template
└── backend/
    ├── requirements.txt          # Python dependencies (pinned)
    └── src/
        └── server.py            # FastAPI server
```

### ✅ Configuration Files
- **Dockerfile**: Multi-stage build, PORT 8080, includes all dependencies
- **app.yaml**: Cloud Run configuration with proper resource limits
- **requirements.txt**: Pinned versions for stability
- **package.json**: Frontend dependencies locked

## 🔧 Technical Details

### What the Dockerfile Does:
1. **Stage 1**: Builds React frontend with Node.js
2. **Stage 2**: Sets up Python environment with video processing libraries
3. **System Dependencies**: Installs FFmpeg, OpenCV dependencies
4. **Security**: Runs as non-root user
5. **Health Checks**: Built-in health monitoring
6. **Port 8080**: Google Cloud Run requirement

### Performance Optimizations:
- **Multi-stage build**: Smaller final image
- **Dependency caching**: Faster builds
- **Resource limits**: 2 CPU, 4GB RAM (adjustable)
- **Health probes**: Automatic recovery
- **Cleanup**: Automatic temp file removal

## 🌐 API Endpoints

Once deployed, your app will have these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check (Cloud Run) |
| `/` | GET | Serve frontend app |
| `/api/upload` | POST | Upload video file |
| `/api/video/process` | POST | Process video with blur |
| `/api/video/download/{filename}` | GET | Download processed video |
| `/api/cleanup` | DELETE | Clean up old files |

## 🎯 Expected Performance

### Resource Allocation:
- **CPU**: 2 vCPU (expandable)
- **Memory**: 4GB RAM (expandable)
- **Storage**: Ephemeral (automatic cleanup)
- **Timeout**: 10 minutes (for video processing)

### Scaling:
- **Auto-scaling**: 0 to 10 instances
- **Concurrency**: 10 requests per instance
- **Cold start**: ~30 seconds (first load)

## 🔍 Troubleshooting

### Common Issues:

**1. Build Failures**
- Check `package.json` and `requirements.txt` syntax
- Verify all source files are committed to Git

**2. Runtime Errors**
- Check Cloud Run logs in Console
- Verify PORT 8080 is exposed
- Check file permissions in Dockerfile

**3. Performance Issues**
- Increase CPU/memory limits in `app.yaml`
- Check video processing timeouts
- Monitor resource usage

### Debug Commands:
```bash
# View logs
gcloud logs read "resource.type=cloud_run_revision"

# Check service status
gcloud run services describe penguinblur

# Test health endpoint
curl https://your-service-url/health
```

## 🛠️ Customization

### Resource Limits (in app.yaml):
```yaml
resources:
  limits:
    cpu: "2"        # Increase for faster processing
    memory: "4Gi"   # Increase for larger videos
```

### Environment Variables:
```yaml
env:
- name: NODE_ENV
  value: "production"
- name: FILE_EXPIRY_TIME
  value: "1800"     # 30 minutes
```

## 🎉 Success!

Your PenguinBlur app is now running in the cloud! Users can:
- Upload videos through the beautiful React interface
- Apply penguin face blur with adjustable intensity
- Download their privacy-protected videos
- All with zero local software installation!

## 🐧 Next Steps

1. **Add your own domain**: Configure custom domain in Cloud Run
2. **Set up monitoring**: Google Cloud monitoring and alerting
3. **Add authentication**: Firebase Auth or Google Identity
4. **Optimize costs**: Set budget alerts and usage limits

---

**Enjoy your cloud-native PenguinBlur app!** 🐧✨
