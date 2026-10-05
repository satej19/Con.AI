import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';
import Project from '../models/Project.model';
import Material from '../models/Material.model';
import Supplier from '../models/Supplier.model';
import PurchaseOrder from '../models/PurchaseOrder.model';
import Inventory from '../models/Inventory.model';
import WasteRecord from '../models/WasteRecord.model';
import ConsumptionPlan from '../models/ConsumptionPlan.model';
import { AppError } from '../utils/AppError';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface AiResponse {
  message: string;
  action?: ActionResult;
}

export interface ActionResult {
  type: 'project_created' | 'plan_created' | 'none';
  data?: any;
}

// ─── System context builder ───────────────────────────────────────────────────

const buildSystemContext = async (): Promise<string> => {
  const [
    projects,
    materials,
    suppliers,
    inventory,
    wasteRecords,
    consumptionPlans,
    purchaseOrders,
  ] = await Promise.all([
    Project.find({}).select('name code status budget location startDate expectedEndDate').lean(),
    Material.find({ isActive: true }).select('name code category unit reorderLevel').lean(),
    Supplier.find({ isActive: true }).select('name code contactPerson email rating').lean(),
    Inventory.find({}).populate('materialId', 'name code unit').populate('projectId', 'name code').lean(),
    WasteRecord.find({}).populate('materialId', 'name').populate('projectId', 'name').lean(),
    ConsumptionPlan.find({}).populate('materialId', 'name').populate('projectId', 'name').lean(),
    PurchaseOrder.find({}).select('poNumber status totalAmount projectId').lean(),
  ]);

  const totalWasteCost = wasteRecords.reduce((sum: number, r: any) => sum + (r.costImpact || 0), 0);
  const totalPlannedCost = consumptionPlans.reduce((sum: number, p: any) => sum + (p.plannedQuantity * p.plannedUnitCost), 0);
  const totalActualCost = consumptionPlans.reduce((sum: number, p: any) => sum + (p.actualQuantity * p.actualUnitCost), 0);

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
${projects.map((p: any) => `- ${p.code}: ${p.name} | Status: ${p.status} | Budget: ₹${p.budget?.toLocaleString() || 'N/A'} | Location: ${p.location}`).join('\n') || 'No projects yet.'}

### Materials Catalog (${materials.length} active)
${materials.map((m: any) => `- ${m.code}: ${m.name} | Category: ${m.category} | Unit: ${m.unit} | Reorder Level: ${m.reorderLevel}`).join('\n') || 'No materials yet.'}

### Suppliers (${suppliers.length} active)
${suppliers.map((s: any) => `- ${s.code}: ${s.name} | Rating: ${s.rating}/5 | Contact: ${s.contactPerson}`).join('\n') || 'No suppliers yet.'}

### Inventory Summary (${inventory.length} items)
${inventory.slice(0, 10).map((i: any) => `- ${(i.materialId as any)?.name || 'Unknown'} @ ${(i.projectId as any)?.name || 'Unknown'}: ${i.currentStock} units`).join('\n') || 'No inventory yet.'}

### Purchase Orders (${purchaseOrders.length} total)
- Draft: ${purchaseOrders.filter((p: any) => p.status === 'draft').length}
- Approved: ${purchaseOrders.filter((p: any) => p.status === 'approved').length}
- Received: ${purchaseOrders.filter((p: any) => p.status === 'received').length}

### Financial Overview
- Total Waste Cost: ₹${totalWasteCost.toLocaleString()}
- Total Planned Cost: ₹${totalPlannedCost.toLocaleString()}
- Total Actual Cost: ₹${totalActualCost.toLocaleString()}
- Cost Variance: ₹${(totalActualCost - totalPlannedCost).toLocaleString()}

### Waste Records (${wasteRecords.length} incidents)
${wasteRecords.slice(0, 5).map((w: any) => `- ${(w.materialId as any)?.name || 'Unknown'} | Qty: ${w.quantity} | Reason: ${w.reason} | Cost: ₹${w.costImpact}`).join('\n') || 'No waste recorded.'}

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

export const processChat = async (
  messages: ChatMessage[],
  userId: string
): Promise<AiResponse> => {
  if (!env.GEMINI_API_KEY) {
    throw new AppError('AI assistant is not configured. Please add GEMINI_API_KEY to the backend .env file.', 503);
  }

  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
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
  if (!lastMessage) throw new AppError('No message provided', 400);
  const result = await chat.sendMessage(lastMessage.content);
  const responseText = result.response.text();

  // Parse any action blocks from the response
  const action = await parseAndExecuteAction(responseText, userId);

  // Strip the raw action block from the displayed message
  const cleanMessage = responseText.replace(/```action[\s\S]*?```/g, '').trim();

  return { message: cleanMessage, action };
};

// ─── Action executor ──────────────────────────────────────────────────────────

const parseAndExecuteAction = async (
  text: string,
  userId: string
): Promise<ActionResult> => {
  const actionMatch = text.match(/```action\s*([\s\S]*?)```/);
  if (!actionMatch || !actionMatch[1]) return { type: 'none' };

  let parsed: any;
  try {
    parsed = JSON.parse(actionMatch[1].trim());
  } catch {
    return { type: 'none' };
  }

  if (parsed.type === 'create_project') {
    const d = parsed.data;
    // Auto-generate code if not provided
    if (!d.code) {
      const count = await Project.countDocuments();
      d.code = `PROJ-${String(count + 1).padStart(3, '0')}`;
    }
    const project = await Project.create({
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
    const plan = await ConsumptionPlan.create({
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
