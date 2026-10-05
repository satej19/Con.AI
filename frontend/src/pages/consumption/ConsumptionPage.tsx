import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Modal } from '../../components/common/Modal';
import { useProject } from '../../context/ProjectContext';
import { api } from '../../services/api';
import type { ConsumptionPlan, Material } from '../../types';

const planSchema = z.object({ projectId: z.string().min(1, 'Project is required.'), materialId: z.string().min(1, 'Material is required.'), plannedQuantity: z.coerce.number().min(0, 'Quantity cannot be negative.'), plannedUnitCost: z.coerce.number().min(0, 'Unit cost cannot be negative.'), period: z.string().min(1, 'Period is required.'), notes: z.string().optional() });
const actualSchema = z.object({ actualQuantity: z.coerce.number().min(0), actualUnitCost: z.coerce.number().min(0), notes: z.string().optional() });
type PlanValues = z.infer<typeof planSchema>; type PlanInput = z.input<typeof planSchema>; type ActualValues = z.infer<typeof actualSchema>; type ActualInput = z.input<typeof actualSchema>;
async function getPlans() { const response = await api.get<ConsumptionPlan[]>('/consumption-plans', { limit: 100 }); const rows = Array.isArray(response.data) ? response.data : (response.data as unknown as { consumptionPlans?: ConsumptionPlan[] }).consumptionPlans || []; return rows.map((plan) => { const raw = plan as ConsumptionPlan & { materialId?: ConsumptionPlan['material']; projectId?: ConsumptionPlan['project'] }; return { ...raw, material: raw.material || raw.materialId || 'Unknown material', project: raw.project || raw.projectId || 'Unknown project' }; }); }
async function getMaterials() { const response = await api.get<Material[]>('/materials', { isActive: true, limit: 100 }); return Array.isArray(response.data) ? response.data : (response.data as unknown as { materials?: Material[] }).materials || []; }

export function ConsumptionPage() {
  const { projects } = useProject(); const client = useQueryClient(); const [open, setOpen] = useState<'plan' | 'actual' | null>(null); const [selected, setSelected] = useState<ConsumptionPlan | null>(null); const [error, setError] = useState<string | null>(null);
  const plans = useQuery({ queryKey: ['consumption-plans'], queryFn: getPlans }); const materials = useQuery({ queryKey: ['materials', 'consumption'], queryFn: getMaterials });
  const create = useMutation({ mutationFn: (values: PlanValues) => api.post('/consumption-plans', values), onSuccess: async () => { await client.invalidateQueries({ queryKey: ['consumption-plans'] }); setOpen(null); }, onError: (cause) => setError(cause instanceof Error ? cause.message : 'Unable to create plan.') });
  const update = useMutation({ mutationFn: (values: ActualValues) => api.patch(`/consumption-plans/${selected?._id}`, values), onSuccess: async () => { await client.invalidateQueries({ queryKey: ['consumption-plans'] }); setOpen(null); }, onError: (cause) => setError(cause instanceof Error ? cause.message : 'Unable to update actuals.') });
  const canPlan = projects.length > 0;
  return <div className="space-y-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex items-center gap-2 text-amber-500"><ClipboardList size={20} /><span className="eyebrow">COST CONTROL</span></div><h1 className="mt-2 text-2xl font-black font-heading text-white">Planned vs Actual</h1><p className="mt-1 text-xs text-slate-400">Compare planned quantities and costs with recorded consumption.</p></div>{canPlan && <button type="button" onClick={() => { setError(null); setOpen('plan'); }} className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400"><Plus size={16} /> New plan</button>}</div>{plans.isLoading && <State text="Loading consumption plans..." />}{plans.isError && <State text={plans.error instanceof Error ? plans.error.message : 'Unable to load consumption plans.'} error />}{plans.isSuccess && !plans.data.length && <State text="No consumption plans have been recorded." />}{plans.data && plans.data.length > 0 && <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60"><table className="w-full min-w-[820px] text-left text-xs"><thead className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400"><tr><th className="px-4 py-3">Period</th><th className="px-4 py-3">Project</th><th className="px-4 py-3">Material</th><th className="px-4 py-3">Planned qty</th><th className="px-4 py-3">Actual qty</th><th className="px-4 py-3">Planned cost</th><th className="px-4 py-3">Actual cost</th><th className="px-4 py-3">Variance</th><th className="px-4 py-3">Action</th></tr></thead><tbody className="divide-y divide-slate-800/70">{plans.data.map((plan) => { const plannedCost = plan.plannedQuantity * plan.plannedUnitCost; const actualCost = plan.actualQuantity * plan.actualUnitCost; const costVariance = actualCost - plannedCost; const hasActuals = plan.actualQuantity > 0; return <tr key={plan._id}><td className="px-4 py-4 text-amber-300">{plan.period}</td><td className="px-4 py-4 text-slate-300">{typeof plan.project === 'string' ? plan.project : plan.project.name}</td><td className="px-4 py-4 text-white">{typeof plan.material === 'string' ? plan.material : plan.material.name}</td><td className="px-4 py-4 text-slate-300">{plan.plannedQuantity}</td><td className="px-4 py-4 text-slate-300">{hasActuals ? plan.actualQuantity : <span className="text-slate-500 italic">pending</span>}</td><td className="px-4 py-4 text-slate-300">{plannedCost.toLocaleString()}</td><td className="px-4 py-4 text-slate-300">{hasActuals ? actualCost.toLocaleString() : <span className="text-slate-500 italic">pending</span>}</td><td className="px-4 py-4">{hasActuals ? <span className={costVariance > 0 ? 'font-semibold text-rose-300' : 'font-semibold text-emerald-300'}>{costVariance > 0 ? '+' : ''}{costVariance.toLocaleString()}</span> : <span className="text-slate-500">—</span>}</td><td className="px-4 py-4"><button type="button" onClick={() => { setSelected(plan); setError(null); setOpen('actual'); }} className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 hover:text-amber-200"><RefreshCw size={12} /> Sync actuals</button></td></tr>; })}</tbody></table></div>}{error && <p className="text-xs text-rose-300" role="alert">{error}</p>}<Modal isOpen={open === 'plan'} onClose={() => setOpen(null)} title="New consumption plan" maxWidth="lg"><PlanForm projects={projects} materials={materials.data || []} submitting={create.isPending} onSubmit={(values) => create.mutate(values)} /></Modal><Modal isOpen={open === 'actual'} onClose={() => setOpen(null)} title="Sync actuals" maxWidth="lg"><ActualForm plan={selected} submitting={update.isPending} onSubmit={(values) => update.mutate(values)} /></Modal></div>;
}

function PlanForm({ projects, materials, submitting, onSubmit }: { projects: Array<{ _id: string; code: string; name: string }>; materials: Material[]; submitting: boolean; onSubmit: (values: PlanValues) => void }) { const { register, handleSubmit, formState: { errors } } = useForm<PlanInput, unknown, PlanValues>({ resolver: zodResolver(planSchema), defaultValues: { projectId: '', materialId: '', plannedQuantity: 0, plannedUnitCost: 0, period: '', notes: '' } }); return <form onSubmit={handleSubmit(onSubmit)} className="space-y-4"><Field label="Project" error={errors.projectId?.message}><select {...register('projectId')} className="form-input"><option value="">Select project</option>{projects.map((item) => <option key={item._id} value={item._id}>{item.code} · {item.name}</option>)}</select></Field><Field label="Material" error={errors.materialId?.message}><select {...register('materialId')} className="form-input"><option value="">Select material</option>{materials.map((item) => <option key={item._id} value={item._id}>{item.code} · {item.name}</option>)}</select></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Period" error={errors.period?.message}><input {...register('period')} placeholder="2026-10 or 2026-Q4" className="form-input" /></Field><Field label="Planned quantity" error={errors.plannedQuantity?.message}><input {...register('plannedQuantity')} type="number" min="0" className="form-input" /></Field><Field label="Planned unit cost" error={errors.plannedUnitCost?.message}><input {...register('plannedUnitCost')} type="number" min="0" className="form-input" /></Field></div><Field label="Notes" error={errors.notes?.message}><textarea {...register('notes')} rows={2} className="form-input" /></Field><button type="submit" disabled={submitting} className="w-full rounded-xl bg-amber-500 px-4 py-3 text-xs font-bold text-slate-950 disabled:opacity-50">{submitting ? 'Saving...' : 'Create plan'}</button></form>; }

function ActualForm({ plan, submitting, onSubmit }: { plan: ConsumptionPlan | null; submitting: boolean; onSubmit: (values: ActualValues) => void }) {
  const client = useQueryClient();
  const [synced, setSynced] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const { register, handleSubmit, setValue, watch } = useForm<ActualInput, unknown, ActualValues>({
    resolver: zodResolver(actualSchema),
    defaultValues: { actualQuantity: plan?.actualQuantity ?? 0, actualUnitCost: plan?.actualUnitCost ?? 0, notes: plan?.notes ?? '' },
  });
  const syncMutation = useMutation({
    mutationFn: () => api.post(`/consumption-plans/${plan?._id}/sync`, {}),
    onSuccess: (res) => {
      const data = res.data as any;
      setValue('actualQuantity', data.actualQuantity ?? 0);
      setValue('actualUnitCost', data.actualUnitCost ?? 0);
      setSynced(true);
      setSyncError(null);
      client.invalidateQueries({ queryKey: ['consumption-plans'] });
    },
    onError: (cause) => setSyncError(cause instanceof Error ? cause.message : 'Sync failed.'),
  });
  const qty = watch('actualQuantity');
  const cost = watch('actualUnitCost');
  const actualTotal = (Number(qty) || 0) * (Number(cost) || 0);
  const plannedTotal = (plan?.plannedQuantity ?? 0) * (plan?.plannedUnitCost ?? 0);
  const variance = actualTotal - plannedTotal;
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-xs text-slate-400">
        <p className="mb-1 font-semibold text-slate-300">How it works</p>
        <p>Click <span className="text-amber-300 font-semibold">Sync from transactions</span> to auto-calculate actuals from inventory issue records and purchase order prices. You can then adjust the values before saving.</p>
      </div>
      <button
        type="button"
        onClick={() => syncMutation.mutate()}
        disabled={syncMutation.isPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 disabled:opacity-50"
      >
        <RefreshCw size={14} className={syncMutation.isPending ? 'animate-spin' : ''} />
        {syncMutation.isPending ? 'Syncing from transactions…' : 'Sync from transactions'}
      </button>
      {syncError && <p className="text-xs text-rose-300" role="alert">{syncError}</p>}
      {synced && (
        <div className="rounded-xl border border-emerald-800/50 bg-emerald-950/20 px-4 py-2.5 text-xs text-emerald-300">
          ✓ Auto-filled from inventory issues and PO prices. Review and adjust below if needed.
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Actual quantity (issued)"><input {...register('actualQuantity')} type="number" min="0" step="0.001" className="form-input" /></Field>
        <Field label="Actual unit cost (avg from POs)"><input {...register('actualUnitCost')} type="number" min="0" step="0.01" className="form-input" /></Field>
      </div>
      {(Number(qty) > 0 || Number(cost) > 0) && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs">
          <div className="flex justify-between py-1"><span className="text-slate-400">Planned cost</span><span className="text-slate-300">{plannedTotal.toLocaleString()}</span></div>
          <div className="flex justify-between py-1"><span className="text-slate-400">Actual cost</span><span className="text-slate-300">{actualTotal.toLocaleString()}</span></div>
          <div className="flex justify-between border-t border-slate-800 pt-2 mt-1"><span className="font-semibold text-slate-300">Variance</span><span className={`font-bold ${variance > 0 ? 'text-rose-300' : 'text-emerald-300'}`}>{variance > 0 ? '+' : ''}{variance.toLocaleString()}</span></div>
        </div>
      )}
      <Field label="Notes"><textarea {...register('notes')} rows={2} className="form-input" /></Field>
      <button type="submit" disabled={submitting} className="w-full rounded-xl bg-amber-500 px-4 py-3 text-xs font-bold text-slate-950 disabled:opacity-50">{submitting ? 'Saving…' : 'Save actuals'}</button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <label className="block text-xs font-semibold text-slate-300">{label}<div className="mt-1">{children}</div>{error && <span className="mt-1 block text-[11px] font-normal text-rose-300">{error}</span>}</label>; }
function State({ text, error = false }: { text: string; error?: boolean }) { return <div className={`rounded-xl border p-8 text-center text-sm ${error ? 'border-rose-900/60 bg-rose-950/30 text-rose-300' : 'border-dashed border-slate-700 bg-slate-900/40 text-slate-400'}`}>{text}</div>; }
