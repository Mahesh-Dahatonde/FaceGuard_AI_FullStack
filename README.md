# FaceGuard AI - New Project

Title:
A Data Fusion-Based Two-Stage Cascading Framework for Multi-Modal Face Anti-Spoofing Using Monocular Depth Estimation

## Structure
- frontend/  React + Vite
- backend/   Spring Boot REST API

## Run Backend
cd backend
mvn spring-boot:run

Backend: http://localhost:8080

## Run Frontend
cd frontend
npm install
npm run dev

Frontend: http://localhost:5173

The first version uses a clean demo anti-spoofing analysis in the frontend so the UI can be tested immediately. The backend stores users and scan history using H2 database. The AI service can be connected later to your real Python/MiDaS model.
