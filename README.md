# Samadhan - National Public Grievance Redressal System 🏛️

**Samadhan** is a comprehensive, hierarchical, and highly secure public grievance management platform designed for scale. It connects citizens directly with their respective government departments while providing powerful oversight tools for State Chief Ministers (CM) and National Super Admins.

## ✨ Key Features

### 🛡️ Strict Hierarchical Role-Based Access Control (RBAC)
Data visibility and mutation privileges are strictly partitioned across 5 distinct roles:
1. **Citizen**: Can submit grievances, track real-time status, add comments, and verify resolutions.
2. **Employee / Officer**: Can view assigned complaints, update statuses, upload resolution proof, and manage daily tasks.
3. **Department Head**: Can monitor their specific department's performance, assign complaints to employees, and manage their department's workforce.
4. **State Admin (CM)**: Has oversight over their entire state. Can monitor all state departments, detect systemic bottlenecks, view public sentiment, and manage state-level officers.
5. **Super Admin**: Has national oversight. Can manage state admins and track high-level metrics across the country.

### 🔒 Secure Action Verification & Audit Trails
To prevent unauthorized or accidental modifications to critical data (like editing or deleting users and departments), Samadhan enforces a **Secure Action Verification** protocol. Sensitive actions require:
- The administrator's password to re-authenticate the action.
- A mandatory justification string (minimum 10 characters).
Every modification is permanently logged in the **Audit & Integrity** database.

### 🧠 AI-Powered Insights & Fraud Detection
- **Public Sentiment Analysis**: Automatically analyzes the tone of incoming complaints to alert officials of growing public unrest in specific wards.
- **Fraud & Anomaly Detection**: Scans for duplicate tickets, bot-like behavior, and suspicious officer resolution patterns (e.g., resolving complex complaints in under 2 minutes).

### 📍 Geospatial Grievance Map
Visualize complaints on an interactive map. Citizens can pinpoint exact issues, and admins can visually identify clusters of infrastructure failures (e.g., multiple water pipe bursts in a single neighborhood).

### ⚡ Real-Time Operations
Built on Socket.io, Samadhan pushes critical alerts and new complaint notifications to relevant officers and admins instantly, eliminating the need for page refreshes.

---

## 🛠️ Technology Stack

**Frontend:**
- React 18
- React Router DOM
- Context API (Auth, Socket, Theme)
- Lucide React (Icons)
- Leaflet (Maps)
- CSS Variables for dynamic Dark/Light Mode & Glassmorphism

**Backend:**
- Node.js & Express
- MongoDB & Mongoose (GeoJSON indexing for locations)
- Socket.io (Real-time events)
- JSON Web Tokens (JWT) & bcrypt (Authentication)
- express-rate-limit & helmet (Security)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (Local instance or Atlas URI)

### Environment Variables
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/samadhan
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d
```

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/pankeshbhagore/Samadhan.git
cd Samadhan
```

**2. Setup Backend**
```bash
cd backend
npm install
# Optional: Seed the database with test data
npm run seed
# Start the backend server
npm run dev
```

**3. Setup Frontend**
```bash
cd ../frontend
npm install
# Start the React development server
npm start
```
The application will be available at `http://localhost:3000`.

---

## 🏗️ Architecture Overview

- **`backend/controllers/`**: Contains core business logic. Notably, `userController.js` and `complaintController.js` enforce strict state-boundary and department-boundary checks.
- **`backend/models/`**: Mongoose schemas. Features advanced configurations like GeoJSON `Point` schemas and pre-save hooks.
- **`frontend/src/contexts/`**: Manages global state (User Auth, WebSockets, Dark/Light Themes).
- **`frontend/src/pages/`**: Role-specific dashboards and views. Navigation is dynamically rendered based on the `user.role` via `App.js` Private Routes and `Sidebar.js`.

---

## 🤝 Contributing

When contributing to Samadhan, please ensure that all new API routes strictly adhere to the hierarchical RBAC models. Never expose cross-state or cross-department data without explicit `super_admin` or `cm` authorization middleware.
