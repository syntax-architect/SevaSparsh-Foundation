# SevaSparsh Foundation Donation Platform

A modern, accessible, and secure donation platform built for the SevaSparsh Foundation (National Elder Care & Mobility Mission). This project consists of a React frontend and an Express.js backend, integrated with Supabase for data persistence and Razorpay for payment processing.

## 🚀 Tech Stack

### Frontend
- **Framework:** React 18 powered by Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React & Google Material Symbols
- **Payments:** Razorpay Checkout JS

### Backend
- **Framework:** Node.js with Express
- **Database / BaaS:** Supabase (PostgreSQL)
- **Payments:** Razorpay Node SDK
- **AI Integration:** Groq SDK (for generating intelligent mock donations and chat)
- **Security & Validation:** Helmet, express-rate-limit, Zod

## 🛠 Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- A Supabase account and project
- A Razorpay account (Test mode keys)
- A Groq API key

## ⚙️ Environment Variables

### Backend (`/backend/.env`)

Create a `.env` file in the `backend` directory with the following keys:

```env
# Server
PORT=5000
FRONTEND_URL=http://localhost:5173

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret

# Groq
GROQ_API_KEY=your_groq_api_key
```

*(Note: Supabase requires a `donations` table. See backend code or database migrations for schema requirements).*

## 🏃‍♂️ How to Run the Project

### 1. Start the Backend

```bash
cd backend
npm install
npm run dev
```
The backend server will start on `http://localhost:5000` (or your configured `PORT`).

### 2. Start the Frontend

In a new terminal window:

```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:5173`.

## 🧪 Testing

This project includes unit and integration testing.

### Backend Tests (Jest & Supertest)
```bash
cd backend
npm test
```

## 🔐 Security Features

- **Rate Limiting:** IP-based rate limiting on donation creation and chat endpoints to prevent abuse.
- **Payload Validation:** Strict schema validation using Zod for all incoming request bodies.
- **Helmet:** Secure HTTP headers configured via Helmet.
- **Signature Verification:** Secure HMAC SHA256 signature verification for Razorpay webhooks/callbacks to ensure payment authenticity.
