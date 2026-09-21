# 🎵 MelodyHub AI: Intelligent Full-Stack Audio Streaming Platform

![React](https://img.shields.io/badge/Frontend-React.js-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Groq](https://img.shields.io/badge/AI_Engine-Groq_LPU-f37626?style=for-the-badge)

## 📖 1. Project Abstract
**MelodyHub AI** is an advanced, full-stack MERN (MongoDB, Express, React, Node.js) music streaming application designed to demonstrate modern web engineering, real-time audio handling, and the integration of Artificial Intelligence and Machine Learning. 

Unlike traditional CRUD-based streaming platforms, MelodyHub implements a **Hybrid Artificial Intelligence Architecture**. It combines edge-inference Generative AI for natural language processing and a native, mathematically weighted **User-Based Collaborative Filtering** machine learning model for personalized content curation. This project serves as a comprehensive capstone/thesis implementation for a Master of Computer Applications (MCA) degree.

---

## ✨ 2. Core Features & Capabilities

### 🧠 A. Machine Learning: Hybrid Recommendation Engine
- **User-Based Collaborative Filtering:** Calculates cosine-like similarity weights between users based on shared listening history. If User A and User B share similar tracks, the engine mathematically scores and recommends User A's unique tracks to User B.
- **Content-Based Fallback:** Dynamically extracts metadata (genre tags) from a user's liked library to recommend unplayed matching tracks if collaborative data is insufficient.
- **Cold-Start Handling:** Automatically serves global trending hits to brand-new users until their first interaction populates the ML weights.

### 🤖 B. Generative AI (Powered by Groq `qwen3.8-27b`)
- **MR.Alok Chatbot:** A custom-branded conversational agent capable of zero-shot music preference mapping and real-time natural language curation.
- **"Did You Mean?" Search Typo-Fixer:** Silently intercepts failed database queries (e.g., misspelled song names), uses the LLM to instantly correct the typo, and automatically re-queries the MongoDB database.
- **Magic Playlist Namer:** AI-driven context extractor that turns blank or simple inputs into aesthetic playlist names.

### 💻 C. Full-Stack Engineering
- **Secure Authentication:** JWT (JSON Web Tokens) based auth with encrypted passwords and protected API routes.
- **Admin Dashboard:** Role-based access control allowing administrators to upload audio binaries and cover art via `Multer`, and manage the global catalog.
- **Premium User Profile:** Editable user profiles with interactive "Coming Soon" premium subscription modals.
- **Real-Time Audio Player:** Persistent, gapless audio playback state managed globally via React Context.

---

## 🏗️ 3. System Architecture & Tech Stack

| Domain | Technology / Tool | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React.js, CSS3, Lucide Icons | Component-based UI, State Management (Context API) |
| **Backend** | Node.js, Express.js | RESTful API creation, routing, middleware processing |
| **Database** | MongoDB, Mongoose | NoSQL document storage for Users, Songs, and relations |
| **Gen AI API** | Groq SDK (`qwen/qwen3.8-27b` model)| Lightning-fast LLM inference for chatbot & search fixing |
| **File Storage** | Multer | Disk storage buffer for MP3 and Image file uploads |
| **Security** | bcryptjs, jsonwebtoken, CORS | Password hashing, session tokenization, cross-origin security |

---

## ⚙️ 4. Prerequisites
Before running this project locally, ensure you have the following installed:
1. **Node.js** (v18.0.0 or higher)
2. **MongoDB** (Local instance running on default port 27017, or a MongoDB Atlas URI)
3. **Groq API Key** (Free developer key from console.groq.com)

---

## 🚀 5. Step-by-Step Installation & Setup

### Step 1: Clone the Repository
```bash
git clone [https://github.com/yourusername/melodyhub-ai.git](https://github.com/yourusername/melodyhub-ai.git)
cd melodyhub-ai

MelodyHub-AI/
│
├── client/                     # React Frontend
│   ├── public/                 
│   └── src/
│       ├── components/         # Reusable UI (SongCard, Player, Chatbot)
│       ├── context/            # React Context (AuthContext, PlayerContext)
│       ├── pages/              # Views (Home, Profile, Login, AdminDashboard)
│       ├── services/           # Axios API HTTP interceptors
│       └── App.js              # Main application router
│
└── server/                     # Node.js/Express Backend
    ├── controllers/            # Route logic (userController, songController)
    │   └── songController.js   # Contains the ML Collaborative Filtering Engine
    ├── middleware/             # Custom middlewares
    │   ├── authMiddleware.js   # JWT verification & Admin checks
    │   └── uploadMiddleware.js # Multer config for MP3/JPEG handling
    ├── models/                 # Mongoose Schemas (User.js, Song.js)
    ├── routes/                 # API endpoint definitions
    │   ├── aiRoutes.js         # Groq LLM integration routes
    │   ├── songRoutes.js       # CRUD and Recommendation routes
    │   └── userRoutes.js       # Auth and Profile routes
    ├── uploads/                # Local storage for Multer (audio/images)
    └── server.js               # Entry point and Express configuration

    📡 7. Core API Endpoints
🔐 Auth & Users
POST /api/users/register - Register a new user

POST /api/users/login - Authenticate user & get token

PUT /api/users/profile - Update user name/email (Protected)

GET /api/users/liked - Get user's liked library (Protected)

🎵 Songs & Machine Learning
GET /api/songs/recommendations - Get User-Based Collaborative Filtering mix

GET /api/songs/search?q=query - Search with AI typo-correction fallback

POST /api/songs/like - Toggle like/unlike status (Protected)

POST /api/songs - Upload new audio/image files (Admin Only via Multer)

🤖 Generative AI (Groq)
POST /api/ai/chat - Interact with MR.Alok AI DJ

GET /api/ai/magic-name - Generate aesthetic playlist names

🔮 8. Future Enhancements (Scope for scaling)
Cloud Object Storage: Migrate Multer local disk storage to AWS S3 or Cloudinary for distributed, scalable media hosting.

WebSocket Integration: Implement Socket.io for real-time collaborative playlist editing among users.

Web Audio API: Add visualizers and real-time EQ settings to the frontend player.

OAuth 2.0: Introduce Google and GitHub social logins.