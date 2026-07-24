# SmartGovAI (Nivaranam) 🏛️🤖
## AI-Powered Smart Civic Issue Resolution & Governance Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Mobile%20%7C%20WhatsApp-green.svg)]()
[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Expo%20%7C%20Express%20%7C%20FastAPI%20%7C%20PostgreSQL-orange.svg)]()

> SmartGovAI (Nivaranam) is an enterprise-grade, multi-tenant civic governance platform designed to revolutionize municipal issue resolution through computer vision AI, real-time spatial heatmaps, multi-tiered government administrative workflows, and citizen-centric reporting channels (Mobile App & WhatsApp Bot).

---

## 🏗️ System Architecture & Workflow

```
+-------------------------------------------------------------------------------------------------------------------+
|                                            CITIZEN INTERFACE LAYER                                                |
|  +---------------------------------------+               +-----------------------------------------------------+  |
|  | Nivaranam Mobile App (React Native)   |               | WhatsApp Complaint Bot (Meta API / Twilio Webhook)  |  |
|  | (Expo Router, GPS, Camera, i18n)      |               | (Photo Capture, Geo-location, Conversational Bot)   |  |
|  +-------------------+-------------------+               +--------------------------+--------------------------+  |
+----------------------|--------------------------------------------------------------|-----------------------------+
                       |                                                              |
                       +------------------------------+-------------------------------+
                                                      | HTTP / REST API (JSON / Multipart FormData)
                                                      v
+-------------------------------------------------------------------------------------------------------------------+
|                                          API GATEWAY & APPLICATION SERVER                                         |
|  +-------------------------------------------------------------------------------------------------------------+  |
|  | Node.js + Express + TypeScript Core Server                                                                  |  |
|  |  ├── CORS, Helmet, Rate Limiter & Sanitize Middleware                                                      |  |
|  |  ├── JWT & RBAC Auth Middleware (Citizen, Dept Head, Division Admin, Super Admin)                           |  |
|  |  ├── Zod Input Validation & Swagger / OpenAPI Documentation Engine                                         |  |
|  |  ├── S3 Cloud Storage Presigned URL Generator & Media Handler                                               |  |
|  |  ├── PostGIS Spatial Query & Heatmap Engine                                                                 |  |
|  |  └── Prisma ORM Data Access Layer                                                                           |  |
|  +-------------------+------------------------------------+----------------------------------------------------+  |
+----------------------|------------------------------------|-------------------------------------------------------+
                       |                                    |
       +---------------+                                    v
       |                                    +----------------------------------+
       v                                    | ASYNCHRONOUS MESSAGE QUEUE       |
+-----------------------------+             | BullMQ + Redis Event Bus         |
| DATABASE LAYER              |             |  ├── AI Image Inference Queue    |
| PostgreSQL 16 + PostGIS 3.4 |             |  ├── Push & SMS Notification Queue|
| (Spatial Indexing, Encrypted|             |  └── WhatsApp Webhook Response Q |
| Relational Storage)         |             +-----------------+----------------+
+-----------------------------+                               |
       ^                                                      | Async Worker Jobs
       |                                                      v
       |                                    +----------------------------------+
       |                                    | AI VISION MICROSERVICE           |
       |                                    | Python FastAPI + PyTorch / YOLO  |
       |                                    |  ├── Image Preprocessing         |
       |                                    |  ├── Category & Confidence Model |
       |                                    |  └── Priority Scoring Engine     |
       |                                    +-----------------+----------------+
       |                                                      |
       +------------------------------------------------------+ (Write Predictions & Auto-Route)
       ^
       |
+------+:------------------------------------------------------------------------------------------------------------+
|                                              GOVERNMENT ADMIN PORTAL                                              |
|  [ CityFix Web Admin Portal ] (React 18 + Vite + Tailwind CSS + Shadcn UI + Recharts + Vis.gl Google Maps)        |
|   ├── Division Admin Portal (Citywide Overview, Contractor Allocation, AI Predictions, Alerts)                   |
|   ├── Department Head Portal (Filtered Dept Workflows: Roads, Water, Electricity, Sanitation)                      |
|   └── Emergency Citizen Alert Dispatcher                                                                          |
+-------------------------------------------------------------------------------------------------------------------+
```

---

## ✨ Key Features

### 📱 Citizen Mobile Application (`citizen-app`)
- **OTP Phone Authentication**: Secure, friction-free login with persistent storage.
- **AI Photo Capture & Auto-Classification**: Detects issue type (Potholes, Waste Dumps, Water Leaks, Broken Streetlights, Open Manholes) with confidence scoring.
- **Auto-GPS Tagging**: Captures exact location coordinates and reverse-geocodes addresses.
- **5km Radius Interactive Map & Upvotes**: View nearby community reports and vote on high-priority issues.
- **6-Language Support**: Full internationalization for English, Hindi, Marathi, Tamil, Telugu, and Bengali (`i18next`).

### 🏛️ Government Admin Portal (`web-admin`)
- **Multi-Role Governance**: Division Admin (citywide overview) and Department Head (Roads, Water, Power, Sanitation).
- **Google Maps Density Heatmaps**: Interactive complaint density visualizers with ward and division filtering.
- **Complaint Resolution Workflow**: Status tracking (`Submitted` → `Verified` → `Assigned` → `In Progress` → `Resolved` → `Closed`).
- **Contractor Allocation**: Assign tasks to local contractors and track past performance ratings.
- **Predictive Maintenance & Emergency Alerts**: AI projections for recurring infrastructure failures and broadcast dispatches to citizens.

### 🤖 AI Vision Microservice (`ai-service`)
- **Computer Vision Model**: Fine-tuned **YOLOv11** running on FastAPI for sub-50ms CPU/GPU inference.
- **9-Stage Validation Pipeline**: Image integrity check, Laplacian blur test, NSFW filter, and PostGIS 50m spatial duplicate check (`ST_DWithin`).
- **Tiered AI Confidence Routing**: Auto-routing (>90%), user prompt confirmation (80–90%), and manual fallback (<80%).

### 💬 WhatsApp Complaint Bot (`whatsapp-bot`)
- **Conversational Reporting**: Citizens send photos and location pins via Meta WhatsApp API to receive instant tracking IDs (`NIV-2026-X`).

---

## 📂 Repository Structure

```
SmartGovAI/
├── citizen-app/                     # Expo React Native Mobile App
├── web-admin/                       # React 18 + Vite Web Admin Portal
├── backend/                         # Node.js + Express + TypeScript REST API Gateway
├── ai-service/                      # Python FastAPI + PyTorch Computer Vision Microservice
├── whatsapp-bot/                    # Node.js Webhook Server for Meta / Twilio WhatsApp API
├── shared/                          # Shared TypeScript Contracts, Types & Enums
├── database/                        # PostgreSQL 16 + PostGIS Prisma Schemas & Migrations
├── dataset/                         # Dataset Engineering, Annotations & DVC Version Control
├── docs/                            # OpenAPI 3.0 Specs, Architecture Specs & ADRs
├── deployment/                      # Dockerfiles, Docker Compose & GitHub Actions CI/CD
├── .gitignore                       # Multi-stack enterprise Gitignore rules
└── README.md                        # Master repository documentation
```

---

## 🛠️ Technology Stack

| Component | Technologies Used |
| :--- | :--- |
| **Citizen Mobile App** | React Native, Expo SDK 54, Expo Router v6, TypeScript, i18next, React Native Maps |
| **Web Admin Portal** | React 18, TypeScript, Vite, Tailwind CSS, Shadcn UI, Recharts, Nivo Heatmaps, Vis.gl Google Maps |
| **Backend REST API** | Node.js, Express.js, TypeScript, Prisma ORM, JWT, Zod, Rate Limiter, Helmet |
| **Database & Cache** | PostgreSQL 16 + PostGIS 3.4 Extension, Redis 7 |
| **Queue Architecture** | BullMQ + Redis Event Bus |
| **AI Vision Service** | Python 3.11, FastAPI, PyTorch, YOLOv11, OpenCV, ONNX Runtime |
| **Cloud Storage** | AWS S3 (ap-south-1 Mumbai) + AWS CloudFront CDN |
| **Containerization** | Docker, Docker Compose, Nginx Reverse Proxy |

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Docker & Docker Compose**: Installed on system
- **Expo CLI**: `npm install -g expo-cli`

### Running Local Development Environment

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/SmartGovAI.git
cd SmartGovAI

# 2. Install monorepo dependencies
npm install

# 3. Launch PostgreSQL + PostGIS & Redis via Docker
docker-compose -f database/docker-compose.db.yml up -d

# 4. Run Web Admin Portal
npm run dev:admin

# 5. Run Citizen Mobile App
npm run dev:mobile
```

---

## 🖼️ Application Screenshots

| Citizen Mobile App | Admin Dashboard Heatmap |
| :---: | :---: |
| *[ Citizen App Capture Screen Placeholder ]* | *[ Google Maps Density Heatmap Placeholder ]* |

---

## 🎯 Project Roadmap

### Version 1.0 (MVP Scope)
- [x] Monorepo Restructuring & Version Control Architecture
- [x] PostgreSQL + PostGIS Schema Design & Prisma Setup
- [x] Express TypeScript Backend with JWT Auth & RBAC
- [x] AWS S3 Decoupled Media Upload Engine with Presigned URLs
- [x] Fine-Tuned YOLOv11 AI Vision Microservice
- [x] BullMQ + Redis Asynchronous Queue Engine
- [x] Nivaranam Mobile App Integration (Expo Development Build)
- [x] CityFix Web Admin Dashboard & Heatmaps Integration
- [x] WhatsApp Bot Webhook & Multi-Channel Push Notifications
- [x] Containerized Docker Deployment & CI/CD Pipelines

### Version 2.0 (Future AI Enhancements)
- [ ] OCR Image Text Extraction (Street Sign & Municipal Notice Reader)
- [ ] Speech-to-Text Regional Language Voice Reporting
- [ ] Multilingual LLM Assistant for Municipal Guidelines
- [ ] AI Repair Damage Severity & Budget Cost Estimator
- [ ] ML Contractor Proximity & Performance Recommendation Engine

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
