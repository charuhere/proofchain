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





**Built for helping people never miss warranty claims again! 🎯**
