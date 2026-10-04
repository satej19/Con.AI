# Material Management System — Client Demo Report

**Prepared for:** Client Walkthrough  
**Date:** October 4, 2026  
**Application URL:** http://localhost:5173  
**Demo Credentials:** Provided in Section 1

---

## Overview

The Material Management System is a full-stack web application designed for construction and infrastructure projects. It digitizes the entire material lifecycle — from procurement through consumption — giving project managers real-time visibility into stock, spending, and waste.

This report documents each feature, what it does, how to test it manually, and what the client should observe.

---

## Section 1 — Getting Started

### Start the Application

Before the demo, confirm both servers are running:

| Service  | URL                      |
|----------|--------------------------|
| Backend  | http://localhost:5000    |
| Frontend | http://localhost:5173    |

### Login Credentials

| Role    | Email                   | Password  | What they can do                          |
|---------|-------------------------|-----------|-------------------------------------------|
| Admin   | admin@example.com       | admin123  | Everything including user management      |
| Manager | manager@example.com     | admin123  | Full operations — create, approve, manage |
| User    | user@example.com        | admin123  | View and log data, cannot approve POs     |

**Start the demo as Manager.** It shows the most functionality.

---

## Section 2 — Feature-by-Feature Walkthrough

---

### Feature 1: Dashboard

**What it is:** The home screen. Shows a live snapshot of the entire operation.

**How to test:**
1. Log in as Manager
2. You land on the Dashboard automatically
3. Look at the four summary cards at the top

**What to show the client:**

| Card               | Meaning                                              |
|--------------------|------------------------------------------------------|
| Active Projects    | How many construction sites are currently running    |
| Low Stock Items    | Materials that have fallen below reorder level       |
| Waste Cost         | Money lost to damaged/spoiled materials              |
| POs Received       | Purchase orders that have been delivered to site     |

- Scroll down to see **Recent Purchase Orders** and **Recent Waste Events**
- Use the project selector (top of page) to switch between organization-wide view and a single project

**What the client should see:** A real-time command center. Any problem — low stock, high waste, pending approvals — surfaces here first.

---

### Feature 2: Projects

**What it is:** Central registry of all construction projects. Every PO, inventory item, and waste record is tied to a project.

**How to test:**
1. Click **Projects** in the sidebar
2. Two projects are pre-loaded: *Water Treatment Plant Phase 1* (active) and *Phase 2* (planning)

**Create a new project:**
1. Click **New Project**
2. Fill in:
   - Name: `Highway Bridge Phase 1`
   - Code: `HB-001`
   - Location: `Pune, Maharashtra`
   - Start Date: any future date
   - Budget: `5000000`
3. Save
4. The new project appears in the list with status **Planning**

**Open a project:**
- Click into any project to see its dedicated dashboard — inventory levels, waste costs, and consumption variance, all scoped to that project alone

**What the client should see:** Complete project isolation. Stock and spending for Project A never affects Project B.

---

### Feature 3: Materials

**What it is:** The master catalog of all construction materials used across projects.

**How to test:**
1. Click **Materials** in the sidebar
2. Five materials are pre-loaded: Portland Cement, Steel Bars, River Sand, PVC Pipes, Chemical Treatment

**Demonstrate search and filter:**
- Type `cement` in the search box — list filters instantly
- Use the Category dropdown to filter by `steel`, `chemical`, etc.

**Create a new material:**
1. Click **Add Material**
2. Fill in:
   - Name: `OPC Cement 53 Grade`
   - Code: `MAT-CEM-53`
   - Category: `cement`
   - Unit: `bag`
   - Reorder Level: `200`
3. Save

**What the client should see:** A centralized material catalog. The reorder level is the threshold that triggers low-stock alerts on the dashboard.

---

### Feature 4: Suppliers

**What it is:** Directory of vendors who supply materials to your projects.

**How to test:**
1. Click **Suppliers** in the sidebar
2. Three suppliers are pre-loaded

**Create a new supplier:**
1. Click **Add Supplier**
2. Fill in:
   - Name: `Ultratech Cement Pvt Ltd`
   - Code: `SUP-UTC-01`
   - Contact Person: `Ramesh Iyer`
   - Email: `ramesh@ultratech.com`
   - Phone: `9876543210`
   - Address: `Plot 12, MIDC, Pune`
   - Rating: `5`
3. Save

**What the client should see:** Supplier profiles with ratings. Over time, ratings reflect delivery reliability and help procurement teams make better choices.

---

### Feature 5: Purchase Orders (Procurement Flow)

**What it is:** The procurement workflow. Materials enter inventory only through approved and received POs — no manual stock entry.

**How to test — do these steps in order:**

**Step 1 — Create a PO (status: Draft)**
1. Click **Purchase Orders** → **New Purchase Order**
2. Select Project: *Water Treatment Plant Phase 1*
3. Select Supplier: *ABC Cement Supplies*
4. Add line item: Material = *Portland Cement*, Quantity = `500`, Unit Price = `380`
5. Set Expected Delivery: any upcoming date
6. Add Notes: `Urgent — site starts next week`
7. Save → status is **Draft**

**Step 2 — Approve the PO (status: Approved)**
1. Open the PO you just created
2. Click **Approve**
3. Status changes to **Approved**

> Point out: only a Manager or Admin can approve. A regular User cannot.

**Step 3 — Receive Goods / GRN (status: Received)**
1. Still on the same PO, click **Receive Goods**
2. Confirm quantity: `500`
3. Confirm → status becomes **Received**

> At this moment, inventory is automatically updated. No separate stock entry is needed.

**Filter POs by status:**
- Use the filter to show only `Draft`, `Approved`, or `Received` POs

**What the client should see:** A controlled procurement chain. Nothing gets into stock without a PO → Approval → Receipt sequence. Complete audit trail at every step.

---

### Feature 6: Inventory

**What it is:** Live stock ledger. Updated automatically by PO receipts. Supports manual issue and return transactions.

**How to test:**
1. Click **Inventory** in the sidebar
2. Portland Cement for *Water Treatment Plant Phase 1* now shows `500` bags (from the PO received above)

**Issue material to site (stock goes down):**
1. Click **Issue Material**
2. Select Project: *Phase 1*, Material: *Portland Cement*, Quantity: `50`
3. Notes: `Issued to slab casting team`
4. Confirm → stock drops from 500 to **450**

**Return unused material (stock goes up):**
1. Click **Return Material**
2. Same project and material, Quantity: `10`
3. Notes: `Leftover from column work`
4. Confirm → stock rises from 450 to **460**

**View the full audit trail:**
- Click the **Transactions** tab
- Every RECEIVE, ISSUE, and RETURN is listed with timestamp, quantity, and notes

**What the client should see:** Full traceability. You can answer at any moment: *how much do we have, where did it go, and who moved it.*

---

### Feature 7: Waste Records

**What it is:** Log for material lost on site due to damage, spillage, expiry, or mishandling. System auto-calculates the financial impact.

**How to test:**
1. Click **Waste** in the sidebar
2. Click **Log Waste**
3. Fill in:
   - Project: *Water Treatment Plant Phase 1*
   - Material: *Portland Cement*
   - Quantity: `15`
   - Reason: `Damaged`
   - Description: `Bags torn during unloading`
   - Date: today
4. Save

**What to show:**
- The waste record appears with an auto-calculated cost (15 bags × ₹380 = ₹5,700)
- Filter by reason — `damaged`, `spillage`, `expired`, etc.
- This cost feeds directly into the Dashboard's **Total Waste Cost** figure

**What the client should see:** Every unit of lost material is recorded and costed. Over a project's lifetime this data reveals patterns — which sites, which materials, which activities generate the most waste.

---

### Feature 8: Consumption Plans (Planned vs Actual)

**What it is:** Monthly budgeting for material consumption. Plan how much you expect to use, record what actually happened, and see the variance.

**How to test:**

**Create a plan:**
1. Click **Consumption** in the sidebar
2. Click **New Plan**
3. Fill in:
   - Project: *Water Treatment Plant Phase 1*
   - Material: *Portland Cement*
   - Planned Quantity: `600`
   - Planned Unit Cost: `380`
   - Period: `2026-10`
   - Notes: `October slab casting estimate`
4. Save

**Record actual usage:**
1. Open the plan just created
2. Enter:
   - Actual Quantity: `540`
   - Actual Unit Cost: `395`
3. Save

**Variance results:**
| Metric             | Value                                   |
|--------------------|-----------------------------------------|
| Quantity Variance  | +60 bags (used less than planned — good)|
| Cost Variance      | System calculates planned vs actual cost|

**Get the full project variance report:**
- Go to **Reports** tab or use the consumption report view
- Select the project to see all materials' planned vs actual side by side

**What the client should see:** Budget discipline at the material level. Every month, every material, every project — planned vs actual is visible and measurable.

---

### Feature 9: Analytics

**What it is:** Data-driven insights derived from procurement and consumption history. Helps optimize purchasing decisions.

**How to test:**
1. Click **Analytics** in the sidebar
2. Make sure a project is selected (the one where you've created POs and issued material)

**ABC Analysis:**
- Shows materials classified as **A**, **B**, or **C** based on their share of total cost
- **A** = top 70% of cost → needs tightest control
- **B** = next 20%
- **C** = bottom 10% → low priority

> *"Focus procurement attention on A-class materials. In most projects, 2–3 materials drive 70% of the budget."*

**EOQ — Economic Order Quantity:**
- Shows the mathematically optimal quantity to order each time
- Minimizes the combined cost of holding stock and placing orders

**SDE Analysis:**
- Classifies materials by procurement difficulty
- **S** = Scarce (hard to get), **D** = Difficult, **E** = Easy
- Helps plan lead times and safety stock levels

**Cost Analysis:**
- Full breakdown: ordered cost, issued quantity, wasted quantity, waste rate %
- Can be filtered by date range for period-specific reporting

**What the client should see:** The system doesn't just store data — it derives actionable insights from it. Procurement teams can make evidence-based decisions instead of guessing.

---

### Feature 10: Reports Page

**What it is:** A printable summary report assembled from the dashboard and analytics APIs.

**How to test:**
1. Click **Reports** in the sidebar
2. View the auto-generated summary:
   - Active projects, stock value, low-stock items, POs received
   - Financial position: planned cost, actual cost, cost variance, waste cost
   - Operational coverage: total projects, materials, suppliers, POs
3. Select a project to add the project-level cost analysis section
4. Click **Print Report** (top right) to open the browser print dialog

**What the client should see:** A one-click report ready for management meetings or client submissions.

---

### Feature 11: User Management (Admin only)

**How to test:**
1. Log out
2. Log in as **Admin** (`admin@example.com` / `admin123`)
3. Click **Users** in the sidebar

**What to show:**
- All registered users are listed with their roles
- Admin can change roles: `admin` / `manager` / `user`
- Each role has different permissions — only managers and admins can approve POs

**What the client should see:** Controlled access. The right people have the right permissions. An on-site worker can log data but cannot approve financial commitments.

---

## Section 3 — The End-to-End Story (Demo Script)

Use this sequence to show the entire system in one smooth 10-minute flow:

| Step | Action                              | What changes                          |
|------|-------------------------------------|---------------------------------------|
| 1    | Create a project                    | Appears in Projects list              |
| 2    | Create a material                   | Added to material catalog             |
| 3    | Create a supplier                   | Added to supplier directory           |
| 4    | Create a Purchase Order             | PO created, status = Draft            |
| 5    | Approve the PO                      | Status = Approved                     |
| 6    | Receive goods (GRN)                 | Status = Received, stock updates      |
| 7    | Check Inventory                     | Stock shows the received quantity     |
| 8    | Create a Consumption Plan           | Monthly budget set                    |
| 9    | Issue material to site              | Stock decrements                      |
| 10   | Log a waste incident                | Waste cost added to dashboard         |
| 11   | Record actual consumption           | Variance calculated                   |
| 12   | View Analytics (ABC / Cost)         | Insights generated from real data     |
| 13   | Open Reports page                   | Full summary ready to print           |
| 14   | Open Dashboard                      | Everything reflected in one view      |

---

## Section 4 — Key Selling Points for the Client

- **No manual stock entry** — inventory updates automatically when a PO is received
- **Approval workflow** — nothing is committed without a manager sign-off
- **Complete audit trail** — every movement of every material is logged
- **Project isolation** — stock and costs for each project are always separate
- **Waste accountability** — every lost unit is costed and visible to management
- **Planned vs actual** — monthly variance analysis at the material level
- **Analytics built in** — ABC, EOQ, and SDE classification come out of the box
- **Role-based access** — workers, managers, and admins each see what they need
- **Print-ready reports** — one-click PDF for management meetings

---

## Section 5 — Reset Between Demos

If you want to start fresh for each client session, run this from the backend folder:

```powershell
npm run reset
```

This wipes all POs, inventory, waste records, and consumption plans, then re-creates the demo user accounts and base data. Takes about 5 seconds.

---

*Material Management System — Client Demo Report — October 2026*
