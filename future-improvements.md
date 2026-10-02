# Future Improvements — Con.AI Material Management System

> This document maps how data currently flows through the system and outlines high-impact improvements that go significantly beyond what traditional paper-based or spreadsheet-driven construction material management can offer. AI improvements are highlighted separately as the highest-leverage opportunity.

---

## How Data Currently Flows

```
ACTOR                 ACTION                        DATA STORE
─────────────────────────────────────────────────────────────────────

[Admin/Manager]
    │
    ├─► Register / Login ──────────────────────────► Users (MongoDB)
    │       JWT issued, stored in localStorage
    │
    ├─► Create Project ────────────────────────────► Projects
    │       code, name, location, budget, dates
    │
    ├─► Add Materials ─────────────────────────────► Materials
    │       code, category, unit, reorder level
    │
    ├─► Register Suppliers ────────────────────────► Suppliers
    │       contact, rating, materials supplied
    │
    └─► Create Purchase Order (Draft)
            projectId + supplierId + line items
                │
                ▼
    [Manager] Approve PO ─────────────────────────► PurchaseOrders
                │                                     status: approved
                ▼
    [User/Manager] Receive Goods ─────────────────► Inventory (upsert)
                │                                     InventoryTransactions
                │                                     (type: RECEIVE)
                ▼
    [User] Issue Material to Site ────────────────► Inventory (decrement)
                │                                     InventoryTransactions
                │                                     (type: ISSUE)
                ▼
    [User] Return Unused Material ─────────────────► Inventory (increment)
                                                      InventoryTransactions
                                                      (type: RETURN)

[Any User]
    ├─► Log Waste Incident ────────────────────────► WasteRecords
    │       materialId, projectId, reason,            costImpact auto-calculated
    │       quantity, date                            from avg PO unit price
    │
    ├─► Create Consumption Plan ───────────────────► ConsumptionPlans
    │       period, plannedQty, plannedUnitCost        variance computed on read
    │
    └─► Update Actuals ────────────────────────────► ConsumptionPlans
            actualQty, actualUnitCost                 costVariance = actual - planned

READ LAYER (no writes):
    Dashboard  ──► aggregates Projects + POs + Inventory + Waste + Consumption
    Analytics  ──► ABC (consumption value rank) + SDE (scarcity) + EOQ (order qty)
    Reports    ──► Dashboard summary + Cost analysis joined view
```

### Key observations about the current flow

- Every state change goes through a validated REST endpoint with JWT auth and role checks.
- Inventory is event-sourced via `InventoryTransaction` — every stock change is auditable.
- Cost impact on waste is computed server-side from the weighted average unit price of approved POs, not entered manually.
- Analytics (ABC, SDE, EOQ) are computed on-demand from live transaction data, not cached.
- The frontend never writes directly to the database — all mutations go through the Express API.

---

## AI Improvements

> These are the highest-leverage additions. Each one uses the transaction data the system already collects and turns it into decisions the system makes for you — rather than decisions a human has to make from a report.

### AI-1. Intelligent Demand Forecasting

**What it replaces:** The current static `reorderLevel` field set manually when a material is created and rarely updated.

**How it works:**
- A time-series model (e.g. Facebook Prophet or a simple ARIMA) trains on `InventoryTransaction` ISSUE records per material per project.
- It learns consumption patterns — acceleration during concrete pours, slowdowns during monsoon, phase-specific spikes.
- Output: a `predictedStockoutDate` per inventory item, recomputed nightly.
- The dashboard card "Low Stock Alerts" becomes "Predicted Stockout in N days" with a confidence interval.

**Data the system already has:** daily ISSUE quantities, project phase (from `Project.status`), seasonal dates (from transaction `createdAt`).

**Integration point:**
```
POST /ai/forecast/reorder
  → reads InventoryTransaction (ISSUE) for last 90 days
  → returns { materialId, projectId, predictedStockoutDate, suggestedReorderDate, suggestedQuantity }
  → stored in a new ForecastCache collection, refreshed via a nightly cron
```

**Impact:** Eliminates emergency spot-buys that carry 18–30% price premiums. Gives procurement a 7–14 day head start.

---

### AI-2. Anomaly Detection on Waste and Consumption

**What it replaces:** A manager manually reviewing the Waste Incidents table hoping to spot a pattern.

**How it works:**
- Statistical baseline: compute the mean and standard deviation of waste quantity per material per project phase.
- Flag any waste record where `quantity > mean + 2σ` as an anomaly — surface it immediately on the dashboard as a red alert.
- Extend to consumption: flag any period where `actualQuantity > plannedQuantity * 1.25` as an anomaly.
- Cluster anomalies by `reason` (damaged, spillage, overuse) to identify systemic issues — e.g. all defective waste comes from one supplier.

**Integration point:**
```
GET /ai/anomalies?projectId=...
  → returns [{ type: 'waste' | 'consumption', severity: 'high' | 'medium', 
               materialId, reason, value, baseline, deviation, date }]
```

**Impact:** A site manager currently discovers over-consumption 2–4 weeks late when a reorder fails. Anomaly detection surfaces it within 24 hours of the incident.

---

### AI-3. AI Procurement Assistant (LLM-Powered)

**What it replaces:** A manager writing a purchase order by looking up materials, checking stock levels, finding supplier codes, and filling in quantities manually.

**How it works:**
- A chat interface powered by an LLM (GPT-4o or a fine-tuned open model) with tool calls into the existing API.
- The user types: *"We're starting the foundation pour for WTP-P1 next week, create a draft PO for everything we'll need."*
- The AI queries `/inventory` for current stock, `/consumption-plans` for planned quantities, `/suppliers` for rated suppliers, calculates shortfall, and drafts the PO items.
- User reviews and approves — the AI calls `POST /purchase-orders` on their behalf.

**Tools the LLM gets:**
| Tool | Maps to |
|---|---|
| `get_inventory(projectId)` | `GET /inventory?projectId=` |
| `get_consumption_plan(projectId, period)` | `GET /consumption-plans` |
| `get_best_supplier(materialId)` | `GET /suppliers` filtered by rating + material |
| `create_draft_po(body)` | `POST /purchase-orders` |
| `get_waste_summary(projectId)` | `GET /waste?projectId=` |

**Impact:** Reduces PO creation time from 20–40 minutes (lookup + fill form) to under 2 minutes. Captures implicit knowledge — a senior PM's supplier preferences encoded as rating data.

---

### AI-4. Natural Language Report Generation

**What it replaces:** The current static Operations Report page that shows numbers a non-technical stakeholder still has to interpret.

**How it works:**
- After the dashboard summary and cost analysis load, send the structured data to an LLM with a prompt: *"You are a construction site analyst. Summarize this project's material performance in 3 sentences for a client presentation."*
- Return a plain-English paragraph alongside the numbers.
- Example output: *"Site WTP-P1 is tracking 12% over planned material cost, driven primarily by cement overuse in Q3 (actual: 820 bags vs planned: 680). Two anomalous waste events in October account for ₹1.4L of the variance. Recommend tightening the cement consumption plan for Q4 and reviewing the delivery quality from Supplier SUP-004."*

**Integration point:** Thin wrapper around the existing `/dashboard/summary` + `/analytics/cost` endpoints. No new data needed.

**Impact:** Reports that today require an analyst to write now generate themselves. Client-ready in one click.

---

### AI-5. Smart Waste Root-Cause Classification

**What it replaces:** The `reason` dropdown (damaged / expired / spillage / defective / overuse / natural_loss / other) which is selected by the person logging the waste — subjective and inconsistently used.

**How it works:**
- When a waste record is submitted with `reason: other` or `description` text, send the description to a text classification model.
- The model predicts the most likely root cause from the existing enum and a confidence score.
- If confidence > 0.85, auto-classify. If lower, suggest to the user: *"This sounds like overuse — confirm?"*
- Over time, build a training dataset from confirmed classifications specific to this system's vocabulary.

**Integration point:**
```
POST /ai/classify-waste
  body: { description: string, quantity: number, materialCategory: string }
  returns: { predictedReason: WasteReason, confidence: number }
```

**Impact:** Turns the waste log into reliable structured data. The current `reason` field is too inconsistently filled to use for supplier blame analysis or process improvement. Clean classification unlocks everything downstream.

---

### AI-6. Price Negotiation Intelligence

**What it replaces:** A procurement manager checking prices from memory or calling multiple suppliers to benchmark.

**How it works:**
- The system already stores `unitPrice` per material per PO per supplier over time.
- Train a simple regression on `(materialId, supplierId, quantity, month)` → `unitPrice`.
- When creating a new PO, surface: *"You paid ₹48/bag for OPC 53 cement from SUP-002 in August. SUP-004 offered ₹44/bag in September for a similar quantity. Consider switching or using this as leverage."*

**Data already available:** All PO line items with `materialId`, `supplierId`, `unitPrice`, `quantity`, `orderDate`.

**Impact:** Direct cost reduction. A 5% reduction in material unit price on a ₹1Cr material budget saves ₹5L. No new data collection — just mining what's already there.

---

### AI-7. Project Completion Material Risk Score

**What it replaces:** End-of-project reviews where the team discovers they ran out of a critical material and it delayed the handover date.

**How it works:**
- Combine current stock levels, consumption plans, planned project end date, and average supplier lead time.
- For each material on a project, compute a `riskScore` = probability of stockout before `project.expectedEndDate`.
- Display as a risk matrix: materials plotted by criticality (ABC class) vs. stockout risk.
- High-criticality + high-risk items trigger an immediate alert.

**Integration point:**
```
GET /ai/risk-matrix?projectId=...
  → returns [{ materialId, name, abcClass, stockoutRisk: 0-1, 
               currentStock, requiredToComplete, shortfall, leadTimeDays }]
```

**Impact:** Transforms project completion planning from reactive (discovering shortages) to proactive (eliminating them weeks in advance).

---

## Non-AI Infrastructure Improvements

### 8. Real-Time Inventory Sync with IoT / RFID

**What it replaces:** Manual stock counts, clipboard-based goods receipt, phone calls to check if material arrived.

**What it adds:**
- RFID tags on material batches auto-trigger a `RECEIVE` transaction when scanned at the gate.
- Weight sensors on cement silos push live consumption data, eliminating the need to manually log issues.
- The `InventoryTransaction` schema already supports `referenceType` — add `RFID_SCAN` and `SENSOR_READ` as reference types with no breaking changes.

**Impact:** Inventory accuracy goes from ±15% (manual entry lag) to near-real-time. Eliminates ghost stock.

---

### 9. Digital Goods Receipt Note (GRN) with Photo Evidence

**What it replaces:** Paper GRN signed by the store keeper, filed in a cabinet, lost in disputes.

**What it adds:**
- On the `POST /purchase-orders/:id/receive` flow, attach photos of the delivered batch (uploaded to S3/Cloudflare R2).
- Store photo URLs in `InventoryTransaction.attachments[]`.
- Generate a PDF GRN automatically with PO number, received quantities, photos, and the receiver's digital signature.

**Impact:** Resolves supplier payment disputes in minutes instead of days. Legally admissible audit trail.

---

### 10. Budget Burn-Down Tracker per Project

**What it replaces:** Monthly budget meetings where a manager opens a spreadsheet and manually updates figures.

**What it adds:**
- A real-time budget burn curve: `project.budget` vs. cumulative `PurchaseOrder.totalAmount` (approved + received).
- Add `commitments` (approved but not yet received POs) as a separate line — a common source of budget surprises.
- Forecast completion cost using current burn rate extrapolated to `project.expectedEndDate`.

**Impact:** Gives PMs a 4–6 week early warning on budget overruns instead of discovering them at month-end.

---

### 11. Supplier Performance Scoring (Automated)

**What it replaces:** Subjective 1–5 star rating entered manually, rarely updated.

**What it adds:**
- Auto-compute a supplier score from on-time delivery rate, defect-linked waste rate, and price stability.
- Score updates automatically every time a PO is received or a waste record is logged.

**Schema change needed:** Add `supplierId` FK to `WasteRecord`.

**Impact:** Procurement decisions backed by data. Identifies suppliers who consistently deliver late.

---

### 12. Multi-Site Material Transfer

**What it replaces:** Writing off excess stock at Site A while urgently buying the same material for Site B.

**What it adds:**
- New transaction type `TRANSFER` in `InventoryTransaction`.
- API: `POST /inventory/transfer` — decrements source, increments destination, creates two linked transactions.

**Impact:** Eliminates cross-site waste that averages 8–12% of total material cost on multi-site programs.

---

### 13. Offline-First PWA

**What it replaces:** Store keepers walking back to the site office with connectivity to log a receipt.

**What it adds:**
- Service worker queues mutations (ISSUE, RETURN, waste records) in IndexedDB when offline.
- Syncs automatically when connectivity resumes.

**Impact:** Removes the last blocker to 100% digital adoption at the point of activity.

---

## Advantage Over Traditional Systems

| Capability | Spreadsheet / Paper | Con.AI (Current) | Con.AI + AI Layer |
|---|---|---|---|
| Stock accuracy | ±15%, updated weekly | Real-time per transaction | Real-time + IoT sensor feeds |
| Reorder trigger | Fixed threshold, manual | Fixed threshold, visual alert | AI-predicted, 7–14 days early |
| Waste analysis | Not done | Logged with reason | AI root-cause classified, anomaly-flagged |
| PO creation | 20–40 min manual | Guided form, ~8 min | AI assistant drafts it, <2 min |
| Supplier accountability | Subjective rating | Manual 1–5 star | Auto-scored + price intelligence |
| Budget visibility | Month-end report | Live PO tracking | AI risk score + burn forecast |
| Reporting | Analyst writes it | Static numbers page | AI generates plain-English summary |
| Project risk | Discovered at handover | Not addressed | AI stockout risk matrix |

---

## Recommended Implementation Order

**Phase 1 — No AI, high immediate value (Months 1–2)**
1. Budget burn-down tracker — zero schema changes, 1 week.
2. Supplier performance scoring — one FK, 2 weeks.
3. Multi-site material transfer — one new transaction type, 2 weeks.
4. Document attachments + GRN photos — S3 + schema, 3 weeks.

**Phase 2 — AI foundations (Month 3)**

5. Anomaly detection on waste and consumption — uses existing data, statistical approach, no LLM needed, 2 weeks.
6. Price negotiation intelligence — regression on existing PO price history, 2 weeks.
7. Smart waste root-cause classification — text classifier, can use a small local model, 2 weeks.

**Phase 3 — Predictive AI (Months 4–5)**

8. Demand forecasting — needs 3+ months of transaction history to be reliable, 3 weeks.
9. Project completion risk score — builds on forecasting output, 2 weeks.
10. Natural language report generation — thin LLM wrapper on existing endpoints, 1 week.

**Phase 4 — Agentic AI (Month 6)**

11. AI Procurement Assistant — LLM with tool calls, requires careful testing of PO creation flow, 4 weeks.

**Phase 5 — Hardware (Year 2)**

12. IoT / RFID integration — hardware procurement, site-specific setup, firmware, 3–6 months.
13. PWA offline support — significant frontend rework, plan after Phase 3.


---

## How Data Currently Flows

```
ACTOR                 ACTION                        DATA STORE
─────────────────────────────────────────────────────────────────────

[Admin/Manager]
    │
    ├─► Register / Login ──────────────────────────► Users (MongoDB)
    │       JWT issued, stored in localStorage
    │
    ├─► Create Project ────────────────────────────► Projects
    │       code, name, location, budget, dates
    │
    ├─► Add Materials ─────────────────────────────► Materials
    │       code, category, unit, reorder level
    │
    ├─► Register Suppliers ────────────────────────► Suppliers
    │       contact, rating, materials supplied
    │
    └─► Create Purchase Order (Draft)
            projectId + supplierId + line items
                │
                ▼
    [Manager] Approve PO ─────────────────────────► PurchaseOrders
                │                                     status: approved
                ▼
    [User/Manager] Receive Goods ─────────────────► Inventory (upsert)
                │                                     InventoryTransactions
                │                                     (type: RECEIVE)
                ▼
    [User] Issue Material to Site ────────────────► Inventory (decrement)
                │                                     InventoryTransactions
                │                                     (type: ISSUE)
                ▼
    [User] Return Unused Material ─────────────────► Inventory (increment)
                                                      InventoryTransactions
                                                      (type: RETURN)

[Any User]
    ├─► Log Waste Incident ────────────────────────► WasteRecords
    │       materialId, projectId, reason,            costImpact auto-calculated
    │       quantity, date                            from avg PO unit price
    │
    ├─► Create Consumption Plan ───────────────────► ConsumptionPlans
    │       period, plannedQty, plannedUnitCost        variance computed on read
    │
    └─► Update Actuals ────────────────────────────► ConsumptionPlans
            actualQty, actualUnitCost                 costVariance = actual - planned

READ LAYER (no writes):
    Dashboard  ──► aggregates Projects + POs + Inventory + Waste + Consumption
    Analytics  ──► ABC (consumption value rank) + SDE (scarcity) + EOQ (order qty)
    Reports    ──► Dashboard summary + Cost analysis joined view
```

### Key observations about the current flow

- Every state change goes through a validated REST endpoint with JWT auth and role checks.
- Inventory is event-sourced via `InventoryTransaction` — every stock change is auditable.
- Cost impact on waste is computed server-side from the weighted average unit price of approved POs, not entered manually.
- Analytics (ABC, SDE, EOQ) are computed on-demand from live transaction data, not cached.
- The frontend never writes directly to the database — all mutations go through the Express API.

---

## Future Improvements

### 1. Real-Time Inventory Sync with IoT / RFID

**What it replaces:** Manual stock counts, clipboard-based goods receipt, phone calls to check if material arrived.

**What it adds:**
- RFID tags on material batches auto-trigger a `RECEIVE` transaction when scanned at the gate.
- Weight sensors on cement silos push live consumption data, eliminating the need to manually log issues.
- The `InventoryTransaction` schema already supports `referenceType` — add `RFID_SCAN` and `SENSOR_READ` as reference types with no breaking changes.

**Impact:** Inventory accuracy goes from ±15% (manual entry lag) to near-real-time. Eliminates ghost stock.

---

### 2. Predictive Reorder Alerts (ML-based)

**What it replaces:** Fixed reorder level thresholds that ignore seasonality, project phase, or delivery lead time.

**What it adds:**
- Train a lightweight regression model on `InventoryTransaction` history per material per project phase.
- Predict stockout date given current consumption rate and flag it N days before, based on supplier lead time stored per supplier.
- Surface as a push notification and a new dashboard card: "Predicted stockout in 4 days — Cement OPC 53".

**Data already available:** Daily ISSUE transactions, PO lead times (orderDate → actualDelivery), reorder levels. No new data collection needed.

**Impact:** Eliminates emergency procurement premiums (typically 18–30% higher unit prices on spot buys).

---

### 3. Digital Goods Receipt Note (GRN) with Photo Evidence

**What it replaces:** Paper GRN signed by the store keeper, filed in a cabinet, lost in disputes.

**What it adds:**
- On the `POST /purchase-orders/:id/receive` flow, attach photos of the delivered batch (uploaded to S3/Cloudflare R2).
- Store photo URLs in `InventoryTransaction.attachments[]`.
- Generate a PDF GRN automatically with PO number, received quantities, photos, and the receiver's digital signature.

**Impact:** Resolves supplier payment disputes in minutes instead of days. Legally admissible audit trail.

---

### 4. Budget Burn-Down Tracker per Project

**What it replaces:** Monthly budget meetings where a manager opens a spreadsheet and manually updates figures.

**What it adds:**
- A real-time budget burn curve: `project.budget` vs. cumulative `PurchaseOrder.totalAmount` (approved + received).
- Add `commitments` (approved but not yet received POs) as a separate line — a common source of budget surprises.
- Forecast completion cost using current burn rate extrapolated to `project.expectedEndDate`.

**Data already available:** All of this computable from Projects + PurchaseOrders + ConsumptionPlans. No schema change required.

**Impact:** Gives PMs a 4–6 week early warning on budget overruns instead of discovering them at month-end.

---

### 5. Supplier Performance Scoring (Automated)

**What it replaces:** Subjective 1–5 star rating entered manually, rarely updated.

**What it adds:**
- Auto-compute a supplier score from:
  - On-time delivery rate: `(actualDelivery - expectedDelivery)` across all POs.
  - Quality rejection rate: waste records with `reason: defective` linked back to the supplier's POs.
  - Price stability: variance in `unitPrice` across POs for the same material over time.
- Score updates automatically every time a PO is received or a waste record is logged.

**Schema change needed:** Add `supplierId` foreign key to `WasteRecord` (currently only has `projectId` + `materialId`).

**Impact:** Procurement decisions backed by data rather than relationship. Identifies suppliers who consistently deliver late — a major cause of project delays.

---

### 6. Multi-Site Material Transfer

**What it replaces:** Writing off excess stock at Site A as waste while urgently buying the same material for Site B.

**What it adds:**
- New transaction type `TRANSFER` in `InventoryTransaction`.
- API: `POST /inventory/transfer` — decrements stock at source project, increments at destination project, creates two linked transactions.
- UI: Transfer modal in the Inventory page showing available surplus (items above reorder level) at other sites.

**Impact:** Eliminates cross-site waste that currently averages 8–12% of total material cost on multi-site programs.

---

### 7. QR Code-Based Site Issue Slips

**What it replaces:** Handwritten paper slips that the store keeper fills out every time a worker draws material.

**What it adds:**
- Each `InventoryTransaction` of type `ISSUE` generates a unique QR code.
- The worker scans it with their phone to confirm receipt — creates a digital acknowledgement record.
- No app install needed — a PWA page handles the scan flow.

**Impact:** Traceability to the individual worker level. Disputes about "who took what" resolved with a scan.

---

### 8. Offline-First Mobile Support (PWA)

**What it replaces:** Store keepers having to walk back to the site office with connectivity to log a receipt.

**What it adds:**
- Convert the frontend to a Progressive Web App with a service worker.
- Queue `ISSUE`, `RETURN`, and waste record mutations locally when offline (IndexedDB).
- Sync automatically when connectivity resumes — conflict resolution based on `lastUpdated` timestamps.

**Impact:** Construction sites frequently have poor connectivity. This removes the last blocker to 100% digital adoption at the point of activity.

---

### 9. Document Attachment Support

**What it replaces:** Separate folder structures or email threads for material test certificates, safety data sheets, and invoices.

**What it adds:**
- `attachments[]` array on `Material`, `PurchaseOrder`, and `WasteRecord` models.
- Upload to object storage (S3-compatible). Store URL + filename + uploadedBy + uploadedAt.
- Render in the detail views — one click to see the test certificate for the steel that was received.

**Impact:** Audits and ISO certification reviews that currently take weeks of document hunting take hours.

---

### 10. Role-Based Dashboard Personalization

**What it replaces:** Every user sees the same executive dashboard regardless of what they actually do.

**What it adds:**
- Admin sees: user activity, system health, cross-project budget summary.
- Manager sees: project burn-down, pending PO approvals, low-stock alerts.
- User sees: today's pending issues/returns, their recent transactions, consumption plan actuals to update.

**Schema change needed:** None. All data already exists. Pure frontend routing and component composition change.

**Impact:** Reduces time-to-action for each role. Users stop ignoring the dashboard because it shows them what they need, not everything.

---

## Advantage Over Traditional Systems

| Capability | Spreadsheet / Paper | Con.AI (Current) | Con.AI (With Above) |
|---|---|---|---|
| Stock accuracy | ±15%, updated weekly | Real-time on every transaction | Real-time + IoT sensor feeds |
| Reorder trigger | Fixed threshold, manual check | Fixed threshold, visual alert | ML-predicted, proactive notification |
| Waste cost tracking | Not done | Auto-calculated from PO prices | Linked to supplier, traced to worker |
| Supplier accountability | Subjective rating | Manual 1-5 star | Auto-scored on delivery, quality, price |
| Budget visibility | Month-end report | Live PO commitment tracking | Burn-down with completion forecast |
| Audit trail | Paper files | Full transaction history, immutable | + photo evidence + digital signatures |
| Multi-site coordination | Phone calls | Per-project inventory | Cross-site transfer with one click |
| Field adoption | Clipboard + phone photos | Web app (needs connectivity) | PWA, works offline |
| Document management | Email / shared drive | — | Attached to every material and PO |

---

## Recommended Implementation Order

1. **Budget burn-down tracker** — zero schema changes, high PM visibility, 1 week effort.
2. **Supplier performance scoring** — one FK addition to WasteRecord, 2 weeks effort.
3. **Multi-site material transfer** — one new transaction type, 2 weeks effort.
4. **Document attachments** — S3 integration + schema extension, 3 weeks effort.
5. **GRN with photos** — builds on #4, 1 additional week.
6. **Role-based dashboard** — pure frontend, 2 weeks effort.
7. **Predictive reorder** — requires 3+ months of transaction history to train, plan for month 4.
8. **PWA offline support** — significant frontend rework, plan for month 5.
9. **QR code site slips** — builds on PWA, plan for month 6.
10. **IoT / RFID integration** — requires hardware procurement and site-specific setup, plan for year 2.
