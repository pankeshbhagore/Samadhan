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

**Samadhan** is a state-of-the-art grievance management platform built to bridge the gap between citizens and the government. Moving away from siloed state infrastructure, Samadhan provides a **unified nationwide architecture**. It dynamically routes, filters, and isolates data based on the user's jurisdiction—giving local officers focused task lists, State Admins high-level insights, and the Central Super Admin a bird's-eye view of the entire country.

Built with a premium Glassmorphism aesthetic and dark mode capabilities, Samadhan leverages modern web technologies and Artificial Intelligence to automate classification, detect anomalies, and track officer performance in real-time.

---

## ✨ Exhaustive Feature List

### 🌍 Multi-State Architecture & Hierarchical Filtering
- **Dynamic Jurisdiction Isolation:** Utilizes MongoDB query middleware to ensure that data (complaints, users, audits) is strictly siloed by state. Officers in Maharashtra cannot view data from Karnataka.
- **National Overview:** A Super Admin can oversee all 36 States and UTs, tracking nationwide grievance trends.
- **Instant Hierarchical Search:** Drill down instantly from `State ➔ Department ➔ Officer` using the Command Palette (`Ctrl/Cmd + K`).

### 🔐 Advanced Role-Based Access Control (RBAC)
Samadhan features a strict 5-tier access hierarchy:
1. **Super Admin:** Nationwide overview; can view, filter, and manage infrastructure across any state. Has the authority to manage state-level admins.
2. **State Admin:** Dashboard restricted strictly to their state's data. They monitor departmental efficiency and citizen satisfaction at the state level.
3. **Department Head:** Analytics and tracking isolated to their specific department within their assigned state (e.g., Head of Water Board).
4. **Officer (Employee):** Actionable task list of grievances directly assigned to them. Features workload bandwidth management to prevent burnout.
5. **Citizen:** A private portal to submit complaints, track real-time status, and verify if the resolution was satisfactory.

### 🤖 AI-Powered Governance (OpenAI Integration)
- **Auto-Classification:** Incoming complaints are processed by GPT-4 to automatically categorize the issue (e.g., Water, Electricity) and assign priority (Low, Medium, High, Critical).
- **Public Sentiment Analytics:** A dedicated Sentiment Dashboard visualizes citizen frustration levels geographically, highlighting "critical wards" and plotting emotional trends based on the text of complaints.
- **Fraud & Anomaly Detection:** 
  - **False Closures:** If a citizen rejects an officer's "Resolved" status, the system flags it as a false closure and marks it for audit.
  - **Suspicious Activity:** The system flags anomalies like multiple complaints resolved in under 2 minutes.
- **Smart Auto-Assignment:** Routes tickets to available officers based on their current bandwidth (max active complaints) and historical SLA compliance.

### 📊 Deep Analytics & Performance Tracking
- **Officer Analytics Dashboard:** Track individual officer workload capacity, resolution times, and efficiency metrics.
- **Department Insights:** Monitor total caseloads, SLA compliance, and cross-departmental bottlenecks.
- **Audit & Integrity Log:** A tamper-evident log tracking every status change, assignment, and priority escalation for total transparency.

### 🎨 Premium UI & User Experience
- **Glassmorphism Design:** A sleek, modern interface featuring visual depth, frosted glass effects, and seamless micro-animations.
- **Dark/Light Mode:** A fully responsive theme engine using CSS variables for a premium experience in any lighting.
- **Interactive Geospatial Mapping:** Real-time interactive maps using Leaflet to visualize grievance clusters geographically by Ward and District.
- **Command Palette:** Press `Cmd+K` anywhere to search for specific complaints, navigate to departments, or trigger quick actions.

---

## 🏗️ Architecture & Data Flow

```mermaid
graph TD
    Citizen([Citizen]) -->|Submits Grievance| Frontend
    Frontend[React Frontend (Glassmorphism)] <-->|REST API via Axios| Backend[Node.js / Express Backend]
    
    Backend -->|Stores Data securely| DB[(MongoDB)]
    Backend <-->|AI Classification & Sentiment| OpenAI[OpenAI API]
    
    DB --> Filter[Dynamic State Filter Middleware]
    
    Filter -->|Filtered Task List| Officer([Local Officer])
    Filter -->|Aggregated Dept Data| DeptHead([Department Head])
    Filter -->|Aggregated State Data| StateAdmin([State Admin])
    Filter -->|All India Data| SuperAdmin([Super Admin])
```

---

## 🚀 Tech Stack

### Frontend Architecture
- **Core:** React 18 (Functional Components, Hooks)
- **Routing:** React Router v6
- **Styling:** Vanilla CSS 3 (CSS Variables for themes, Grid/Flexbox, Keyframe Animations)
- **State Management:** React Context API (`AuthContext`, `ThemeContext`, `SocketContext`)
- **Data Visualization:** Recharts (Interactive Pie & Bar charts), Leaflet via React-Leaflet
- **Icons & Typography:** Lucide React, Google Fonts (Inter)

### Backend Architecture
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js (RESTful architecture)
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs for password hashing
- **Real-time:** Socket.io for live notifications and alerts
- **AI Integration:** OpenAI API SDK for NLP tasks

---

## 🛠️ Getting Started & Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Running locally on default port `27017` or a MongoDB Atlas URI)
- OpenAI API Key (For AI classification, sentiment analysis, and anomaly features)
- Git

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
Create a `.env` file in the **`backend/`** directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/samadhan
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
OPENAI_API_KEY=sk-your-openai-key
```

Create a `.env` file in the **`frontend/`** directory to optimize memory during development:
```env
REACT_APP_SERVER_URL=http://localhost:5000
GENERATE_SOURCEMAP=false
NODE_OPTIONS=--max_old_space_size=4096
```

### 3. Database Seeding (Crucial for testing)
Populate the database with a massive generated dataset across all 36 states. This builds the entire hierarchical structure and generates thousands of AI-analyzed complaints to immediately test the dashboards and RBAC logic.
```bash
cd backend
npm run seed
```

### 4. Run the Application
Start the backend and frontend development servers concurrently.
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

## 🔑 Demo Credentials & Massive Scale

The application includes a powerful bulk-seeder designed to demonstrate a true national-scale deployment.

**By the numbers (Seeded Data):**
- **36** States & Union Territories
- **10** Unique Departments (Roads, Water, Sanitation, Electricity, Traffic, Environment, Parks, Building, Health, Transport)
- **1** State Admin per state
- **10** Department Heads per state
- **50** Dedicated Officers per state (5 for every single department)
- **150** Complaints per state randomly distributed among citizens and officers
- **Total:** ~2,500 active users and 5,400 complaints nationwide!

### 3-Tier Dynamic Login Hierarchy
To navigate this massive dataset without memorizing emails, the login page features a **3-Tier Quick Login** interface. You can dynamically select:
1. **State** (e.g., Maharashtra)
2. **Department** (e.g., Water Board)
3. **Officer ID** (1 through 5)

Clicking the Quick Login buttons will automatically compute the correct email and log you into that exact jurisdiction.

*Default password for all seeded accounts is:* `password123`

You can also manually login using these seeded emails:
- **Super Admin:** `admin@samadhan.gov.in`
- **State Admin (MH):** `cm@mh.samadhan.gov.in`
- **Dept Head (Water, MH):** `dh.water@mh.samadhan.gov.in`
- **Officer (Roads, MH):** `officer1.roads@mh.samadhan.gov.in`
- **Citizen (MH):** `citizen1@mh.example.com`

---

## 📚 API Endpoints Overview

Samadhan exposes a secure, RESTful API. All protected routes require a valid JWT `Bearer` token.

### Authentication (`/api/auth`)
- `POST /login` - Authenticate user & get token
- `POST /register` - Register new citizen
- `GET /me` - Get current user profile

### Complaints (`/api/complaints`)
- `GET /` - Retrieve complaints (filtered automatically by user role/state)
- `POST /` - Create a new complaint (triggers OpenAI analysis)
- `GET /:id` - Get complaint details
- `PUT /:id/status` - Update resolution status
- `POST /:id/assign` - Assign to specific officer
- `POST /:id/verify` - Citizen verification of resolution

### Analytics & Sentiments (`/api/analytics`)
- `GET /sentiment` - Fetch aggregated sentiment data and highly frustrated zones
- `GET /department-stats` - Fetch workload and SLA metrics per department

### Admin & Auditing (`/api/users` & `/api/audit`)
- `GET /users` - Manage system users (Admin only)
- `POST /users` - Create specific roles (State Admin, Dept Head, Officer)
- `GET /audit` - Retrieve immutable audit logs of system actions

---

## 🛡️ Security & Scalability Mechanisms

1. **State-Level Isolation:** Rather than relying on simple `if` checks in controllers, Mongoose query middleware intercepts `find()` queries. If the requester is an Officer, the query is automatically injected with `{ state: user.state, department: user.department, assignedTo: user._id }`. This makes data leaks mathematically impossible at the database layer.
2. **SLA Monitoring Background Job:** A simulated cron-job evaluates complaint ages against Department SLAs. If an officer breaches the SLA, the complaint is escalated to the Department Head, and a penalty is logged in the Audit database.
3. **Optimized Client Caching:** React Context stores frequently accessed user data, while Recharts limits render cycles for the dashboards ensuring a smooth 60fps experience even with thousands of data points.

---

## 🔮 Future Roadmap

- **Mobile App Integration:** React Native wrapper for on-the-ground field officers.
- **Multilingual Support Phase 2:** Expanding beyond Hindi/English toggle to support all 22 scheduled regional languages using NLP translation.
- **Predictive Infrastructure:** Using historical grievance data to predict infrastructure failure (e.g., predicting pipe bursts before they happen based on regional anomaly clusters).
- **Blockchain Audit Trail:** Moving the `Audit & Integrity` logs to a Hyperledger fabric for cryptographically immutable public accountability.

---

<div align="center">
  <i>Empowering Citizens. Enabling Governance. Ensuring Transparency.</i><br>
  Built with ❤️ for a digital future.
</div>
