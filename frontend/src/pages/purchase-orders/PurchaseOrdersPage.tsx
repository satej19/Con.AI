import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Material, Project, PurchaseOrder, PurchaseOrderStatus, Supplier } from '../../types';

const orderSchema = z.object({
  projectId: z.string().min(1, 'Project is required.'),
  supplierId: z.string().min(1, 'Supplier is required.'),
  expectedDelivery: z.string().min(1, 'Expected delivery is required.'),
  notes: z.string().optional(),
  items: z.array(z.object({ materialId: z.string().min(1, 'Material is required.'), quantity: z.coerce.number().positive('Quantity must be positive.'), unitPrice: z.coerce.number().min(0, 'Price cannot be negative.') })).min(1),
});
type OrderValues = z.infer<typeof orderSchema>;
type OrderInput = z.input<typeof orderSchema>;
const statuses: Array<PurchaseOrderStatus | ''> = ['', 'draft', 'approved', 'partially_received', 'received', 'cancelled'];

async function list<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>) {
  const response = await api.get<T[]>(endpoint, params);
  if (Array.isArray(response.data)) return response.data;
  const key = endpoint === '/projects' ? 'projects' : endpoint === '/suppliers' ? 'suppliers' : endpoint === '/materials' ? 'materials' : 'purchaseOrders';
  const items = (response.data as unknown as Record<string, T[]>)[key] || [];
  return key === 'purchaseOrders' ? items.map((order) => { const raw = order as PurchaseOrder & { projectId?: PurchaseOrder['project']; supplierId?: PurchaseOrder['supplier'] }; return { ...raw, project: raw.project || raw.projectId, supplier: raw.supplier || raw.supplierId, items: raw.items.map((item) => ({ ...item, material: item.material || (item as typeof item & { materialId?: typeof item.material }).materialId })) } as T; }) : items;
}

export function PurchaseOrdersPage() {
  const { user } = useAuth();
  const client = useQueryClient();
  const [status, setStatus] = useState<PurchaseOrderStatus | ''>('');
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const orders = useQuery({ queryKey: ['purchase-orders', status], queryFn: () => list<PurchaseOrder>('/purchase-orders', { status: status || undefined, limit: 100 }) });
  const projects = useQuery({ queryKey: ['projects', 'purchase-order'], queryFn: () => list<Project>('/projects', { limit: 100 }) });
  const suppliers = useQuery({ queryKey: ['suppliers', 'purchase-order'], queryFn: () => list<Supplier>('/suppliers', { isActive: true, limit: 100 }) });
  const materials = useQuery({ queryKey: ['materials', 'purchase-order'], queryFn: () => list<Material>('/materials', { isActive: true, limit: 100 }) });
  const create = useMutation({ mutationFn: (values: OrderValues) => api.post('/purchase-orders', values), onSuccess: async () => { await client.invalidateQueries({ queryKey: ['purchase-orders'] }); setOpen(false); }, onError: (cause) => setError(cause instanceof Error ? cause.message : 'Unable to create purchase order.') });
  const action = useMutation({ mutationFn: ({ id, endpoint }: { id: string; endpoint: string }) => api.patch(`/purchase-orders/${id}/${endpoint}`), onSuccess: () => client.invalidateQueries({ queryKey: ['purchase-orders'] }), onError: (cause) => setError(cause instanceof Error ? cause.message : 'Unable to update purchase order.') });
  const canCreate = user && ['admin', 'manager', 'engineer'].includes(user.role);
  const canApprove = user && ['admin', 'manager'].includes(user.role);
  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex items-center gap-2 text-amber-500"><ShoppingCart size={20} /><span className="eyebrow">PROCUREMENT CONTROL</span></div><h1 className="mt-2 text-2xl font-black font-heading text-white">Purchase Orders</h1><p className="mt-1 text-xs text-slate-400">Track drafts, approvals, deliveries, and goods receipt workflows.</p></div>{canCreate && <button type="button" onClick={() => { setError(null); setOpen(true); }} className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400"><Plus size={16} /> Create purchase order</button>}</div>
    <div className="flex flex-wrap gap-2">{statuses.map((item) => <button key={item || 'all'} type="button" onClick={() => setStatus(item)} className={`rounded-xl border px-3 py-2 text-xs font-semibold capitalize ${status === item ? 'border-amber-500/50 bg-amber-500/15 text-amber-300' : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'}`}>{item ? item.replaceAll('_', ' ') : 'All orders'}</button>)}</div>
    {orders.isLoading && <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center text-sm text-slate-400">Loading purchase orders...</div>}
    {orders.isError && <div className="rounded-xl border border-rose-900/60 bg-rose-950/30 p-5 text-sm text-rose-300" role="alert">{orders.error instanceof Error ? orders.error.message : 'Unable to load purchase orders.'}</div>}
    {orders.isSuccess && orders.data.length === 0 && <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-10 text-center text-sm text-slate-400">No purchase orders match this status.</div>}
    {orders.data && orders.data.length > 0 && <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60"><table className="w-full min-w-[760px] text-left text-xs"><thead className="border-b border-slate-800 bg-slate-950/50 text-[10px] uppercase tracking-wider text-slate-400"><tr><th className="px-4 py-3">PO number</th><th className="px-4 py-3">Project</th><th className="px-4 py-3">Supplier</th><th className="px-4 py-3">Items</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th>{canApprove && <th className="px-4 py-3">Actions</th>}</tr></thead><tbody className="divide-y divide-slate-800/70">{orders.data.map((order) => <tr key={order._id} className="hover:bg-slate-800/30"><td className="px-4 py-4 font-mono font-bold text-amber-400">{order.poNumber}</td><td className="px-4 py-4 text-slate-300">{typeof order.project === 'string' ? order.project : order.project?.name}</td><td className="px-4 py-4 text-slate-300">{typeof order.supplier === 'string' ? order.supplier : order.supplier?.name}</td><td className="px-4 py-4 text-slate-300">{order.items.length}</td><td className="px-4 py-4 font-semibold text-emerald-300">{order.totalAmount.toLocaleString()}</td><td className="px-4 py-4"><StatusBadge status={order.status} size="sm" /></td>{canApprove && <td className="px-4 py-4"><div className="flex gap-2">{order.status === 'draft' && <><button type="button" onClick={() => action.mutate({ id: order._id, endpoint: 'approve' })} className="text-[11px] font-semibold text-emerald-300 hover:text-emerald-200">Approve</button><button type="button" onClick={() => action.mutate({ id: order._id, endpoint: 'cancel' })} className="text-[11px] font-semibold text-rose-300 hover:text-rose-200">Cancel</button></>}</div></td>}</tr>)}</tbody></table></div>}
    {error && <p className="text-xs text-rose-300" role="alert">{error}</p>}
    <Modal isOpen={open} onClose={() => setOpen(false)} title="Create purchase order" maxWidth="2xl"><OrderForm projects={projects.data || []} suppliers={suppliers.data || []} materials={materials.data || []} submitting={create.isPending} error={error} onSubmit={(values) => create.mutate(values)} /></Modal>
  </div>;
}

function OrderForm({ projects, suppliers, materials, submitting, error, onSubmit }: { projects: Project[]; suppliers: Supplier[]; materials: Material[]; submitting: boolean; error: string | null; onSubmit: (values: OrderValues) => void }) {
  const { register, control, handleSubmit, formState: { errors } } = useForm<OrderInput, unknown, OrderValues>({ resolver: zodResolver(orderSchema), defaultValues: { projectId: '', supplierId: '', expectedDelivery: '', notes: '', items: [{ materialId: '', quantity: 1, unitPrice: 0 }] } });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  return <form onSubmit={handleSubmit(onSubmit)} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><Field label="Project" error={errors.projectId?.message}><select {...register('projectId')} className="form-input"><option value="">Select project</option>{projects.map((item) => <option key={item._id} value={item._id}>{item.code} · {item.name}</option>)}</select></Field><Field label="Supplier" error={errors.supplierId?.message}><select {...register('supplierId')} className="form-input"><option value="">Select supplier</option>{suppliers.map((item) => <option key={item._id} value={item._id}>{item.code} · {item.name}</option>)}</select></Field><Field label="Expected delivery" error={errors.expectedDelivery?.message}><input {...register('expectedDelivery')} type="date" className="form-input" /></Field></div><div><div className="mb-2 flex items-center justify-between"><p className="text-xs font-bold text-slate-300">Line items</p><button type="button" onClick={() => append({ materialId: '', quantity: 1, unitPrice: 0 })} className="text-xs font-semibold text-amber-300">Add item</button></div>{fields.map((field, index) => <div key={field.id} className="mb-2 grid gap-2 sm:grid-cols-[1fr_110px_130px_auto]"><select {...register(`items.${index}.materialId`)} className="form-input"><option value="">Select material</option>{materials.map((item) => <option key={item._id} value={item._id}>{item.code} · {item.name} ({item.unit})</option>)}</select><input {...register(`items.${index}.quantity`)} type="number" min="0.001" step="0.001" placeholder="Quantity" className="form-input" /><input {...register(`items.${index}.unitPrice`)} type="number" min="0" step="0.01" placeholder="Unit price" className="form-input" /><button type="button" title="Remove item" disabled={fields.length === 1} onClick={() => remove(index)} className="rounded-lg p-2 text-slate-500 hover:text-rose-300 disabled:opacity-30"><Trash2 size={16} /></button></div>)}</div><Field label="Notes" error={errors.notes?.message}><textarea {...register('notes')} rows={2} className="form-input" /></Field>{error && <p className="text-xs text-rose-300" role="alert">{error}</p>}<button type="submit" disabled={submitting} className="w-full rounded-xl bg-amber-500 px-4 py-3 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50">{submitting ? 'Creating...' : 'Create draft purchase order'}</button></form>;
}
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <label className="block text-xs font-semibold text-slate-300">{label}<div className="mt-1">{children}</div>{error && <span className="mt-1 block text-[11px] font-normal text-rose-300">{error}</span>}</label>; }
