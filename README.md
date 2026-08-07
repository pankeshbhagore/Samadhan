<div align="center">
  
# 🏛️ Samadhan (समाधान)
**The All-India Next-Generation Citizen Grievance Dashboard**

[![React](https://img.shields.io/badge/React-18-blue.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green.svg?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248.svg?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-Integrated-black.svg?style=for-the-badge&logo=openai)](https://openai.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

*A deeply integrated, multi-tenant e-governance platform scaling across all 36 Indian States and Union Territories.*

</div>

---

## 🌟 Overview

**Samadhan** is a state-of-the-art grievance management platform built to bridge the gap between citizens and the government. Moving away from siloed state infrastructure, Samadhan provides a **unified nationwide architecture**. It dynamically routes, filters, and isolates data based on the user's jurisdiction—giving local officers focused task lists, State Chief Ministers high-level insights, and the Central Super Admin a bird's-eye view of the entire country.

## ✨ Key Features

### 🌍 Multi-State Architecture & Hierarchical Filtering
- Supports all 36 Indian States and UTs. Data is strictly isolated using dynamic MongoDB query middleware.
- **Instant Hierarchical Search:** Drill down instantly from `State ➔ Department ➔ Officer` across the entire application to find exact data points.

### 🔐 Role-Based Access Control (RBAC)
- **All-India Super Admin:** Nationwide overview; can view and filter metrics across any state.
- **Chief Minister (CM) / State Admin:** Exclusive dashboard restricted strictly to their state's data.
- **Department Head:** Analytics and tracking isolated to their specific department within their state.
- **Officer (Employee):** Actionable task list of grievances directly assigned to them.
- **Citizen:** A private portal to submit, track, and verify resolution of personal grievances.

### 🤖 AI-Powered Governance (OpenAI Integration)
- **Auto-Classification:** Automatically assigns categories and priorities to incoming complaints.
- **Sentiment & Fraud Analysis:** Flags highly frustrated citizens and detects duplicate complaints or fake images.
- **Anomaly Detection:** Constantly monitors officer performance to flag false closures, departmental bottlenecks, and SLA breaches.
- **Auto-Assignment:** Routes tickets to available officers based on bandwidth and historical resolution speed.

### 📊 Deep Analytics & Performance Tracking
- **Officer Analytics Dashboard:** Track individual officer workload capacity, resolution times, and AI-flagged behavioral anomalies.
- **Department Insights:** Monitor total caseloads, SLA compliance, and cross-departmental bottlenecks.
- **Citizen Verification:** Prevents "false closures" by forcing citizens to verify if an issue was actually fixed before it is marked as resolved.

### 🎨 Premium Glassmorphism UI
- A sleek, modern, and responsive interface featuring stunning visual depth, smooth micro-animations, and dynamic theming.
- **Geospatial Hotspot Mapping:** Real-time interactive maps using Leaflet to visualize grievance clusters geographically.

---

## 🏗️ Architecture Flow

```mermaid
graph TD
    Citizen([Citizen]) -->|Submits Grievance| Frontend
    Frontend[React Frontend (Glassmorphism)] <-->|REST API| Backend[Node.js / Express Backend]
    
    Backend -->|Stores Data| DB[(MongoDB)]
    Backend <-->|AI Classification & Insights| OpenAI[OpenAI API]
    
    DB --> Filter[Dynamic State Filter Middleware]
    
    Filter -->|Filtered Data| Officer([Local Officer])
    Filter -->|Aggregated Dept Data| DeptHead([Department Head])
    Filter -->|Aggregated State Data| CM([Chief Minister])
    Filter -->|All India Data| SuperAdmin([Super Admin])
```

---

## 🚀 Tech Stack

### Frontend
- **Framework:** React 18
- **Routing:** React Router v6
- **Styling:** Vanilla CSS (Glassmorphism, CSS Variables, Custom Animations)
- **Data Visualization:** Recharts, Leaflet (React-Leaflet)
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT) & bcrypt
- **Real-time & AI:** Socket.io, OpenAI API SDK

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Running locally or MongoDB Atlas URI)
- OpenAI API Key (For AI classification and anomaly features)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/pankeshbhagore/Samadhan.git
cd Samadhan

# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/samadhan
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
OPENAI_API_KEY=sk-your-openai-key
```

### 3. Database Seeding
Populate the database with a massive generated dataset across all 36 states to immediately test the dashboards and RBAC logic.
```bash
cd backend
npm run seed
```

### 4. Run the Application
Start the backend and frontend development servers.
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm start
```

Visit `http://localhost:3000` in your browser.

---

## 📁 Project Structure

```text
Samadhan/
├── backend/                  # Node.js + Express Backend
│   ├── controllers/          # Business logic (complaints, users, auth, analytics)
│   ├── middleware/           # RBAC, State filtering, Auth protection
│   ├── models/               # Mongoose schemas (Complaint, User, Department, etc.)
│   ├── routes/               # API endpoint definitions
│   ├── services/             # OpenAI, Redis, Notification, Anomaly logic
│   └── server.js             # Entry point
└── frontend/                 # React Frontend
    ├── public/               
    └── src/
        ├── components/       # Reusable UI components (Modals, Skeletons, Map)
        ├── contexts/         # React Context (Auth)
        ├── pages/            # Views (Dashboards, Complaints, Officers, Analytics)
        ├── services/         # Axios API clients
        ├── utils/            # Helpers, State configs, CSV Export
        └── index.css         # Global Glassmorphism design system
```

---

## 🔑 Demo Credentials & Massive Scale

The application includes a powerful bulk-seeder designed to demonstrate a true national-scale deployment.

**By the numbers (Seeded Data):**
- **36** States & Union Territories
- **10** Unique Departments (Roads, Water, Sanitation, Electricity, Traffic, Environment, Parks, Building, Health, Transport)
- **1** Chief Minister per state
- **10** Department Heads per state
- **50** Dedicated Officers per state (5 for every single department)
- **150** Complaints per state randomly distributed among citizens and officers
- **Total:** ~2,500 active users and 5,400 complaints nationwide!

### 3-Tier Dynamic Login Hierarchy
To navigate this massive dataset, the login page features a **3-Tier Quick Login** interface. You can dynamically select:
1. **State** (e.g., Maharashtra)
2. **Department** (e.g., Water Board)
3. **Officer ID** (1 through 5)

Clicking the Quick Login buttons will automatically compute the correct email and log you into that exact jurisdiction.

*Default password for all seeded accounts is:* `password123`

You can manually login using these seeded emails:
- **Super Admin:** `admin@samadhan.gov.in`
- **Chief Minister (MH):** `cm@mh.samadhan.gov.in`
- **Dept Head (Water, MH):** `dh.water@mh.samadhan.gov.in`
- **Officer (Roads, MH):** `officer1.roads@mh.samadhan.gov.in`
- **Citizen (MH):** `citizen1@mh.example.com`

---

## 🛡️ Security & Access Control

Samadhan employs a strict `stateFilter.js` middleware at the Mongoose query level. This ensures that a Chief Minister querying `/api/complaints` automatically has `{ state: 'MH' }` injected into their query, completely eliminating the risk of data bleeding between jurisdictions regardless of frontend bugs. Furthermore, AI anomalies and officer analytics enforce these exact same boundaries.

---

<div align="center">
  <i>Built with ❤️ for a better, more connected India.</i>
</div>
