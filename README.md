# ProofChain 📋

**ProofChain** is a web-based application that solves warranty management problems by helping users store, organize, and track all their purchase receipts and warranties in one place.

## 🎯 Problem Statement

People often miss out on warranty claims because they:

- Can't find physical receipts when needed
- Don't track warranty expiration dates
- Don't have quick access to manufacturer/store contact information
- Don't remember warranty terms and conditions

## ✨ Solution

ProofChain allows users to:

- **Upload receipts** via photos or PDFs
- **Automatic extraction** of product info using OCR + AI
- **Smart search** with keyword-based filtering
- **Warranty tracking** with automated reminders
- **Quick access** to manufacturer and store contact information
- **Gmail integration** to auto-scan purchase invoices

## 🏗️ Project Structure

```
proofchain/
├── server/              # Node.js + Express backend
│   ├── src/
│   │   ├── config/      # Database and service configs
│   │   ├── controllers/ # Route handlers
│   │   ├── middleware/  # Auth and error handling
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # External API integrations
│   │   ├── utils/       # Helper functions
│   │   └── server.js    # Main server file
│   ├── package.json
│   └── .env.example
│
└── client/              # React + Vite frontend
    ├── src/
    │   ├── components/  # React components
    │   ├── pages/       # Page components
    │   ├── context/     # Auth context
    │   ├── utils/       # Helper functions
    │   ├── App.jsx
    │   └── main.jsx
    ├── public/
    ├── vite.config.js
    ├── package.json
    └── .env
```

## 🔧 Tech Stack

### Backend

- **Node.js** with Express.js
- **MongoDB** (NoSQL database via MongoDB Atlas)
- **Supabase** (File storage for bill images)
- **Google Cloud Vision** (OCR - Extract text from images)
- **Groq API** (AI - Process extracted text, generate keywords)
- **JWT** for authentication
- **Node-cron** for scheduled reminders
- **Brevo** for SMS/Email notifications

### Frontend

- **React 18** with Vite
- **React Router** for navigation
- **Axios** for API calls
- **Tailwind CSS** for styling
- **Lucide React** for icons

## 📦 Setup Instructions

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas account
- Supabase account
- Google Cloud Vision API key
- Groq API key
- Brevo API key (optional, for reminders)

### 1. Clone and Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Backend Configuration

Create `server/.env` file:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_BUCKET=bills

# Google Cloud Vision
GOOGLE_CLOUD_KEY_FILE=path_to_your_google_cloud_key_file.json

# Groq API
GROQ_API_KEY=your_groq_api_key

# JWT
JWT_SECRET=your_secret_key_here

# Gmail OAuth (optional)
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
GMAIL_CALLBACK_URL=http://localhost:5000/auth/gmail/callback

# Brevo (optional)
BREVO_API_KEY=your_brevo_api_key

# Session
SESSION_SECRET=your_session_secret
```

### 3. Frontend Configuration

Create `client/.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Get API Credentials

#### MongoDB Atlas

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a cluster (free tier available)
3. Get connection string from "Connect" button

#### Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Create a storage bucket named "bills"
4. Get Project URL and Anon Key from Settings → API

#### Google Cloud Vision

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable Vision API
3. Create a service account and download JSON key file
4. Set `GOOGLE_CLOUD_KEY_FILE` to point to this file

#### Groq API

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up and get API key
3. Add to .env file

## 🚀 Running the Application

### Terminal 1: Start Backend

```bash
cd server
npm run dev
```

Server will run on `http://localhost:5000`

### Terminal 2: Start Frontend

```bash
cd client
npm run dev
```

Frontend will run on `http://localhost:3000`

## 📱 Features

### User Authentication

- ✅ Signup with email/password
- ✅ Login with email/password
- ⏳ OAuth (Gmail) - Coming soon

### Bill Management

- ✅ Upload receipt photos/PDFs
- ✅ Enter product details (name, purchase date, warranty years)
- ✅ Automatic OCR text extraction
- ✅ AI-powered keyword generation
- ✅ Store in Supabase (images) + MongoDB (metadata)

### Search & Filter

- ✅ Search by product name
- ✅ Search by keywords (features)
- ✅ Search by store name
- ✅ Filter by warranty status
- ✅ Filter by expiry date range

### Warranty Tracking

- ✅ Automatic expiry date calculation
- ✅ View bills expiring soon
- ✅ Color-coded status (Active/Expiring/Expired)
- ✅ Manual reminder date customization

### Reminders

- ⏳ Automated email reminders (30 days before expiry)
- ⏳ SMS reminders via Brevo
- ⏳ Custom reminder date preferences

### Warranty Claims

- ⏳ Quick access to manufacturer contact info
- ⏳ Store contact information from bills
- ⏳ Email template for warranty claims

### Gmail Integration

- ⏳ Connect Gmail account (OAuth)
- ⏳ Auto-scan emails for invoices
- ⏳ Extract warranty info from emails
- ⏳ Add verified bills to dashboard

## 🔑 API Endpoints

### Authentication

```
POST   /api/auth/signup         - Register new user
POST   /api/auth/login          - Login user
GET    /api/auth/me             - Get current user (protected)
PUT    /api/auth/profile        - Update profile (protected)
```

### Bills

```
POST   /api/bills/upload        - Upload bill (protected)
GET    /api/bills               - Get all bills (protected)
GET    /api/bills/:billId       - Get single bill (protected)
PUT    /api/bills/:billId       - Update bill (protected)
DELETE /api/bills/:billId       - Delete bill (protected)
GET    /api/bills/search        - Search bills (protected)
GET    /api/bills/expiring-soon - Get expiring bills (protected)
```

## 🎓 For Interview

This is a **production-ready MVP** that demonstrates:

- ✅ Full-stack MERN architecture
- ✅ Authentication with JWT
- ✅ Database design (MongoDB)
- ✅ File upload handling (Supabase)
- ✅ External API integrations (Google Vision, Groq, Brevo)
- ✅ Error handling and validation
- ✅ Clean, well-organized code
- ✅ Scalable project structure

## 🚧 Future Enhancements

- [ ] Email integration with Gmail OAuth
- [ ] SMS notifications via Brevo
- [ ] Manufacturer contact database
- [ ] Warranty claim automation
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Sharing bills with family members
- [ ] Multiple file formats support



**Built for helping people never miss warranty claims again! 🎯**
