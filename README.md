# 🌟 ServiceNear — Local Service Provider Marketplace
> **Hackathon Problem Statement HC8: Local Service Provider Marketplace**  
> *Connecting residents with verified nearby service providers: electricians, plumbers, cleaners, tutors, carpenters, and technicians with transparent distances, Gemini AI problem triage, and interactive OpenStreetMap.*

---

## 🎯 Project Overview & Solution Highlights

**ServiceNear** is a production-ready, full-stack hyperlocal marketplace application designed to bridge the trust and distance gap between urban residents and local tradespeople. Built with a lightweight, robust stack suitable for Replit, modern web standards, and clean architecture.

### ✨ Key Features Implemented

1. **Role-Based Experience (Strict 2-Role System)**:
   - **First Screen Role Selector**: "How would you like to use ServiceNear?" with two large interactive cards:
     - 🏠 **Resident** — Find and book local services
     - 🧰 **Service Provider** — Offer services and receive bookings
   - Role-based route enforcement and custom navigation bars for each role.

2. **12 Complete Service Categories (Seeded & Searchable)**:
   - Plumbing, Electrical, Home Cleaning, Tutoring, Carpentry, Painting, Appliance Repair, AC & Cooling Services, Pest Control, Beauty & Personal Care, Gardening, Computer & IT Support.
   - Pre-populated with **13+ realistic, verified providers** with ratings, services, and live coordinates.

3. **Leaflet + OpenStreetMap (100% Google-Free Maps)**:
   - Interactive neighborhood maps with custom pins for residents (`🏠`) and providers (`🧰`).
   - Approximate distance display (e.g. `1.8 km away`) calculated using the Haversine formula to respect resident privacy.
   - Interactive coverage radius circle (3 km to 30 km) for providers.
   - Device GPS detection + 1-click neighborhood selector (Bangalore, San Francisco, New York, London).

4. **Gemini AI Service Assistant**:
   - Natural language triage: resident enters *"My bathroom tap is leaking badly and I need someone today"*.
   - Gemini classifies:
     - Recommended Service Category
     - Specific Problem Type
     - Urgency (🚨 Emergency or Standard)
     - Immediate Safety Advice
     - Short Friendly Explanation
   - Multimodal photo diagnosis: upload a photo of a broken pipe, switchboard, or AC unit for instant AI classification.
   - Resilient multi-model retry strategy (`gemini-3.8-flash`, `gemini-3.1-pro-preview`, `gemini-2.5-flash`) with intelligent semantic fallback if API limits are reached.

5. **Transparent Smart Matching Score**:
   - `Matching Score = Service Match + Distance + Availability + Rating + Experience + Emergency Availability`
   - Transparently displayed as `98% Match` on each provider card.

6. **🚨 Emergency Priority Dispatch**:
   - Residents can toggle Emergency Mode for urgent situations (pipe bursts, short circuits, gas leaks).
   - Filters and prioritizes available providers ready for 30–45 minute callouts.

7. **End-to-End Booking Lifecycle**:
   - Visual progress stepper:  
     `Requested ➔ Accepted ➔ On the Way ➔ In Progress ➔ Completed`
   - Provider direct phone number revealed upon job acceptance for direct communication.
   - Provider can update status with live notes (e.g. *"Arriving in 10 minutes"*).
   - "Book Again" repeat booking button.
   - 1–5 Star Rating & verified review submission upon job completion.

8. **Provider Management Suite**:
   - Live availability toggle: **Available** (green) / **Busy** (amber) / **Unavailable** (gray).
   - Service catalog manager (custom pricing: fixed/hourly, duration, emergency readiness).
   - Interactive Leaflet map radius picker (3 km, 5 km, 10 km, 15 km, 20 km, 30 km).
   - Working days and hours selector.
   - Verification checklist: ✓ Phone Verified, ✓ Profile Complete, ✓ Service Details Added.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React |
| **Maps** | Leaflet 1.9 + OpenStreetMap *(Zero Google API dependencies)* |
| **Backend** | Node.js (v22), Express, TypeScript (TSX) |
| **Database & Auth** | Supabase PostgreSQL + Supabase Auth (`@supabase/supabase-js`) |
| **AI** | Google Gemini API (Interactions API / REST endpoint via Express proxy) |
| **Data Resiliency** | Automatic Supabase DB Adapter + In-Memory Fallback DataStore with seed categories and demo accounts |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher, tested on v22)
- npm (v9 or higher)

### 2. Environment Configuration
Create a `.env` file in the root directory (or use the provided `.env.example`):

```bash
# Supabase Configuration
SUPABASE_URL=https://kkpqfbelzwwlmhljdcbf.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_YiD_M5F9HxuSHbOJfw4Cwg_kYCtXKVw

# Frontend Supabase Configuration (Vite)
VITE_SUPABASE_URL=https://kkpqfbelzwwlmhljdcbf.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YiD_M5F9HxuSHbOJfw4Cwg_kYCtXKVw

# Google Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Server Port
PORT=3001
VITE_API_URL=http://localhost:3001
```

### 3. Installation
Install all dependencies across root, server, and client:
```bash
npm run install:all
```

### 4. Running Locally
Run both the Express backend and the Vite frontend simultaneously:
```bash
npm run dev
```

- **Frontend Client**: `http://localhost:5173/`
- **Backend API**: `http://localhost:3001/api/`
- **Health Check**: `http://localhost:3001/api/health`

### 5. Running on Replit / Unified Production
Build and start the unified server:
```bash
npm run build
npm start
```
The Express server on port 3001 automatically serves both the API endpoints (`/api/...`) and the client SPA from `client/dist`.

---

## 🗄️ Database Setup (Supabase)

The file `supabase_schema.sql` contains the complete PostgreSQL schema, Row Level Security (RLS) policies, and seed data:
- Tables: `profiles`, `categories`, `provider_profiles`, `provider_services`, `bookings`, `reviews`, `favorites`
- Storage buckets: `avatars`, `booking-photos`
- RLS Policies enforcing secure role-based access

### To run in Supabase:
1. Open your Supabase Dashboard: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor**
3. Paste the contents of [supabase_schema.sql](file:///c:/Users/kokil/ServiceNear3/supabase_schema.sql) and click **Run**.

*Note: Even before running the SQL script in Supabase, ServiceNear runs seamlessly out-of-the-box thanks to its built-in data adapter.*

---

## ⚡ Hackathon Judging Quick Walkthrough

For rapid evaluation without typing:
1. Open `http://localhost:5173/`
2. In the **Hackathon Rapid Test Mode** bar, click **🏠 Demo Resident** (signs in as *Ayesha Khan*).
3. Click **✨ Launch AI Assistant**, enter *"My bathroom tap is leaking badly and I need someone today"*, and click **Analyze**.
4. Click **Book** on the top match (*Apex Hydro*), check **🚨 Emergency Priority Dispatch**, and submit.
5. In **My Bookings**, see the live status stepper at `Requested`.
6. Click **⚡ Demo** in the top navigation and select **🧰 Apex Hydro (Vikram)** (switches to Provider Portal).
7. In the Provider Dashboard, click **Accept Booking**, then progress:  
   `Accepted ➔ On the Way ➔ In Progress ➔ Completed`.
8. Switch back to **🏠 Demo Resident** to see the status updated to `Completed`, leave a 5-star review, or click **Book Again**!
9. Switch to the **Map** tab to view the live OpenStreetMap Leaflet visualization.
