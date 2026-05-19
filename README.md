# 🚀 Smart Leads Dashboard

A full-stack Lead Management Dashboard built with the MERN stack + TypeScript.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, TailwindCSS |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| DevOps | Docker + Docker Compose |

## Features

- ✅ JWT Authentication (Register / Login / Protected Routes)
- ✅ Full Lead CRUD (Create, Read, Update, Delete)
- ✅ Role-Based Access Control (Admin / Sales)
- ✅ Advanced Filtering (Status, Source, Search)
- ✅ Debounced Search
- ✅ Backend Pagination (10 per page)
- ✅ Sort by Latest / Oldest
- ✅ CSV Export
- ✅ Dark Mode
- ✅ Responsive Design
- ✅ Loading & Empty States
- ✅ Form Validation
- ✅ RESTful API with proper status codes

## Project Structure

```
smart-leads-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, error, validation
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routers
│   │   ├── types/          # TypeScript interfaces
│   │   ├── validators/     # express-validator rules
│   │   └── index.ts        # App entry point
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios API calls
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── store/          # Auth context
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Helper functions
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

## API Documentation

### Auth Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register new user | ❌ |
| POST | /api/auth/login | Login | ❌ |
| GET | /api/auth/me | Get current user | ✅ |

### Lead Endpoints

| Method | Endpoint | Description | Auth | Admin Only |
|--------|----------|-------------|------|------------|
| GET | /api/leads | Get all leads (paginated + filters) | ✅ | ❌ |
| GET | /api/leads/:id | Get single lead | ✅ | ❌ |
| POST | /api/leads | Create lead | ✅ | ❌ |
| PUT | /api/leads/:id | Update lead | ✅ | ❌ |
| DELETE | /api/leads/:id | Delete lead | ✅ | ✅ |
| GET | /api/leads/export | Export CSV | ✅ | ❌ |
| GET | /api/leads/stats | Dashboard stats | ✅ | ❌ |

### Query Parameters (GET /api/leads)

```
?status=New|Contacted|Qualified|Lost
&source=Website|Instagram|Referral
&search=john
&sort=latest|oldest
&page=1
&limit=10
```

## Setup Instructions

### Option A — Manual Setup (Recommended for development)

#### Prerequisites
- Node.js v18+
- MongoDB running locally (or MongoDB Atlas URI)

#### Step 1 — Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev
```

Backend runs at: http://localhost:5000

#### Step 2 — Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm start
```

Frontend runs at: http://localhost:3000

---

### Option B — Docker Setup

#### Prerequisites
- Docker Desktop installed and running

```bash
# From the project root
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MongoDB: localhost:27017

---

## Environment Variables

### Backend `.env`

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-leads
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### Frontend `.env`

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## RBAC (Role-Based Access Control)

| Action | Admin | Sales |
|--------|-------|-------|
| View all leads | ✅ | ❌ (own only) |
| Create lead | ✅ | ✅ |
| Edit lead | ✅ | ✅ (own only) |
| Delete lead | ✅ | ❌ |
| Export CSV | ✅ | ✅ |
| View dashboard stats | ✅ | ✅ (own) |
