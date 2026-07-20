# 🖥️ BuildWise AI

> An AI-powered PC Builder & Compatibility Checker built with Next.js, Express.js, MongoDB, Better Auth, and Google Gemini AI.

BuildWise AI helps users build the perfect custom PC within their budget. Users can browse components, generate AI-recommended builds, check hardware compatibility, save builds, manage favorites, and chat with an AI assistant for personalized recommendations.

---

## ✨ Features

### 👤 Authentication
- Email & Password Authentication
- Google Sign-In
- JWT & Better Auth
- Role-based Authorization (User/Admin)

### 🛒 Product Marketplace
- Browse PC Components
- Search & Filter Products
- Category & Brand Filtering
- Product Details
- Ratings & Reviews
- Wishlist/Favorites

### 🤖 AI Features
- AI PC Build Generator
- Smart Compatibility Checker
- AI Chat Assistant
- AI Build Reasoning
- Saved AI Conversations

### 💻 Build Management
- Create Custom Builds
- Save Favorite Builds
- Edit/Delete Builds
- Build History

### ⭐ Reviews
- Product Ratings
- User Reviews
- Average Rating Calculation

### 📊 Admin Dashboard
- Dashboard Analytics
- Product Management
- User Management
- Build Statistics
- AI Usage Statistics

---

# 🚀 Tech Stack

## Frontend
- Next.js
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React
- React Query
- React Hook Form
- Zod

## Backend
- Node.js
- Express.js
- TypeScript
- Better Auth
- JWT

## Database
- MongoDB
- Mongoose

## AI
- Groq API

---

# 🎨 UI Highlights

- Premium Dark-first Design
- Responsive Layout
- Glassmorphism Navbar
- Smooth Animations
- Skeleton Loading
- Toast Notifications
- Gradient Components
- AI Recommendation Cards

---

# 📂 Project Structure

```
buildwise-ai/
│
├── apps/
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── styles/
│   │
│   └── api/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── server.ts
│
└── README.md
```

---

# 📦 Main Modules

## Authentication
- Register
- Login
- Google Login
- Logout
- Current User
- Refresh Token

## Products
- CRUD Products
- Search
- Filter
- Categories
- Product Details

## Reviews
- Create Review
- Delete Review
- Product Ratings

## Favorites
- Add to Wishlist
- Remove from Wishlist
- User Favorites

## PC Builds
- Create Build
- Save Build
- Edit Build
- Delete Build
- View Build

## AI
- Generate Build
- Compatibility Check
- AI Chat
- Conversation History

## Admin
- Dashboard
- Manage Users
- Manage Products
- Statistics

---

# 🤖 AI Capabilities

### AI Build Generator

Generate a complete PC build based on:

- Budget
- Purpose
- Preferred Brand

Supported purposes:

- Gaming
- Programming
- Video Editing
- Office Work

---

### Compatibility Checker

Checks compatibility between:

- CPU
- Motherboard
- GPU
- RAM
- PSU
- Storage
- Cooler
- Case

Returns:

- Compatible
- Warning
- Incompatible

Along with suggested alternatives.

---

### AI Chat Assistant

Users can ask questions like:

- Best Gaming PC under $1000
- Which GPU is better?
- Intel vs AMD?
- Is this PSU enough?
- Recommend an upgrade

---

# 🔐 Authentication Roles

## Guest

- Browse Products
- View Product Details
- Limited AI Usage

## User

- Save Builds
- Wishlist
- Reviews
- Unlimited Personal Dashboard
- AI Chat
- Compatibility Checker

## Admin

- Manage Products
- Manage Users
- Dashboard Analytics
- Manage Platform

---

# 📡 REST API

```
/api/v1/auth
/api/v1/products
/api/v1/reviews
/api/v1/favorites
/api/v1/builds
/api/v1/ai
/api/v1/admin
```

---

# ⚙️ Environment Variables

Create a `.env` file:

```env
MONGODB_URI=

BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GEMINI_API_KEY=

NEXT_PUBLIC_API_BASE_URL=

JWT_SECRET=

NODE_ENV=development
```

---

# 🛠️ Installation

Clone the repository

```bash
git clone https://github.com/AtikHasanSarker/buildwise-ai-client.git
```

Move into the project

```bash
cd buildwise-ai
```

Install dependencies

```bash
npm install
```

Run the development server

```bash
npm run dev
```

Backend

```bash
npm run server
```

---

# 🎯 Future Improvements

- AI Price Prediction
- Benchmark Comparison
- FPS Estimator
- Community Build Sharing
- Build Export (PDF)
- Price Drop Alerts
- Multi-language Support

---

# 📸 Screenshots

> Add application screenshots here.

- Home Page
- Product Listing
- Product Details
- AI Build Generator
- Compatibility Checker
- Dashboard

---


---

# 👨‍💻 Author

**Atik Hasan Sarker**

Department of Information Science & Library Management
Noakhali Science and Technology University

---

⭐ If you like this project, don't forget to give it a Star!