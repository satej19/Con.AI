# Construction Material Management System - Backend

A comprehensive backend API for managing construction materials, suppliers, purchase orders, inventory, and project consumption tracking.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express 5
- **Language**: TypeScript 7
- **Database**: MongoDB with Mongoose
- **Validation**: Zod
- **Authentication**: JWT
- **Password Hashing**: bcryptjs
- **Security**: Helmet, CORS, Rate Limiting

## Features

### Core Functionality
- **Authentication & Authorization**: JWT-based auth with role-based access control (RBAC)
- **Projects**: Manage construction projects with status tracking
- **Materials**: Catalog management with categories, units, and reorder levels
- **Suppliers**: Supplier management with ratings and material associations
- **Purchase Orders**: PO lifecycle (draft → approved → received) with receiving workflow
- **Inventory**: Real-time stock tracking with transaction history
- **Waste Management**: Track material waste with cost impact analysis
- **Consumption Planning**: Planned vs actual consumption with variance analysis
- **Analytics**: Cost analysis, ABC classification, SDE classification, EOQ calculations
- **Dashboard**: Aggregated project and system-wide summaries

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files (env, db, constants)
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware (auth, validation, error handling)
│   ├── models/          # Mongoose models
│   ├── routes/          # API route definitions
│   ├── scripts/         # Utility scripts (seed data)
│   ├── services/        # Business logic layer
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── validators/      # Zod validation schemas
│   └── index.ts         # Application entry point
├── dist/                # Compiled JavaScript output
├── .env.example         # Environment variables template
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/material-management
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Seed Database
```bash
npm run seed
```

This creates sample data including:
- 4 users (admin, manager, store keeper, engineer)
- 2 projects
- 5 materials
- 3 suppliers

Default credentials: `admin@example.com` / `admin123`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project (manager+)
- `GET /api/projects/:id` - Get project details
- `PATCH /api/projects/:id` - Update project (manager+)
- `DELETE /api/projects/:id` - Delete project (admin)

### Materials
- `GET /api/materials` - List all materials
- `POST /api/materials` - Create material (manager+)
- `GET /api/materials/:id` - Get material details
- `PATCH /api/materials/:id` - Update material (manager+)
- `DELETE /api/materials/:id` - Delete material (admin)

### Suppliers
- `GET /api/suppliers` - List all suppliers
- `POST /api/suppliers` - Create supplier (manager+)
- `GET /api/suppliers/:id` - Get supplier details
- `PATCH /api/suppliers/:id` - Update supplier (manager+)
- `DELETE /api/suppliers/:id` - Delete supplier (admin)

### Purchase Orders
- `GET /api/purchase-orders` - List all POs
- `POST /api/purchase-orders` - Create PO (manager+)
- `GET /api/purchase-orders/:id` - Get PO details
- `PATCH /api/purchase-orders/:id` - Update PO (manager+)
- `PATCH /api/purchase-orders/:id/approve` - Approve PO (manager+)
- `POST /api/purchase-orders/:id/receive` - Receive goods (store_keeper+)
- `PATCH /api/purchase-orders/:id/cancel` - Cancel PO (manager+)

### Inventory
- `GET /api/inventory` - List inventory
- `GET /api/inventory/:id` - Get inventory item
- `POST /api/inventory/issue` - Issue material (store_keeper+)
- `POST /api/inventory/return` - Return material (store_keeper+)
- `GET /api/inventory/transactions/list` - List transactions

### Waste Management
- `GET /api/waste` - List waste records
- `POST /api/waste` - Create waste record (store_keeper+)
- `GET /api/waste/:id` - Get waste record

### Consumption Plans
- `GET /api/consumption-plans` - List consumption plans
- `POST /api/consumption-plans` - Create plan (manager+)
- `GET /api/consumption-plans/:id` - Get plan details
- `PATCH /api/consumption-plans/:id` - Update plan (manager+)
- `GET /api/consumption-plans/:id/variance` - Get variance analysis
- `GET /api/consumption-plans/report` - Get variance report

### Analytics
- `GET /api/analytics/cost` - Cost analysis
- `GET /api/analytics/abc` - ABC classification
- `GET /api/analytics/sde` - SDE classification
- `GET /api/analytics/eoq` - EOQ analysis

### Dashboard
- `GET /api/dashboard/summary` - Dashboard summary
- `GET /api/dashboard/project/:projectId` - Project dashboard

## User Roles

- **admin**: Full system access
- **manager**: Project and material management
- **engineer**: View and create consumption plans
- **store_keeper**: Inventory and waste management
- **viewer**: Read-only access

## Security Features

- JWT authentication
- Role-based authorization
- Rate limiting (100 req/15min, 5 auth req/15min)
- Helmet.js security headers
- CORS configuration
- Password hashing with bcrypt
- Input validation with Zod
- SQL injection prevention (MongoDB)

## Error Handling

All errors follow a consistent format:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Success Response Format

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success message",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

## Database Schema

Key models:
- User (authentication)
- Project (construction projects)
- Material (material catalog)
- Supplier (supplier information)
- PurchaseOrder (purchase orders with items)
- Inventory (stock levels per project/material)
- InventoryTransaction (stock movement history)
- WasteRecord (waste tracking)
- ConsumptionPlan (planned vs actual consumption)

## Development Notes

- Use `npm run build` to compile TypeScript
- All business logic is in services layer
- Controllers only handle request/response
- Validators ensure data integrity
- Mongoose transactions for data consistency
- AI-ready audit data in all models

## License

ISC
