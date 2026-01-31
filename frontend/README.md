# ATS Pro - Frontend

AI-Powered Applicant Tracking System built with React, Vite, and Tailwind CSS.

## 🚀 Features

- **Authentication**: Login/Register with JWT
- **Dashboard**: Real-time metrics with interactive charts
- **Job Management**: Create, edit, and manage job postings
- **Candidate Tracking**: Review applications with AI-powered analysis
- **Interview Recording**: Browser-based audio recording with AI feedback
- **Public Application Form**: Candidate-facing application portal
- **Responsive Design**: Mobile-first, works on all devices

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

## 🛠️ Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Create environment file:**
```bash
cp .env.example .env
```

3. **Update environment variables:**
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=ATS Pro
```

## 🏃 Running Locally

**Development server:**
```bash
npm run dev
```

This will start the development server at `http://localhost:5173`

**Build for production:**
```bash
npm run build
```

**Preview production build:**
```bash
npm run preview
```

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   ├── layout/      # Layout components (Navbar, etc.)
│   │   └── ProtectedRoute.jsx
│   ├── context/         # React Context (Auth)
│   │   └── AuthContext.jsx
│   ├── pages/           # Page components
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Profile.jsx
│   │   ├── PostedJobs.jsx
│   │   ├── JobDetail.jsx
│   │   ├── CandidateDetail.jsx
│   │   └── ApplicationForm.jsx
│   ├── App.jsx          # Main app component with routing
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── package.json         # Dependencies
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── vercel.json          # Vercel deployment config
```

## 🎨 Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Charts**: Recharts
- **State Management**: React Context API
- **HTTP Client**: Fetch API

## 🔑 Key Pages

### 1. Login (`/`)
- User authentication
- Registration with company setup
- Form validation

### 2. Dashboard (`/dashboard`)
- Metrics overview (Jobs, Candidates, Match Score)
- Applications timeline chart
- Status distribution pie chart
- Top jobs bar chart

### 3. Profile (`/profile`)
- Company information management
- HR team management
- Add/remove team members

### 4. Posted Jobs (`/jobs`)
- Job listing grid
- Create new job (3-step wizard)
- Job status management (Active/Paused/Closed)
- Share application form

### 5. Job Detail (`/jobs/:jobId`)
- Job information
- Candidates list
- Bulk approve/reject
- Download CVs
- Status management

### 6. Candidate Detail (`/candidates/:candidateId`)
- Personal information
- CV viewer
- AI analysis (match score, strengths, gaps)
- Interview history
- Audio feedback recording
- AI-generated email responses

### 7. Application Form (`/apply/:formUrl`)
- Public-facing form (no login required)
- Company branding
- File upload (CV)
- Dynamic questions
- Form validation

## 🔐 Authentication

The app uses JWT tokens stored in localStorage:

```javascript
// Login
const { token, user } = await login(email, password);
localStorage.setItem('token', token);

// API Requests
headers: {
  'Authorization': `Bearer ${token}`
}

// Logout
localStorage.removeItem('token');
```

## 🎯 API Integration

All API calls are made to the backend server specified in `VITE_API_URL`:

```javascript
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/endpoint`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## 📱 Responsive Design

The application uses Tailwind's responsive breakpoints:

- **Mobile**: 320px - 639px
- **Tablet**: 640px - 1023px
- **Desktop**: 1024px+

All components are mobile-first and adapt to screen size.

## 🎤 Audio Recording

The Interview Recorder uses the browser's MediaRecorder API:

```javascript
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const mediaRecorder = new MediaRecorder(stream);
```

**Requirements:**
- HTTPS in production (required for microphone access)
- Modern browser with MediaRecorder support
- User permission for microphone

## 🚀 Deployment

### Deploy to Vercel

1. **Connect your GitHub repository to Vercel**

2. **Configure environment variables in Vercel dashboard:**
   - `VITE_API_URL`: Your backend API URL

3. **Deploy:**
```bash
vercel --prod
```

Vercel will automatically detect the Vite configuration and build the project.

### Deploy to Other Platforms

**Build the project:**
```bash
npm run build
```

**Serve the `dist` folder** with any static hosting service:
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Firebase Hosting

## 🧪 Testing

**Run linter:**
```bash
npm run lint
```

## 🐛 Troubleshooting

### Port already in use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Build errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### API connection issues
- Check `VITE_API_URL` in `.env`
- Ensure backend server is running
- Check CORS configuration on backend

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000` |
| `VITE_APP_NAME` | Application name | `ATS Pro` |
| `VITE_MAX_FILE_SIZE` | Max CV upload size (bytes) | `5242880` |
| `VITE_MAX_RECORDING_TIME` | Max recording time (seconds) | `30` |

## 🔒 Security

- All passwords are hashed before sending to backend
- JWT tokens expire after 24 hours
- File upload validation (type and size)
- Input sanitization on all forms
- HTTPS required in production
- Protected routes require authentication

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📧 Support

For issues or questions, please open a GitHub issue.

---

Built with ❤️ using React and Tailwind CSS
