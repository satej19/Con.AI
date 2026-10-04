# Live Testing Guide — Material Management System (Manager Role)

## Setup

Backend must be running on `http://localhost:5000`  
Use **Postman**, **Thunder Client**, or **curl** for all requests below.

### Login first — get your token

```
POST http://localhost:5000/api/auth/login
Body:
{
  "email": "manager@example.com",
  "password": "admin123"
}
```

Copy the `token` from the response. Add this header to **every request** below:
```
Authorization: Bearer <your_token>
```

---

## 1. Dashboard

See the live system health at a glance — total stock, low-stock alerts, recent POs, waste costs.

```
GET /api/dashboard/summary
```

What to check:
- `overview.activeProjects` — how many projects are running
- `inventory.lowStockItems` — any materials below reorder level
- `financial.totalWasteCost` — money lost to waste
- `recent.purchaseOrders` — last 5 POs
- `recent.wasteRecords` — last 5 waste events

---

## 2. Projects

### List all projects
```
GET /api/projects
GET /api/projects?status=active
GET /api/projects?status=planning
```

### Create a project
```
POST /api/projects
Body:
{
  "name": "Highway Bridge Phase 1",
  "code": "HB-001",
  "description": "Construction of NH-48 bridge",
  "location": "Pune, Maharashtra",
  "startDate": "2026-10-01T00:00:00.000Z",
  "expectedEndDate": "2027-06-30T00:00:00.000Z",
  "status": "planning",
  "budget": 5000000,
  "managerId": "<your_user_id_from_login>"
}
```

### Update project status
Valid transitions: `planning → active → on_hold → completed`
```
PATCH /api/projects/<project_id>
Body:
{
  "status": "active"
}
```

### Get project dashboard
```
GET /api/dashboard/project/<project_id>
```
Shows inventory, waste, consumption variance scoped to that one project.

---

## 3. Materials

### List all materials
```
GET /api/materials
GET /api/materials?search=cement
GET /api/materials?category=steel
```

### Create a material
```
POST /api/materials
Body:
{
  "name": "OPC Cement 53 Grade",
  "code": "MAT-CEM-53",
  "category": "cement",
  "unit": "bag",
  "reorderLevel": 200,
  "description": "Ordinary Portland Cement 53 grade",
  "hsnCode": "2523"
}
```
Categories: `cement` `steel` `aggregate` `chemical` `pipe` `valve` `electrical` `other`

### Update reorder level
```
PATCH /api/materials/<material_id>
Body:
{
  "reorderLevel": 300
}
```

---

## 4. Suppliers

### List all suppliers
```
GET /api/suppliers
```

### Create a supplier
```
POST /api/suppliers
Body:
{
  "name": "Ultratech Cement Pvt Ltd",
  "code": "SUP-UTC-01",
  "contactPerson": "Ramesh Iyer",
  "email": "ramesh@ultratech.com",
  "phone": "9876543210",
  "address": "Plot 12, MIDC, Pune",
  "rating": 5
}
```

### Update supplier rating
```
PATCH /api/suppliers/<supplier_id>
Body:
{
  "rating": 4
}
```

---

## 5. Purchase Orders (Procurement Flow)

This is the flow that puts stock into inventory. Follow these steps in order.

### Step 1 — Create a PO (status becomes `draft`)
```
POST /api/purchase-orders
Body:
{
  "projectId": "<project_id>",
  "supplierId": "<supplier_id>",
  "items": [
    {
      "materialId": "<material_id>",
      "quantity": 500,
      "unitPrice": 380
    }
  ],
  "expectedDelivery": "2026-10-15T00:00:00.000Z",
  "notes": "Urgent — site starts Oct 12"
}
```

### Step 2 — Approve the PO (status becomes `approved`)
```
PATCH /api/purchase-orders/<po_id>/approve
```
No body needed.

### Step 3 — Receive goods / GRN (status becomes `received`, inventory is updated)
```
POST /api/purchase-orders/<po_id>/receive
Body:
{
  "items": [
    {
      "materialId": "<material_id>",
      "quantity": 500
    }
  ]
}
```
After this, check inventory — `currentStock` for that material+project will increase by 500.

### Cancel a PO (only works on `draft`)
```
PATCH /api/purchase-orders/<po_id>/cancel
```

### Filter POs
```
GET /api/purchase-orders?status=draft
GET /api/purchase-orders?status=approved
GET /api/purchase-orders?projectId=<project_id>
```

---

## 6. Inventory

Inventory is automatically updated by PO receives. You can also manually issue and return.

### View current stock
```
GET /api/inventory
GET /api/inventory?projectId=<project_id>
GET /api/inventory?materialId=<material_id>
```

### Issue material to site (decrements stock)
```
POST /api/inventory/issue
Body:
{
  "materialId": "<material_id>",
  "projectId": "<project_id>",
  "quantity": 50,
  "notes": "Issued to slab casting team"
}
```

### Return unused material (increments stock)
```
POST /api/inventory/return
Body:
{
  "materialId": "<material_id>",
  "projectId": "<project_id>",
  "quantity": 10,
  "notes": "Leftover from column work"
}
```

### View full audit trail (every RECEIVE / ISSUE / RETURN)
```
GET /api/inventory/transactions
GET /api/inventory/transactions?projectId=<project_id>
GET /api/inventory/transactions?materialId=<material_id>
```

---

## 7. Waste Records

Log any material lost on site. System auto-calculates cost impact from purchase history.

### Log a waste event
```
POST /api/waste
Body:
{
  "materialId": "<material_id>",
  "projectId": "<project_id>",
  "quantity": 15,
  "reason": "damaged",
  "description": "Bags torn during unloading",
  "date": "2026-10-04T00:00:00.000Z"
}
```
Reasons: `damaged` `expired` `spillage` `defective` `overuse` `natural_loss` `other`

### View waste records
```
GET /api/waste
GET /api/waste?projectId=<project_id>
GET /api/waste?reason=damaged
```

### Get single record
```
GET /api/waste/<waste_id>
```

---

## 8. Consumption Plans (Planned vs Actual)

Plan how much of a material a project will use in a period, then record what actually happened.

### Create a plan
```
POST /api/consumption-plans
Body:
{
  "projectId": "<project_id>",
  "materialId": "<material_id>",
  "plannedQuantity": 600,
  "plannedUnitCost": 380,
  "period": "2026-10",
  "notes": "October slab casting estimate"
}
```
Period format: `YYYY-MM`

### Record actual usage (triggers variance calculation)
```
PATCH /api/consumption-plans/<plan_id>
Body:
{
  "actualQuantity": 540,
  "actualUnitCost": 395
}
```
Response will now include:
- `quantityVariance` = plannedQuantity - actualQuantity (positive = under budget)
- `costVariance` = plannedCost - actualCost (positive = saved money)

### Get variance report for a whole project
```
GET /api/consumption-plans/report?projectId=<project_id>
GET /api/consumption-plans/report?projectId=<project_id>&period=2026-10
```

### Get variance for a single plan
```
GET /api/consumption-plans/<plan_id>/variance
```

---

## 9. Analytics

All analytics need a `projectId`. Run these after you have some POs received and materials issued.

### ABC Analysis — which materials eat most of your budget
```
GET /api/analytics/abc?projectId=<project_id>
```
Returns each material classified as `A` (top 70% of cost), `B` (next 20%), or `C` (bottom 10%).

### SDE Analysis — procurement difficulty matrix
```
GET /api/analytics/sde?projectId=<project_id>
```
Returns `S` (scarce), `D` (difficult), `E` (easy) classification per material.

### EOQ — optimal reorder quantity
```
GET /api/analytics/eoq?projectId=<project_id>
```
Returns the economically optimal quantity to reorder for each material to minimize holding + ordering costs.

### Cost Analysis — full expense breakdown
```
GET /api/analytics/cost?projectId=<project_id>
GET /api/analytics/cost?projectId=<project_id>&startDate=2026-10-01&endDate=2026-10-31
```
Returns total spend, waste cost, and efficiency scorecards per material.

---

## 10. The Full Manager Workflow (end to end)

Do these in order to see the entire system working together:

1. `POST /api/projects` — create a project
2. `POST /api/materials` — add a material (e.g. cement)
3. `POST /api/suppliers` — add a supplier
4. `POST /api/purchase-orders` — create PO for that material
5. `PATCH /api/purchase-orders/<id>/approve` — approve it
6. `POST /api/purchase-orders/<id>/receive` — receive goods → stock goes up
7. `GET /api/inventory` — confirm stock is in
8. `POST /api/consumption-plans` — plan usage for the month
9. `POST /api/inventory/issue` — issue material to site → stock goes down
10. `POST /api/waste` — log any damaged/lost material
11. `PATCH /api/consumption-plans/<id>` — record actual usage
12. `GET /api/consumption-plans/report?projectId=<id>` — see planned vs actual variance
13. `GET /api/analytics/abc?projectId=<id>` — see ABC classification
14. `GET /api/dashboard/project/<id>` — full project KPI summary

---

## Quick Reference — Base URL

```
http://localhost:5000/api
```

All requests need:
```
Authorization: Bearer <token>
Content-Type: application/json
```
