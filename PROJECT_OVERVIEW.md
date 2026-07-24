# Smart Civic Issue Resolution & Governance Platform - System Overview

This document provides a comprehensive technical overview of everything built in this repository to date, including the architecture, technology stack, directory structures, user roles, end-to-end workflows, and execution instructions.

---

## 🏗️ System Architecture & Workflow Overview

The platform consists of two integrated applications that form a complete civic issue resolution ecosystem:

```
+-----------------------------------------------------------------------------------+
|                                CITIZEN SIDE                                       |
|                                                                                   |
|  [ Nivaranam Mobile App ] (React Native + Expo)                                   |
|   ├── OTP Phone Authentication                                                    |
|   ├── Camera Photo Capture & AI Issue Categorization                             |
|   ├── Auto GPS Location Tagging                                                   |
|   ├── AI Duplicate Issue Detection Check                                          |
|   ├── 5km Radius Interactive Map & Upvoting System                                |
|   ├── Multi-language support (English, Hindi, Marathi, Tamil, Telugu, Bengali)    |
|   └── Status Tracking & Push Notifications                                        |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          | (Complaints & Status Data Sync)
                                          v
+-----------------------------------------+-----------------------------------------+
|                              GOVERNMENT ADMIN SIDE                                |
|                                                                                   |
|  [ CityFix Admin Panel ] (React 18 + Vite + Tailwind + Shadcn UI)                 |
|   ├── Multi-Role Authentication:                                                  |
|   │    ├── Division Admin (Division-wide overview, Full Sidebar)                 |
|   │    └── Department Head (Roads, Water, Sanitation, Power, Department Filtered) |
|   ├── Interactive Google Maps Heatmap (Complaint density visualizer)              |
|   ├── Complaint Workflow Management (Submitted -> In Progress -> Resolved)        |
|   ├── Contractor Allocation & Tracking (Local & Regional Contractors)            |
|   ├── Analytics & Predictive Maintenance                                          |
|   └── Emergency Citizen Alert Dispatcher                                         |
+-----------------------------------------------------------------------------------+
```

---

## 1. CityFix Admin Panel (`cityfix-admin-panel-main`)

### 📌 What is Built & How it Works
The Admin Panel is a web dashboard for government officials to manage and resolve citizen complaints.

#### Key Portals & Features:
1. **Multi-Tier Role Authentication**:
   - **Division Admin Flow**: Select City → Select Role (`Division Admin`) → Select Division & Login → Access Division Dashboard (`/admin`) with full sidebar and division-wide stats.
   - **Department Head Flow**: Select City → Select Role (`Department Head`) → Select Division → Select Department (Roads, Water, Sanitation, Electricity) → Login with Dept Credentials → Access Department Dashboard (`/admin/dept-dashboard`) with focused department views.
2. **Dashboard & Analytics**:
   - Real-time resolution metrics (Total Complaints, Pending, In Progress, Resolved).
   - High-density complaint heatmaps using Google Maps.
   - Response time & department performance graphs powered by Nivo & Recharts.
3. **Complaint Resolution Workflow**:
   - Detailed complaint view with timeline of actions.
   - Assign contractors, update status, and attach completion proof.
4. **Contractor Management**:
   - Track local contractors, past performance ratings, and active task allocations.
5. **Predictive Maintenance & Alerts**:
   - AI predictions for recurring infrastructure failures.
   - Emergency broadcasting tool to dispatch alerts to citizens.

### 🛠️ Technology Stack
* **Core**: React 18, TypeScript, Vite (`@vitejs/plugin-react-swc`).
* **Styling & UI**: Tailwind CSS v3, Shadcn UI (Radix UI primitives).
* **Routing**: `react-router-dom` (v6).
* **Data Fetching & Forms**: `@tanstack/react-query` (v5), `react-hook-form`, `zod`.
* **Charts & Maps**: Recharts, `@nivo/heatmap`, `@vis.gl/react-google-maps`.

### 📁 Directory Structure
```
cityfix-admin-panel-main/
├── AUTH_FLOWS.md                # Credentials & role navigation documentation
├── vite.config.ts / tailwind.config.ts
└── src/
    ├── App.tsx                  # App routes & layout tree
    ├── pages/
    │   ├── Landing.tsx          # Main entry portal
    │   ├── RoleSelection.tsx    # Role picker (Division Admin vs Dept Head)
    │   ├── CitySelection.tsx    # City chooser
    │   ├── DivisionSelection.tsx# Division chooser (North/South/East/West/Central)
    │   ├── DepartmentSelection.tsx # Department chooser
    │   ├── AdminLogin.tsx       # Admin auth
    │   ├── DepartmentHeadLogin.tsx # Dept head auth
    │   └── admin/               # Administrative Dashboards
    │       ├── Dashboard.tsx    # Main admin overview
    │       ├── Complaints.tsx   # Complaint management table
    │       ├── ComplaintDetail.tsx # Granular view & status updater
    │       ├── Analytics.tsx    # Nivo heatmaps & analytics
    │       ├── Alerts.tsx       # Emergency alert dispatcher
    │       ├── Contractors.tsx  # Contractor management
    │       ├── Predictions.tsx  # Predictive insights
    │       └── DepartmentHeadDashboard.tsx # Dept-specific overview
    └── components/              # UI primitives, AdminHeader, AdminSidebar, Heatmaps
```

---

## 2. Nivaranam Citizen Mobile App (`Nivaranam_app`)

### 📌 What is Built & How it Works
Nivaranam is an Expo-powered React Native mobile application for citizens.

#### End-to-End Citizen Reporting Flow:
1. **Authentication**: OTP-based phone login with persistent secure storage.
2. **Tab Navigation**:
   - **Home (`/`)**: System stats, category shortcuts, quick issue submission CTA.
   - **Nearby (`/nearby`)**: Interactive 5km radius map showing complaints filed around the user's current GPS position with pins and upvote buttons.
   - **Complaints (`/complaints`)**: History of citizen's submitted reports with live status badges (Submitted, In Progress, Resolved, Rejected).
   - **Notifications (`/notifications`)**: Push notifications & status change alerts.
   - **Profile (`/profile`)**: Language selection and account settings.
3. **Issue Reporting Process**:
   - **Step 1 (`camera.tsx`)**: Citizen takes a photo of the civic issue.
   - **Step 2 (`form.tsx` & `aiService.ts`)**: Auto-detection / categorization of issue type (Pothole, Waste, Water, Electricity) with urgency level.
   - **Step 3 (`duplicates.tsx`)**: AI duplicate check searches nearby reports to avoid redundant complaints.
   - **Step 4 (`confirm.tsx` & `locationService.ts`)**: GPS auto-fetches coordinates and reverse-geocodes address.
   - **Step 5 (`success.tsx`)**: Complaint is submitted and tracking ID generated.
4. **Internationalization**: Full multi-language support (English, Hindi, Marathi, Tamil, Telugu, Bengali) via `i18next`.

### 🛠️ Technology Stack
* **Core**: React Native (0.81.5), Expo SDK 54 (`~54.0.27`), TypeScript 5.9.
* **Routing**: Expo Router v6 (File-based routes inside `app/`).
* **Device Features**: `expo-camera`, `expo-location`, `expo-notifications`, `expo-secure-store`, `expo-haptics`, `expo-sharing`, `react-native-maps`.
* **Localization**: `i18next`, `react-i18next`.

### 📂 Directory Structure
```
Nivaranam_app/
├── app.json                     # Expo config, permissions & Google Maps API key
└── app/                         # File-Based Expo Router Pages
    ├── _layout.tsx              # App root layout
    ├── login.tsx                # Phone / OTP auth
    ├── (tabs)/                  # Bottom Tab Bar
    │   ├── index.tsx            # Home screen
    │   ├── nearby.tsx           # 5km map of nearby complaints
    │   ├── notifications.tsx    # Notifications
    │   ├── profile.tsx          # User profile & language picker
    │   └── complaints/          # My complaints tracker
    └── (report)/                # Issue Reporting Flow
        ├── camera.tsx           # Photo capture
        ├── form.tsx             # Issue details
        ├── duplicates.tsx       # AI duplicate check
        ├── confirm.tsx          # GPS location confirm
        └── success.tsx          # Confirmation
src/
    ├── services/                # api.ts (API client & mock data), aiService.ts, locationService.ts
    ├── i18n/                    # Translation files (en, hi, mr, ta, te, bn)
    └── components/              # UI elements, ComplaintCards, StatusBadges
```

---

## 3. Implementation Status (Current State)

| Component | Status | Details |
| :--- | :--- | :--- |
| **Frontend UI (Web Admin)** | ✅ Complete | Fully built with Shadcn UI, pages, routing, heatmaps, and role views. |
| **Mobile App UI (Citizen)** | ✅ Complete | Fully built with Expo Router, camera flow, map integration, and i18n. |
| **Authentication Flow** | ✅ Built (Mock Credentials) | Web uses local credential rules (`AUTH_FLOWS.md`); Mobile uses OTP mock service. |
| **Data Layer** | 🔄 Mock Service / API Ready | Both apps currently use structured mock services (`src/services/api.ts`) for instant offline demonstration, designed for easy REST backend replacement. |

---

## 4. How to Run & Prerequisites

### Prerequisites
* **Node.js** v18+ installed on system.
* **For Web Admin**: Standard browser (Chrome/Edge/Firefox).
* **For Mobile App**: **Expo CLI** (`npx expo start`) + **Expo Go App** on a phone **or** Android Studio Emulator / Xcode Simulator.

### Commands to Run:
```bash
# 1. To run Web Admin Panel:
cd "d:\SIH 2025\cityfix-admin-panel-main"
npm install
npm run dev

# 2. To run Citizen Mobile App:
cd "d:\SIH 2025\Nivaranam_app"
npm install
npx expo start -c
```
