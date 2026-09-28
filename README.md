# Construction Material Management System (Con.AI)

A construction material management and inventory intelligence backend built with Node.js, Express, TypeScript, and MongoDB. The system tracks materials from procurement to site consumption, provides audit trails, detects waste, and delivers automated inventory analytics (ABC, SDE, EOQ).

---

## 🏗️ Core Architecture & Features

- **Authentication & RBAC**: JWT authentication with bcrypt password hashing and 5 granular roles: `admin`, `manager`, `engineer`, `store_keeper`, and `viewer`.
- **Project Management**: Multi-site management with project status state machine (`planning` → `active` → `on_hold` → `completed`), budget allocation, and date validations.
- **Material Catalog**: Categorized material inventory (`cement`, `steel`, `aggregate`, `chemical`, `pipe`, `valve`, `electrical`, `other`), measurement units, HSN codes, and minimum reorder thresholds.
- **Supplier Directory**: Supplier rating system, multi-material supply mappings, and contact management.
- **Purchase Order (PO) Lifecycle**: Multi-item procurement workflow (`draft` → `approved` → `partially_received` → `received` / `cancelled`) with automated Goods Receipt Note (GRN) inventory incrementing.
- **Inventory & Stock Ledger**: Atomic stock mutations using Mongoose sessions/transactions, standalone `ISSUE` and `RETURN` operations, and audit ledger (`InventoryTransaction`).
- **Waste Management**: Site waste logging (`damaged`, `expired`, `spillage`, `defective`, `overuse`, `natural_loss`, `other`) with automatic financial cost impact calculation from purchase history.
- **Planned vs Actual Consumption**: Period-based budgeting (`(projectId, materialId, period)`), real-time variance calculation (`quantityVariance`, `costVariance`), and project variance reports.
- **Advanced Inventory Analytics**:
  - **ABC Analysis**: Pareto 70-20-10 classification based on annual consumption values.
  - **SDE Analysis**: Scarcity and procurement difficulty matrix.
  - **EOQ Calculator**: Economic Order Quantity optimization based on annual demand and holding costs.
  - **Cost & Waste Efficiency**: Net material efficiency scorecards and expense breakdowns.
- **Executive Dashboard**: Global and project-scoped KPI cards, low-stock alerts (`currentStock <= reorderLevel`), recent POs, and waste reports.
- **Security & Reliability**: Helmet headers, global and auth rate limiting, centralized error handling, and Zod input validation.

---

## 📁 Repository Structure

```
material-management/
├── backend/                  # Express + TypeScript REST API
│   ├── src/
│   │   ├── config/           # Environment and DB connection configurations
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Auth, RBAC, Validation, Error Handling, Rate Limiting
│   │   ├── models/           # Mongoose schemas & TypeScript interfaces
│   │   ├── routes/           # Express routers
│   │   ├── scripts/          # Database seeding scripts
│   │   ├── services/         # Business logic & DB transactions
│   │   ├── utils/            # Standardized API response & pagination helpers
│   │   └── validators/       # Zod schemas for request validation
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/                 # Frontend application
├── README.md                 # System overview & API documentation
└── uineed.txt                # Complete UI & page requirements specification
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (running locally or MongoDB Atlas connection string)
- npm or yarn

### 1. Backend Setup

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/material_mgmt
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
```

### 3. Seed Database with Demo Data

Populate the database with demo users, projects, materials, and suppliers:

```bash
npm run seed
```

**Default Seed Credentials:**
- **Admin**: `admin@example.com` / `admin123`
- **Project Manager**: `manager@example.com` / `admin123`
- **Store Keeper**: `store@example.com` / `admin123`
- **Site Engineer**: `engineer@example.com` / `admin123`

### 4. Run Backend Server

```bash
# Development mode
npm run dev

# Build production bundle
npm run build

# Start production server
npm start
```

Backend server runs by default on `http://localhost:5000`.

---

## 📡 API Reference Overview

All protected endpoints require `Authorization: Bearer <JWT_TOKEN>`.

### Authentication & Users
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Get current logged-in profile
- `GET /api/users` — List users (Admin only)
- `PATCH /api/users/:id/role` — Update user role (Admin only)
- `PATCH /api/users/:id/status` — Activate/deactivate user (Admin only)

### Projects
- `GET /api/projects` — List projects (filter by status, search)
- `POST /api/projects` — Create project (Manager, Admin)
- `GET /api/projects/:id` — Get single project details
- `PATCH /api/projects/:id` — Update project metadata (Manager, Admin)
- `PATCH /api/projects/:id/status` — Transition project status state machine (Manager, Admin)

### Materials & Suppliers
- `GET /api/materials` — Search and list materials catalog
- `POST /api/materials` — Create material (Store Keeper, Manager, Admin)
- `GET /api/materials/:id` — Get single material
- `PATCH /api/materials/:id` — Update material (Store Keeper, Manager, Admin)
- `DELETE /api/materials/:id` — Soft-delete material
- `GET /api/suppliers` — List suppliers with supplied materials
- `POST /api/suppliers` — Create supplier (Manager, Admin)
- `PATCH /api/suppliers/:id` — Update supplier (Manager, Admin)

### Purchase Orders (Procurement)
- `GET /api/purchase-orders` — List POs (filter by project, supplier, status)
- `POST /api/purchase-orders` — Create PO (Manager, Admin, Engineer)
- `GET /api/purchase-orders/:id` — Get single PO
- `PATCH /api/purchase-orders/:id` — Update draft PO items/dates
- `PATCH /api/purchase-orders/:id/status` — Approve or cancel PO (Manager, Admin)
- `POST /api/purchase-orders/:id/receive` — Receive goods (GRN) & increment inventory (Store Keeper, Manager, Admin)

### Inventory & Stock Movement
- `GET /api/inventory` — List current stock per project (`?lowStock=true`)
- `GET /api/inventory/:id` — Get single inventory record
- `POST /api/inventory/issue` — Issue material to site with stock sufficiency check (Store Keeper, Manager, Admin)
- `POST /api/inventory/return` — Return unused material to store (Store Keeper, Manager, Admin)
- `GET /api/inventory/transactions` — Audit ledger of all RECEIVE, ISSUE, and RETURN events

### Waste Management
- `POST /api/waste` — Record waste incident with automatic cost impact computation (Store Keeper, Engineer, Manager, Admin)
- `GET /api/waste` — List waste records with project/material/reason filters
- `GET /api/waste/:id` — Get single waste incident

### Planned vs Actual Consumption
- `POST /api/consumption-plans` — Create material budget plan (Manager, Admin, Engineer)
- `GET /api/consumption-plans` — List consumption plans
- `PATCH /api/consumption-plans/:id` — Update actual quantities and costs (Manager, Admin, Engineer)
- `GET /api/consumption-plans/:id/variance` — Single item variance analysis
- `GET /api/consumption-plans/report` — Aggregated project cost & quantity variance report

### Analytics & Dashboard
- `GET /api/analytics/cost` — Procurement cost, waste cost, and cost efficiency breakdown
- `GET /api/analytics/abc` — ABC Pareto inventory classification
- `GET /api/analytics/sde` — SDE (Scarce, Difficult, Easy) classification
- `GET /api/analytics/eoq` — Economic Order Quantity calculation
- `GET /api/dashboard/summary` — High-level KPI summary, valuation, and alerts
- `GET /api/dashboard/project/:projectId` — Project-specific executive overview
- `GET /api/health` — System and MongoDB connectivity status

---

## 🎨 UI Implementation Guide

A UI blueprint and page specification document has been prepared for frontend development:
- Consult [**`uineed.txt`**](./uineed.txt) in the project root for full design systems, screen layouts, modal workflows, and component specifications.
