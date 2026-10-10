import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit3, Plus, Search, Star, Truck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Material, Supplier } from '../../types';

const supplierSchema = z.object({
  name: z.string().trim().min(2, 'Company name is required.'),
  code: z.string().trim().min(1, 'Supplier code is required.').transform((value) => value.toUpperCase()),
  contactPerson: z.string().trim().optional(),
  email: z.string().trim().email('Enter a valid email.').optional().or(z.literal('')),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  gstNumber: z.string().trim().optional(),
  rating: z.coerce.number().min(1).max(5),
  materialsSupplied: z.array(z.string()),
});
type SupplierFormValues = z.infer<typeof supplierSchema>;
type SupplierFormInput = z.input<typeof supplierSchema>;

async function getSuppliers(search: string) {
  const response = await api.get('/suppliers', { search, limit: 100 });
  const payload = response.data as { suppliers?: Supplier[] } | Supplier[];
  return Array.isArray(payload) ? payload : (payload as any).suppliers || [];
}

async function getMaterials() {
  const response = await api.get('/materials', { limit: 100, isActive: true });
  const payload = response.data as { materials?: Material[] } | Material[];
  return Array.isArray(payload) ? payload : (payload as any).materials || [];
}

export function SuppliersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canManage = user && ['admin', 'manager'].includes(user.role);
  const suppliers = useQuery({ queryKey: ['suppliers', search], queryFn: () => getSuppliers(search) });
  const materials = useQuery({ queryKey: ['materials', 'active'], queryFn: getMaterials });
  const save = useMutation({
    mutationFn: (values: SupplierFormValues) => editing ? api.patch(`/suppliers/${editing._id}`, values) : api.post('/suppliers', values),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['suppliers'] }); setOpen(false); setEditing(null); },
    onError: (cause) => setError(cause instanceof Error ? cause.message : 'Unable to save supplier.'),
  });
  const status = useMutation({
    mutationFn: ({ supplier, isActive }: { supplier: Supplier; isActive: boolean }) => api.patch(`/suppliers/${supplier._id}`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
    onError: (cause) => setError(cause instanceof Error ? cause.message : 'Unable to update supplier status.'),
  });

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex items-center gap-2 text-amber-500"><Truck size={20} /><span className="eyebrow">PROCUREMENT NETWORK</span></div><h1 className="mt-2 text-2xl font-black font-heading text-white">Supplier Directory</h1><p className="mt-1 text-xs text-slate-400">Maintain supplier contacts, ratings, and supplied material relationships.</p></div>{canManage && <button type="button" onClick={() => { setEditing(null); setError(null); setOpen(true); }} className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400"><Plus size={16} /> Add supplier</button>}</div>
    <label className="relative block max-w-md"><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search supplier name" className="w-full rounded-xl border border-slate-800 bg-slate-900 px-9 py-2.5 text-sm text-white outline-none focus:border-amber-500" /></label>
    {suppliers.isLoading && <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center text-sm text-slate-400">Loading suppliers...</div>}
    {suppliers.isError && <div className="rounded-xl border border-rose-900/60 bg-rose-950/30 p-5 text-sm text-rose-300" role="alert">{suppliers.error instanceof Error ? suppliers.error.message : 'Unable to load suppliers.'}</div>}
    {suppliers.isSuccess && suppliers.data.length === 0 && <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-10 text-center text-sm text-slate-400">No suppliers match the current search.</div>}
    {suppliers.data && suppliers.data.length > 0 && <div className="grid gap-4 lg:grid-cols-2">{suppliers.data.map((supplier) => <article key={supplier._id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"><div className="flex items-start justify-between gap-3"><div><span className="font-mono text-xs font-bold text-amber-400">{supplier.code}</span><h2 className="mt-2 text-base font-bold text-white">{supplier.name}</h2><p className="mt-1 text-xs text-slate-400">{supplier.contactPerson || 'No contact person'}{supplier.email ? ` · ${supplier.email}` : ''}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${supplier.isActive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-700 text-slate-400'}`}>{supplier.isActive ? 'Active' : 'Inactive'}</span></div><div className="mt-4 flex items-center gap-1 text-amber-400">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={14} fill={index < supplier.rating ? 'currentColor' : 'none'} />)}<span className="ml-1 text-xs text-slate-400">{supplier.rating}/5</span></div><div className="mt-4 border-t border-slate-800 pt-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Materials supplied</p><div className="mt-2 flex flex-wrap gap-1.5">{supplier.materialsSupplied.length ? supplier.materialsSupplied.map((material) => <span key={typeof material === 'string' ? material : material._id} className="rounded-md bg-slate-800 px-2 py-1 text-[10px] text-slate-300">{typeof material === 'string' ? material : material.name}</span>) : <span className="text-xs text-slate-500">None listed</span>}</div></div>{canManage && <div className="mt-4 flex justify-end gap-3"><button type="button" onClick={() => { setEditing(supplier); setError(null); setOpen(true); }} className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-amber-400"><Edit3 size={14} /> Edit</button><button type="button" onClick={() => status.mutate({ supplier, isActive: !supplier.isActive })} className="text-xs font-semibold text-slate-400 hover:text-white">{supplier.isActive ? 'Deactivate' : 'Reactivate'}</button></div>}</article>)}</div>}
    <Modal isOpen={open} onClose={() => { setOpen(false); setEditing(null); }} title={editing ? 'Edit supplier' : 'Add supplier'} maxWidth="lg"><SupplierForm supplier={editing} materials={materials.data || []} submitting={save.isPending} error={error} onSubmit={(values) => save.mutate(values)} /></Modal>
  </div>;
}

function SupplierForm({ supplier, materials, submitting, error, onSubmit }: { supplier: Supplier | null; materials: Material[]; submitting: boolean; error: string | null; onSubmit: (values: SupplierFormValues) => void }) {
  const initialMaterials = supplier?.materialsSupplied.map((item) => typeof item === 'string' ? item : item._id) || [];
  const { register, handleSubmit, formState: { errors } } = useForm<SupplierFormInput, unknown, SupplierFormValues>({ resolver: zodResolver(supplierSchema), defaultValues: supplier ? { name: supplier.name, code: supplier.code, contactPerson: supplier.contactPerson || '', email: supplier.email || '', phone: supplier.phone || '', address: supplier.address || '', gstNumber: supplier.gstNumber || '', rating: supplier.rating, materialsSupplied: initialMaterials } : { name: '', code: '', contactPerson: '', email: '', phone: '', address: '', gstNumber: '', rating: 3, materialsSupplied: [] } });
  return <form onSubmit={handleSubmit(onSubmit)} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><Field label="Company name" error={errors.name?.message}><input {...register('name')} className="form-input" /></Field><Field label="Supplier code" error={errors.code?.message}><input {...register('code')} disabled={Boolean(supplier)} className="form-input uppercase disabled:opacity-50" /></Field><Field label="Contact person" error={errors.contactPerson?.message}><input {...register('contactPerson')} className="form-input" /></Field><Field label="Email" error={errors.email?.message}><input {...register('email')} type="email" className="form-input" /></Field><Field label="Phone" error={errors.phone?.message}><input {...register('phone')} className="form-input" /></Field><Field label="GST number" error={errors.gstNumber?.message}><input {...register('gstNumber')} className="form-input" /></Field><Field label="Rating" error={errors.rating?.message}><input {...register('rating')} type="number" min="1" max="5" className="form-input" /></Field></div><Field label="Address" error={errors.address?.message}><textarea {...register('address')} rows={2} className="form-input" /></Field><Field label="Materials supplied" error={errors.materialsSupplied?.message}><select {...register('materialsSupplied')} multiple className="form-input min-h-28">{materials.map((material) => <option key={material._id} value={material._id}>{material.code} · {material.name}</option>)}</select></Field>{error && <p className="text-xs text-rose-300" role="alert">{error}</p>}<button type="submit" disabled={submitting} className="w-full rounded-xl bg-amber-500 px-4 py-3 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50">{submitting ? 'Saving...' : supplier ? 'Save changes' : 'Create supplier'}</button></form>;
}
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <label className="block text-xs font-semibold text-slate-300">{label}<div className="mt-1">{children}</div>{error && <span className="mt-1 block text-[11px] font-normal text-rose-300">{error}</span>}</label>; }
