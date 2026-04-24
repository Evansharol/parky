# Parky – Airbnb for Parking Spaces 🚗

Parky is a premium full-stack MERN application that allows users to find and book parking spaces, or list their own spare spots to earn money. It features a rule-based AI layer for smart search, pricing recommendations, and fraud detection.

## ✨ Features

- **Customer Module**: Search with Google Maps, AI smart search, book slots, and view history.
- **Host Module**: List spaces, AI price suggestions, manage booking requests, and earnings dashboard.
- **Admin Module**: KPI dashboard, listing approvals, booking monitor, and user management.
- **AI Features**: 
  - Availability prediction based on historical patterns.
  - Smart pricing recommendations based on nearby listings.
  - Fraud detection for suspicious booking signals.
  - NLP-style smart search parsing.

## 🚀 Tech Stack

- **Frontend**: React, Tailwind CSS, Recharts, Lucide Icons.
- **Backend**: Node.js, Express, JWT, Multer.
- **Database**: MongoDB (Mongoose).
- **Maps**: React Google Maps API.

## 🛠️ Setup Instructions

### 1. Prerequisites
- Node.js installed.
- MongoDB installed and running locally (or Atlas URI).

### 2. Backend Setup
1. Open a terminal in `backend/`
2. Run `npm install`
3. The `.env` file is already created with default local settings.
4. Run `node seeder.js` to populate the database with demo accounts and listings.
5. Run `npm run dev` to start the server at `http://localhost:5000`

### 3. Frontend Setup
1. Open a terminal in `frontend/`
2. Run `npm install`
3. Run `npm run dev` to start the development server.
4. Visit `http://localhost:5173`

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@parky.com` | `admin123` |
| **Host** | `host@parky.com` | `password123` |
| **Customer** | `customer@parky.com` | `password123` |

## 📁 Folder Structure

```
parky/
├── backend/
│   ├── controllers/      # API Logic
│   ├── models/           # DB Schemas
│   ├── routes/           # API Endpoints
│   ├── services/         # AI Logic
│   └── server.js         # Entry Point
└── frontend/
    ├── src/
    │   ├── api/          # Axios Layer
    │   ├── components/   # UI Components
    │   ├── context/      # Auth State
    │   └── pages/        # All Modules (Customer, Host, Admin)
    └── tailwind.config.js # Design System
```
