"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processChat = void 0;
const generative_ai_1 = require("@google/generative-ai");
const env_1 = require("../config/env");
const Project_model_1 = __importDefault(require("../models/Project.model"));
const Material_model_1 = __importDefault(require("../models/Material.model"));
const Supplier_model_1 = __importDefault(require("../models/Supplier.model"));
const PurchaseOrder_model_1 = __importDefault(require("../models/PurchaseOrder.model"));
const Inventory_model_1 = __importDefault(require("../models/Inventory.model"));
const WasteRecord_model_1 = __importDefault(require("../models/WasteRecord.model"));
const ConsumptionPlan_model_1 = __importDefault(require("../models/ConsumptionPlan.model"));
const AppError_1 = require("../utils/AppError");
// ─── System context builder ───────────────────────────────────────────────────
const buildSystemContext = async () => {
    const [projects, materials, suppliers, inventory, wasteRecords, consumptionPlans, purchaseOrders,] = await Promise.all([
        Project_model_1.default.find({}).select('name code status budget location startDate expectedEndDate').lean(),
        Material_model_1.default.find({ isActive: true }).select('name code category unit reorderLevel').lean(),
        Supplier_model_1.default.find({ isActive: true }).select('name code contactPerson email rating').lean(),
        Inventory_model_1.default.find({}).populate('materialId', 'name code unit').populate('projectId', 'name code').lean(),
        WasteRecord_model_1.default.find({}).populate('materialId', 'name').populate('projectId', 'name').lean(),
        ConsumptionPlan_model_1.default.find({}).populate('materialId', 'name').populate('projectId', 'name').lean(),
        PurchaseOrder_model_1.default.find({}).select('poNumber status totalAmount projectId').lean(),
    ]);
    const totalWasteCost = wasteRecords.reduce((sum, r) => sum + (r.costImpact || 0), 0);
    const totalPlannedCost = consumptionPlans.reduce((sum, p) => sum + (p.plannedQuantity * p.plannedUnitCost), 0);
    const totalActualCost = consumptionPlans.reduce((sum, p) => sum + (p.actualQuantity * p.actualUnitCost), 0);
    return `You are an intelligent AI assistant embedded inside a Construction Material Management System called Con.AI.

## YOUR CAPABILITIES
You can:
1. Answer questions about the current system data (projects, inventory, costs, waste, suppliers)
2. Create new projects when the user asks (respond with a JSON action block)
3. Create consumption plans (respond with a JSON action block)
4. Give recommendations, analysis, and insights based on the data
5. Explain features and help users navigate the system
6. Help plan procurement, estimate costs, identify risks

## CURRENT SYSTEM DATA SNAPSHOT
Today: ${new Date().toISOString().split('T')[0]}

### Projects (${projects.length} total)
${projects.map((p) => `- ${p.code}: ${p.name} | Status: ${p.status} | Budget: ₹${p.budget?.toLocaleString() || 'N/A'} | Location: ${p.location}`).join('\n') || 'No projects yet.'}

### Materials Catalog (${materials.length} active)
${materials.map((m) => `- ${m.code}: ${m.name} | Category: ${m.category} | Unit: ${m.unit} | Reorder Level: ${m.reorderLevel}`).join('\n') || 'No materials yet.'}

### Suppliers (${suppliers.length} active)
${suppliers.map((s) => `- ${s.code}: ${s.name} | Rating: ${s.rating}/5 | Contact: ${s.contactPerson}`).join('\n') || 'No suppliers yet.'}

### Inventory Summary (${inventory.length} items)
${inventory.slice(0, 10).map((i) => `- ${i.materialId?.name || 'Unknown'} @ ${i.projectId?.name || 'Unknown'}: ${i.currentStock} units`).join('\n') || 'No inventory yet.'}

### Purchase Orders (${purchaseOrders.length} total)
- Draft: ${purchaseOrders.filter((p) => p.status === 'draft').length}
- Approved: ${purchaseOrders.filter((p) => p.status === 'approved').length}
- Received: ${purchaseOrders.filter((p) => p.status === 'received').length}

### Financial Overview
- Total Waste Cost: ₹${totalWasteCost.toLocaleString()}
- Total Planned Cost: ₹${totalPlannedCost.toLocaleString()}
- Total Actual Cost: ₹${totalActualCost.toLocaleString()}
- Cost Variance: ₹${(totalActualCost - totalPlannedCost).toLocaleString()}

### Waste Records (${wasteRecords.length} incidents)
${wasteRecords.slice(0, 5).map((w) => `- ${w.materialId?.name || 'Unknown'} | Qty: ${w.quantity} | Reason: ${w.reason} | Cost: ₹${w.costImpact}`).join('\n') || 'No waste recorded.'}

## ACTIONS YOU CAN PERFORM
When the user asks you to CREATE something, include a JSON block at the END of your response using this format:

To create a project:
\`\`\`action
{
  "type": "create_project",
  "data": {
    "name": "Project Name",
    "code": "PROJ-001",
    "description": "Description",
    "location": "Location",
    "status": "planning",
    "budget": 5000000,
    "startDate": "2026-10-01T00:00:00.000Z",
    "expectedEndDate": "2027-06-30T00:00:00.000Z"
  }
}
\`\`\`

To create a consumption plan:
\`\`\`action
{
  "type": "create_plan",
  "data": {
    "projectId": "<project _id>",
    "materialId": "<material _id>",
    "plannedQuantity": 500,
    "plannedUnitCost": 380,
    "period": "2026-10",
    "notes": "October estimate"
  }
}
\`\`\`

## RESPONSE STYLE
- Be concise and practical — this is a business tool, not a chatbot
- Use rupee symbol (₹) for costs
- When giving recommendations, reference the actual data you see above
- If asked to create something, always confirm what you created in plain language before the action block
- Keep responses under 300 words unless a detailed analysis is requested
`;
};
// ─── Main chat function ───────────────────────────────────────────────────────
const processChat = async (messages, userId) => {
    if (!env_1.env.GEMINI_API_KEY) {
        throw new AppError_1.AppError('AI assistant is not configured. Please add GEMINI_API_KEY to the backend .env file.', 503);
    }
    const genAI = new generative_ai_1.GoogleGenerativeAI(env_1.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const systemContext = await buildSystemContext();
    // Build history for multi-turn (all messages except the last user message)
    const history = messages.slice(0, -1).map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
    }));
    const chat = model.startChat({
        history: [
            { role: 'user', parts: [{ text: systemContext }] },
            { role: 'model', parts: [{ text: 'Understood. I am ready to assist with the material management system.' }] },
            ...history,
        ],
        generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.4,
        },
    });
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage)
        throw new AppError_1.AppError('No message provided', 400);
    const result = await chat.sendMessage(lastMessage.content);
    const responseText = result.response.text();
    // Parse any action blocks from the response
    const action = await parseAndExecuteAction(responseText, userId);
    // Strip the raw action block from the displayed message
    const cleanMessage = responseText.replace(/```action[\s\S]*?```/g, '').trim();
    return { message: cleanMessage, action };
};
exports.processChat = processChat;
// ─── Action executor ──────────────────────────────────────────────────────────
const parseAndExecuteAction = async (text, userId) => {
    const actionMatch = text.match(/```action\s*([\s\S]*?)```/);
    if (!actionMatch || !actionMatch[1])
        return { type: 'none' };
    let parsed;
    try {
        parsed = JSON.parse(actionMatch[1].trim());
    }
    catch {
        return { type: 'none' };
    }
    if (parsed.type === 'create_project') {
        const d = parsed.data;
        // Auto-generate code if not provided
        if (!d.code) {
            const count = await Project_model_1.default.countDocuments();
            d.code = `PROJ-${String(count + 1).padStart(3, '0')}`;
        }
        const project = await Project_model_1.default.create({
            name: d.name,
            code: d.code.toUpperCase(),
            description: d.description || '',
            location: d.location || 'TBD',
            status: d.status || 'planning',
            budget: d.budget || 0,
            startDate: d.startDate ? new Date(d.startDate) : new Date(),
            expectedEndDate: d.expectedEndDate ? new Date(d.expectedEndDate) : undefined,
            managerId: userId,
        });
        return { type: 'project_created', data: project };
    }
    if (parsed.type === 'create_plan') {
        const d = parsed.data;
        const plan = await ConsumptionPlan_model_1.default.create({
            projectId: d.projectId,
            materialId: d.materialId,
            plannedQuantity: d.plannedQuantity,
            actualQuantity: 0,
            plannedUnitCost: d.plannedUnitCost,
            actualUnitCost: 0,
            period: d.period,
            notes: d.notes || '',
            createdBy: userId,
        });
        return { type: 'plan_created', data: plan };
    }
    return { type: 'none' };
};
//# sourceMappingURL=ai.service.js.map