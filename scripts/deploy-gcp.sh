#!/bin/bash

# Google Cloud Deployment Script for PenguinBlur
# This script deploys PenguinBlur to Google Cloud Run and Cloud Storage

set -e

# Configuration
PROJECT_ID="your-project-id"
REGION="us-central1"
SERVICE_NAME="penguinblur"
BUCKET_NAME="penguinblur-videos"
IMAGE_NAME="penguinblur"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v gcloud &> /dev/null; then
        log_error "Google Cloud CLI (gcloud) is not installed"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v gsutil &> /dev/null; then
        log_error "Google Cloud Storage CLI (gsutil) is not installed"
        exit 1
    fi
    
    # Check if user is authenticated
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        log_error "Not authenticated with Google Cloud. Run 'gcloud auth login'"
        exit 1
    fi
    
    log_info "Prerequisites check passed ✓"
}

# Set Google Cloud project
set_project() {
    log_info "Setting project to: $PROJECT_ID"
    gcloud config set project "$PROJECT_ID"
}

# Build Docker images
build_images() {
    log_info "Building Docker images..."
    
    # Build backend image
    log_info "Building backend image..."
    docker build -f docker/Dockerfile.backend -t gcr.io/$PROJECT_ID/$IMAGE_NAME-backend:latest ../backend
    
    # Build frontend image
    log_info "Building frontend image..."
    docker build -f docker/Dockerfile.frontend -t gcr.io/$PROJECT_ID/$IMAGE_NAME-frontend:latest ../frontend
    
    log_info "Docker images built successfully ✓"
}

# Push images to Google Container Registry
push_images() {
    log_info "Pushing images to Google Container Registry..."
    
    # Configure Docker to use gcloud as a credential helper
    gcloud auth configure-docker
    
    # Push backend image
    log_info "Pushing backend image..."
    docker push gcr.io/$PROJECT_ID/$IMAGE_NAME-backend:latest
    
    # Push frontend image
    log_info "Pushing frontend image..."
    docker push gcr.io/$PROJECT_ID/$IMAGE_NAME-frontend:latest
    
    log_info "Images pushed successfully ✓"
}

# Create Cloud Storage bucket
create_storage_bucket() {
    log_info "Creating Cloud Storage bucket..."
    
    # Check if bucket already exists
    if gsutil ls -b gs://$BUCKET_NAME &> /dev/null; then
        log_warn "Bucket $BUCKET_NAME already exists, skipping creation"
    else
        gsutil mb -l $REGION gs://$BUCKET_NAME
        log_info "Bucket created successfully ✓"
    fi
    
    # Set lifecycle policy for automatic cleanup
    log_info "Setting lifecycle policy..."
    cat > lifecycle.json << EOF
{
  "rule": [
    {
      "action": {"type": "Delete"},
      "condition": {"age": 1}
    }
  ]
}
EOF
    
    gsutil lifecycle set lifecycle.json gs://$BUCKET_NAME
    rm lifecycle.json
    log_info "Lifecycle policy set successfully ✓"
}

# Deploy to Cloud Run
deploy_cloud_run() {
    log_info "Deploying to Cloud Run..."
    
    # Deploy backend service
    log_info "Deploying backend service..."
    gcloud run deploy "$SERVICE_NAME-backend" \
        --image gcr.io/$PROJECT_ID/$IMAGE_NAME-backend:latest \
        --platform managed \
        --region $REGION \
        --allow-unauthenticated \
        --memory 2Gi \
        --cpu 1 \
        --max-instances 10 \
        --min-instances 0 \
        --timeout 600 \
        --set-env-vars NODE_ENV=production,PORT=3001,FILE_EXPIRY_TIME=900000,BUCKET_NAME=$BUCKET_NAME
    
    # Get backend URL
    BACKEND_URL=$(gcloud run services describe $SERVICE_NAME-backend --region $REGION --format="value(status.url)")
    
    # Deploy frontend service
    log_info "Deploying frontend service..."
    gcloud run deploy "$SERVICE_NAME-frontend" \
        --image gcr.io/$PROJECT_ID/$IMAGE_NAME-frontend:latest \
        --platform managed \
        --region $REGION \
        --allow-unauthenticated \
        --memory 512Mi \
        --cpu 500m \
        --max-instances 10 \
        --min-instances 0 \
        --set-env-vars VITE_API_URL=$BACKEND_URL,VITE_WS_URL=ws://$BACKEND_URL
    
    FRONTEND_URL=$(gcloud run services describe $SERVICE_NAME-frontend --region $REGION --format="value(status.url)")
    
    log_info "Deployment completed successfully ✓"
    log_info "Frontend URL: $FRONTEND_URL"
    log_info "Backend URL: $BACKEND_URL"
}

# Set up monitoring
setup_monitoring() {
    log_info "Setting up monitoring..."
    
    # Create log-based metrics
    gcloud logging metrics create penguinblur_errors \
        --description="Number of errors in PenguinBlur backend" \
        --log-filter='resource.type="cloud_run_revision" AND severity="ERROR"' \
        --format="json"
    
    gcloud logging metrics create penguinblur_processing_time \
        --description="Average video processing time" \
        --log-filter='resource.type="cloud_run_revision" AND jsonPayload.message="Video processing completed successfully"' \
        --format="json"
    
    log_info "Monitoring setup completed ✓"
}

# Clean up old images
cleanup() {
    log_info "Cleaning up old Docker images..."
    
    # Remove old images from GCR (keep last 5)
    gcloud container images list-tags gcr.io/$PROJECT_ID/$IMAGE_NAME-backend --limit=100 --format="value(tags)" | \
    tail -n +6 | xargs -I {} gcloud container images delete-tag gcr.io/$PROJECT_ID/$IMAGE_NAME-backend:{}
    
    gcloud container images list-tags gcr.io/$PROJECT_ID/$IMAGE_NAME-frontend --limit=100 --format="value(tags)" | \
    tail -n +6 | xargs -I {} gcloud container images delete-tag gcr.io/$PROJECT_ID/$IMAGE_NAME-frontend:{}
    
    log_info "Cleanup completed ✓"
}

# Main deployment function
deploy() {
    log_info "Starting PenguinBlur deployment to Google Cloud Platform..."
    echo "=================================================="
    
    check_prerequisites
    set_project
    
    # Optional cleanup
    if [[ "$1" == "--cleanup" ]]; then
        cleanup
    fi
    
    build_images
    push_images
    create_storage_bucket
    deploy_cloud_run
    setup_monitoring
    
    echo "=================================================="
    log_info "Deployment completed successfully! 🐧"
    log_info "Your PenguinBlur application is now live on Google Cloud Platform"
}

# Help function
show_help() {
    echo "PenguinBlur Google Cloud Deployment Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --cleanup    Clean up old Docker images before deployment"
    echo "  --help       Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  PROJECT_ID    Google Cloud project ID"
    echo "  REGION        Deployment region (default: us-central1)"
    echo "  SERVICE_NAME   Cloud Run service name (default: penguinblur)"
    echo "  BUCKET_NAME    Cloud Storage bucket name (default: penguinblur-videos)"
}

# Parse command line arguments
case "$1" in
    --help|-h)
        show_help
        exit 0
        ;;
    --cleanup)
        deploy --cleanup
        ;;
    "")
        deploy
        ;;
    *)
        log_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac
