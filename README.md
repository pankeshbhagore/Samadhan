# Samadhan - All India Citizen Grievance Dashboard

Samadhan is a state-of-the-art, scalable grievance management platform designed for the entire country. It dynamically routes and filters data based on 36 Indian states and union territories, providing dedicated dashboards for each state's Chief Minister, while allowing Super Admins to oversee the entire nation.

## Key Features

*   **Multi-State Architecture:** Supports all 36 Indian States and Union Territories out of the box. Data is logically isolated by state, ensuring privacy and focused analytics for state leaders.
*   **Role-Based Access Control (RBAC):**
    *   **Super Admin:** Nationwide overview, can view and filter metrics for any state.
    *   **Chief Minister (CM) / State Admin:** Exclusive dashboard for their state, AI insights, and critical alerts.
    *   **Department Head:** Focuses on their specific department's performance within their state.
    *   **Officer (Employee):** Actionable task list based on their state and department assignment.
    *   **Citizen:** Track and submit personal grievances easily.
*   **AI-Powered Insights:** Uses OpenAI to classify complaints, detect frustration levels, highlight department bottlenecks, and even generate weekly press releases.
*   **Premium Glassmorphism UI:** Modern, responsive interface with stunning visual depth, micro-animations, and a sleek dark mode.
*   **Real-time Hotspot Mapping:** Geographic visualization of grievances across the state/country.

## Tech Stack

*   **Frontend:** React (React Router, Recharts, Leaflet, Lucide React, i18next).
*   **Backend:** Node.js, Express, MongoDB (Mongoose), Socket.io.
*   **Integrations:** OpenAI (for classification & reports), Twilio (for WhatsApp hooks - optional).

## Getting Started

### 1. Database Setup
Make sure MongoDB is running locally or provide a cloud URI.
The database defaults to `samadhan`.

### 2. Environment Variables
#### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/samadhan
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
OPENAI_API_KEY=your_openai_api_key
```

### 3. Installation & Seeding

```bash
# Install backend dependencies
cd backend
npm install

# Seed the database (Generates ~500 complaints across all 36 states)
npm run seed
```

### 4. Running the App

Run both frontend and backend concurrently:
```bash
# In the root directory (if concurrently is set up) or start individually:
cd backend && npm start
cd frontend && npm start
```

## Demo Credentials (from seeder)
The seeder creates multiple demo accounts. Password for all is `password123`.
*   **Super Admin:** admin@samadhan.gov.in
*   **CM (Maharashtra):** cm@mh.samadhan.gov.in
*   **CM (Uttar Pradesh):** cm@up.samadhan.gov.in
*   **Dept Head (MH):** dh.roads@mh.samadhan.gov.in
*   **Officer (MH):** officer1@mh.samadhan.gov.in
*   **Citizen (MH):** citizen1@mh.example.com
