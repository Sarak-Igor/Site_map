# 🏗️ Structure and Architecture Guide

This document establishes the directory standard and development guidelines to ensure the project is scalable, organized, and prepared for a future transition to microservices.

---

## 📁 Folder Structure (Skeleton)

The base structure must be replicated according to the model below:

```text
backend/
├── app/
│   ├── core/           # Central configurations (Auth, Security, Database Init)
│   ├── modules/        # Business domains (Core Modularity)
│   │   └── [module_name]/
│   │       ├── api/        # Routes, Controllers, and Entrypoints
│   │       ├── services/   # Business Logic
│   │       ├── models/     # Entity/Database Definitions
│   │       ├── schemas/    # Validation and DTOs (Data Transfer Objects)
│   │       └── repository/ # Persistence Layer and Queries
│   ├── shared/         # Reusable utilities and helpers across modules
│   └── main.py         # Entry point (Application Bootstrap)
├── tests/              # Unit and integration tests
├── .env.example        # Environment variables template
└── .venv               # Virtual environment (isolated)

frontend/
├── public/             # Static and global files
├── src/
│   ├── core/           # Sarak UI Engine (Do not change! Agnostic visual engine)
│   │   ├── auth/       # Unified login and session system
│   │   ├── components/ # Isolated and global UI components (Shell, Cards, etc.)
│   │   ├── styles/     # CSS Tokens and Tailwind configurations
│   │   └── theme-library/# Native themes and engine definitions 
│   ├── modules/        # Business domains for the Framework
│   │   └── [module_name]/
│   │       ├── components/ # React components with business context
│   │       ├── services/   # Backend API consumption for this module
│   │       └── pages/      # Exclusive Views and Screens
│   ├── shared/         # Hooks, configs, and utilities across modules
│   ├── App.jsx         # Entry point (Module mounting on the Shell)
│   └── main.jsx        # Root render
├── tailwind.config.js  # Global CSS rules connected to the Token (Core)
└── package.json        # Standard React/Vite dependencies
```

🧩 Modularity and Expansion Principles
The absolute focus of this project is Modularity. Each folder inside modules/ must be treated as a potential independent microservice.

1. Single Responsibility Principle (SRP)
Each layer has a restricted role and must not assume functions from another:
API: Manages external communication only (HTTP/Protocol).
Services: Where business intelligence resides. It must not know which database is used.
Repository: The only layer that knows the Database or ORM.

2. Domain Isolation
Forbidden: Importing models or repositories directly from one module to another (in Backend), and leaking business rules to the `src/core/` folder (in Frontend).
Allowed: If Module A needs something from Module B, it must request it through a Service or public interface. In Frontend, modules live isolated consuming blind components from the Core Layer.
Objective: Allow Module A to be moved to another business ecosystem without breaking the application's core.

🚀 How to Use this Skeleton

Initial Installation:
Backend: Create the environment: `python -m venv .venv` and install dependencies.
Frontend: Navigate to `frontend/`, run `npm install` and start `npm run dev`.

🧪 Hybrid Testing System
The boilerplate comes pre-configured with Vitest (Frontend) and Pytest (Backend).
The Testing Philosophy: **Test only Business Rules and Calculations**. Do not write time-consuming tests to validate the Sarak Engine's visual engine (animations, colors, and shell).
- **Frontend:** Navigate to `frontend/` and run `npm run test` to validate logical components of your modules (see the educational example in `src/modules/example/`).
- **Backend:** In the `backend/` folder, activate `.venv` and run `pytest` to test the rules contained in `services/`.

Creating Features:
Always identify which domain the feature belongs to.
Create a new subfolder in modules/ following the standard structure.

Configurations:
Never put credentials in the code. Use .env.example to map what the project needs and .env (ignored by Git) for the real values.

⚠️ GOLDEN NOTE: Develop thinking: "If I needed to separate this module today, how much work would I have?". If the answer is "a lot", modularity is compromised. Refactor.