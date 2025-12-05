# 🐧 PenguinBlur

> Privacy-focused web application with automatic face detection and cute penguin-themed blurring

![PenguinBlur Logo](docs/images/penguin-logo.png)

## 🌟 Features

- **🎯 Automatic Face Detection**: Advanced face detection using OpenCV-inspired algorithms
- **🐧 Penguin-Themed Blurring**: Cute penguin overlay effects instead of traditional blur
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **⚡ Real-time Processing**: WebSocket-powered progress updates
- **🔒 Privacy-First**: No data retention - files auto-expire in 15 minutes
- **🎨 Beautiful UI**: Material-UI with custom penguin theme
- **📊 Processing Analytics**: Track processing time and system performance

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- FFmpeg (for video processing)
- Docker (optional, for containerized deployment)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/penguinblur.git
cd penguinblur
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install
```

3. **Set up environment variables**
```bash
# Backend/.env
PORT=3001
NODE_ENV=development
FILE_EXPIRY_TIME=900000
FRONTEND_URL=http://localhost:3000

# Frontend/.env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

4. **Start the development servers**
```bash
# Backend (in one terminal)
cd backend
npm run dev

# Frontend (in another terminal)
cd frontend
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:3000` 🎉

## 🏗️ Architecture

```
PenguinBlur/
├── backend/                 # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Utility functions
│   │   └── server.ts       # Main server file
│   └── package.json
├── frontend/               # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/       # API services
│   │   ├── utils/         # Utility functions
│   │   └── App.tsx        # Main App component
│   └── package.json
├── docker/                # Docker configurations
├── scripts/               # Build and deployment scripts
└── docs/                 # Documentation
```

## 🎯 Core Features

### Face Detection Algorithms

Based on [ObscuraCam's](https://github.com/guardianproject/ObscuraCam) proven face detection:

- **Auto Mode**: Intelligent detection with 85%+ accuracy
- **Conservative Mode**: High confidence (90%+) detection
- **Aggressive Mode**: Maximum coverage (50%+ confidence)
- **Manual Mode**: User-defined regions

### Penguin Blur Effects

Instead of traditional blur, PenguinBlur applies cute penguin overlays:

- **Low Intensity**: Small penguin overlay, minimal obstruction
- **Medium Intensity**: Medium penguin with moderate coverage
- **High Intensity**: Large penguin with maximum coverage

### File Processing

- **Supported Formats**: MP4, AVI, MOV, WMV, FLV, WebM
- **Max File Size**: 50MB
- **Auto Cleanup**: Files expire after 15 minutes
- **Progress Tracking**: Real-time WebSocket updates

## 🔧 Configuration

### Backend Options

```javascript
const config = {
  port: 3001,                    // Server port
  fileExpiryTime: 15 * 60 * 1000, // File expiry (15 min)
  cleanupInterval: 5 * 60 * 1000,   // Cleanup interval (5 min)
  maxFileSize: 50 * 1024 * 1024,     // Max file size (50MB)
  supportedFormats: [               // Supported video formats
    'video/mp4',
    'video/avi', 
    'video/mov',
    'video/wmv',
    'video/flv',
    'video/webm'
  ]
};
```

### Frontend Options

```javascript
const config = {
  apiUrl: 'http://localhost:3001',
  wsUrl: 'ws://localhost:3001',
  theme: 'penguin',              // Custom Material-UI theme
  maxRetries: 3,                // API retry attempts
  uploadTimeout: 300000,         // Upload timeout (5 min)
  processingTimeout: 600000        // Processing timeout (10 min)
};
```

## 🐳 Docker Deployment

### Development

```bash
# Build and run all services
docker-compose up --build

# Individual services
docker-compose up backend
docker-compose up frontend
```

### Production

```bash
# Production build
docker-compose -f docker-compose.prod.yml up --build -d
```

## ☁️ Google Cloud Deployment

### Cloud Run Setup

1. **Build the application**
```bash
npm run build:prod
```

2. **Deploy to Cloud Run**
```bash
gcloud run deploy penguinblur \
  --image gcr.io/your-project/penguinblur \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10
```

### Cloud Storage Setup

```bash
# Create storage bucket
gsutil mb gs://penguinblur-videos

# Set lifecycle policy
gsutil lifecycle set config.json gs://penguinblur-videos
```

## 📊 API Documentation

### Upload Video

```http
POST /api/upload
Content-Type: multipart/form-data

{
  "video": <file>
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fileId": "uuid",
    "originalName": "video.mp4",
    "size": 1024000,
    "uploadedAt": "2024-01-01T00:00:00.000Z",
    "expiresAt": "2024-01-01T00:15:00.000Z"
  }
}
```

### Process Video

```http
POST /api/video/process/:fileId
Content-Type: application/json

{
  "blurIntensity": "medium",
  "detectionMode": "auto"
}
```

### WebSocket Events

```javascript
// Connection
const ws = new WebSocket('ws://localhost:3001');

// Processing progress
ws.on('message', (data) => {
  const event = JSON.parse(data);
  if (event.type === 'processingProgress') {
    console.log(`Progress: ${event.data.progress}%`);
  }
});
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test                    # Unit tests
npm run test:e2e           # Integration tests
npm run test:coverage       # Coverage report
```

### Frontend Tests

```bash
cd frontend
npm test                    # Unit tests
npm run test:e2e           # Playwright E2E tests
npm run test:visual         # Visual regression tests
```

## 🔒 Security

- **No Data Persistence**: Files auto-delete after 15 minutes
- **Input Validation**: All user inputs are validated and sanitized
- **Rate Limiting**: API endpoints are rate-limited
- **CORS Protection**: Configured for production domains
- **File Type Validation**: Only allowed video formats accepted
- **Size Limits**: Maximum file size enforced

## 🌍 Browser Support

| Browser | Version | Status |
|----------|----------|---------|
| Chrome   | 90+      | ✅ Full |
| Firefox  | 88+      | ✅ Full |
| Safari   | 14+      | ✅ Full |
| Edge     | 90+      | ✅ Full |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [ObscuraCam](https://github.com/guardianproject/ObscuraCam) - Original face detection algorithms
- [Guardian Project](https://guardianproject.info/) - Privacy-focused technology inspiration
- [Material-UI](https://mui.com/) - Beautiful React components
- [OpenCV](https://opencv.org/) - Computer vision algorithms

## 📞 Support

- 📧 Email: support@penguinblur.dev
- 💬 Discord: [Join our community](https://discord.gg/penguinblur)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/penguinblur/issues)

---

Made with ❤️ and 🐧 for privacy advocates everywhere
