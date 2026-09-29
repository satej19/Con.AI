import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Boxes, Edit3, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/common/Modal';
import { api } from '../../services/api';
import type { Material, MaterialCategory, MaterialUnit } from '../../types';

const categories: MaterialCategory[] = ['cement', 'steel', 'aggregate', 'chemical', 'pipe', 'valve', 'electrical', 'other'];
const units: MaterialUnit[] = ['kg', 'ton', 'litre', 'metre', 'piece', 'bag', 'cubic_metre', 'sq_metre'];

const materialSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.'),
  code: z.string().trim().min(1, 'Code is required.').transform((value) => value.toUpperCase()),
  category: z.enum(categories),
  unit: z.enum(units),
  hsnCode: z.string().trim().optional(),
  reorderLevel: z.coerce.number().min(0, 'Reorder level cannot be negative.'),
  description: z.string().trim().optional(),
});

type MaterialFormValues = z.infer<typeof materialSchema>;
type MaterialFormInput = z.input<typeof materialSchema>;

async function fetchMaterials(search: string, category: string) {
  const response = await api.get<Material[]>('/materials', { search, category: category || undefined, limit: 100 });
  const payload = response.data;
  return Array.isArray(payload) ? payload : (payload as unknown as { materials?: Material[] }).materials || [];
}

export function MaterialsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const canManage = user && ['admin', 'manager', 'store_keeper'].includes(user.role);

  const materialsQuery = useQuery({
    queryKey: ['materials', search, category],
    queryFn: () => fetchMaterials(search, category),
  });

  const mutation = useMutation({
    mutationFn: async (values: MaterialFormValues) => {
      if (editingMaterial) {
        const { code, ...update } = values;
        void code;
        return api.patch(`/materials/${editingMaterial._id}`, update);
      }
      return api.post('/materials', values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['materials'] });
      setIsModalOpen(false);
      setEditingMaterial(null);
    },
    onError: (error) => setActionError(error instanceof Error ? error.message : 'Unable to save material.'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ material, isActive }: { material: Material; isActive: boolean }) =>
      api.patch(`/materials/${material._id}`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['materials'] }),
    onError: (error) => setActionError(error instanceof Error ? error.message : 'Unable to update material status.'),
  });

  const openCreate = () => {
    setActionError(null);
    setEditingMaterial(null);
    setIsModalOpen(true);
  };

  const openEdit = (material: Material) => {
    setActionError(null);
    setEditingMaterial(material);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-amber-500"><Boxes size={20} /><span className="eyebrow">MASTER DATA</span></div>
          <h1 className="mt-2 text-2xl font-black font-heading text-white">Material Catalog</h1>
          <p className="mt-1 text-xs text-slate-400">Search active and inactive construction materials by code, name, or category.</p>
        </div>
        {canManage && <button type="button" onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400"><Plus size={16} /> Add material</button>}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search material name or code" className="w-full rounded-xl border border-slate-800 bg-slate-900 px-9 py-2.5 text-sm text-white outline-none focus:border-amber-500" /></label>
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-amber-500"><option value="">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select>
      </div>

      {materialsQuery.isLoading && <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center text-sm text-slate-400">Loading materials...</div>}
      {materialsQuery.isError && <div className="rounded-xl border border-rose-900/60 bg-rose-950/30 p-5 text-sm text-rose-300" role="alert">{materialsQuery.error instanceof Error ? materialsQuery.error.message : 'Unable to load materials.'}</div>}
      {materialsQuery.isSuccess && materialsQuery.data.length === 0 && <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-10 text-center text-sm text-slate-400">No materials match the current filters.</div>}

      {materialsQuery.data && materialsQuery.data.length > 0 && <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60"><table className="w-full min-w-[760px] text-left text-xs"><thead className="border-b border-slate-800 bg-slate-950/50 text-[10px] uppercase tracking-wider text-slate-400"><tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Material</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Unit</th><th className="px-4 py-3">Reorder level</th><th className="px-4 py-3">Status</th>{canManage && <th className="px-4 py-3 text-right">Actions</th>}</tr></thead><tbody className="divide-y divide-slate-800/70">{materialsQuery.data.map((material) => <tr key={material._id} className="hover:bg-slate-800/30"><td className="px-4 py-4 font-mono font-bold text-amber-400">{material.code}</td><td className="px-4 py-4"><p className="font-semibold text-white">{material.name}</p><p className="mt-1 text-slate-500">{material.description || 'No description'}</p></td><td className="px-4 py-4 capitalize text-slate-300">{material.category}</td><td className="px-4 py-4 text-slate-300">{material.unit}</td><td className="px-4 py-4 text-slate-300">{material.reorderLevel}</td><td className="px-4 py-4"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${material.isActive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-700 text-slate-400'}`}>{material.isActive ? 'Active' : 'Inactive'}</span></td>{canManage && <td className="px-4 py-4 text-right"><div className="flex justify-end gap-2"><button type="button" title="Edit material" onClick={() => openEdit(material)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-amber-400"><Edit3 size={15} /></button><button type="button" onClick={() => statusMutation.mutate({ material, isActive: !material.isActive })} className="text-[11px] font-semibold text-slate-400 hover:text-white">{material.isActive ? 'Deactivate' : 'Reactivate'}</button></div></td>}</tr>)}</tbody></table></div>}

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingMaterial(null); }} title={editingMaterial ? 'Edit material' : 'Add material'} maxWidth="lg"><MaterialForm material={editingMaterial} submitting={mutation.isPending} error={actionError} onSubmit={(values) => mutation.mutate(values)} /></Modal>
    </div>
  );
}

function MaterialForm({ material, submitting, error, onSubmit }: { material: Material | null; submitting: boolean; error: string | null; onSubmit: (values: MaterialFormValues) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<MaterialFormInput, unknown, MaterialFormValues>({ resolver: zodResolver(materialSchema), defaultValues: material ? { name: material.name, code: material.code, category: material.category, unit: material.unit, hsnCode: material.hsnCode || '', reorderLevel: material.reorderLevel, description: material.description || '' } : { name: '', code: '', category: 'other', unit: 'piece', hsnCode: '', reorderLevel: 0, description: '' } });
  return <form onSubmit={handleSubmit(onSubmit)} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><Field label="Material name" error={errors.name?.message}><input {...register('name')} className="form-input" /></Field><Field label="Code" error={errors.code?.message}><input {...register('code')} disabled={Boolean(material)} className="form-input uppercase disabled:opacity-50" /></Field><Field label="Category" error={errors.category?.message}><select {...register('category')} className="form-input">{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></Field><Field label="Unit" error={errors.unit?.message}><select {...register('unit')} className="form-input">{units.map((item) => <option key={item} value={item}>{item}</option>)}</select></Field><Field label="HSN code" error={errors.hsnCode?.message}><input {...register('hsnCode')} className="form-input" /></Field><Field label="Reorder level" error={errors.reorderLevel?.message}><input {...register('reorderLevel')} type="number" min="0" className="form-input" /></Field></div><Field label="Description" error={errors.description?.message}><textarea {...register('description')} rows={3} className="form-input" /></Field>{error && <p className="text-xs text-rose-300" role="alert">{error}</p>}<button type="submit" disabled={submitting} className="w-full rounded-xl bg-amber-500 px-4 py-3 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50">{submitting ? 'Saving...' : material ? 'Save changes' : 'Create material'}</button></form>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-slate-300">{label}<div className="mt-1">{children}</div>{error && <span className="mt-1 block text-[11px] font-normal text-rose-300">{error}</span>}</label>;
}
