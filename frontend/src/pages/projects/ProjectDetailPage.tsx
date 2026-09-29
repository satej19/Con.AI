import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Warehouse,
  ShoppingCart,
  Trash2,
  TrendingDown,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { api } from '../../services/api';
import type { Project, ProjectStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'pos' | 'waste' | 'plans'>('overview');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data for sub-tabs
  const [projectInventory, setProjectInventory] = useState<any[]>([]);
  const [projectPOs, setProjectPOs] = useState<any[]>([]);
  const [projectWaste, setProjectWaste] = useState<any[]>([]);
  const [projectPlans, setProjectPlans] = useState<any[]>([]);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/projects/${id}`);
        if (res.data) setProject(res.data);

        // Fetch related data
        const [invRes, poRes, wasteRes, planRes] = await Promise.allSettled([
          api.get('/inventory', { projectId: id }),
          api.get('/purchase-orders', { projectId: id }),
          api.get('/waste', { projectId: id }),
          api.get('/consumption-plans', { projectId: id }),
        ]);

        if (invRes.status === 'fulfilled' && invRes.value.data) {
          const items = Array.isArray(invRes.value.data) ? invRes.value.data : invRes.value.data.inventory || [];
          setProjectInventory(items.map((item: any) => ({ ...item, material: item.material || item.materialId, project: item.project || item.projectId })));
        }
        if (poRes.status === 'fulfilled' && poRes.value.data) {
          const orders = Array.isArray(poRes.value.data) ? poRes.value.data : poRes.value.data.purchaseOrders || [];
          setProjectPOs(orders.map((order: any) => ({ ...order, project: order.project || order.projectId, supplier: order.supplier || order.supplierId, items: order.items.map((item: any) => ({ ...item, material: item.material || item.materialId })) })));
        }
        if (wasteRes.status === 'fulfilled' && wasteRes.value.data) {
          const records = Array.isArray(wasteRes.value.data) ? wasteRes.value.data : wasteRes.value.data.wasteRecords || [];
          setProjectWaste(records.map((record: any) => ({ ...record, material: record.material || record.materialId, project: record.project || record.projectId, incidentDate: record.incidentDate || record.date })));
        }
        if (planRes.status === 'fulfilled' && planRes.value.data) {
          const plans = Array.isArray(planRes.value.data) ? planRes.value.data : planRes.value.data.consumptionPlans || [];
          setProjectPlans(plans.map((plan: any) => ({ ...plan, material: plan.material || plan.materialId, project: plan.project || plan.projectId })));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load project details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProjectDetails();
  }, [id]);

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (!project) return;
    setStatusUpdating(true);
    try {
      await api.patch(`/projects/${project._id}`, { status: newStatus });
      setProject({ ...project, status: newStatus });
    } catch (err: any) {
      alert(err.message || 'Cannot transition to this status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const allowedStatuses: Record<ProjectStatus, ProjectStatus[]> = {
    planning: ['planning', 'active'],
    active: ['active', 'on_hold', 'completed'],
    on_hold: ['on_hold', 'active'],
    completed: ['completed'],
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !project) {
    return <div className="rounded-xl border border-rose-900/60 bg-rose-950/30 p-5 text-sm text-rose-300">{error || 'Project not found.'}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Back button & Header */}
      <div>
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to All Projects
        </button>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded bg-amber-500/20 px-2 py-0.5 font-mono text-xs font-bold text-amber-400 border border-amber-500/30">
                {project.code}
              </span>
              <StatusBadge status={project.status} size="md" />
            </div>
            <h1 className="text-2xl font-black font-heading text-white mt-1.5">
              {project.name}
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
              <MapPin className="h-3.5 w-3.5 text-slate-500" />
              {project.location}
            </p>
          </div>

          {/* Status State Machine Transitions */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-slate-400">Status Action:</span>
            <div className="relative">
              <select
                disabled={statusUpdating}
                value={project.status}
                onChange={(e) => handleStatusChange(e.target.value as ProjectStatus)}
                className="appearance-none rounded-xl border border-slate-700 bg-slate-900 py-2 pl-3 pr-8 text-xs font-bold text-slate-200 outline-none hover:border-amber-500 transition-colors"
              >
                {allowedStatuses[project.status].map((status) => (
                  <option key={status} value={status}>{status.replace('_', ' ').toUpperCase()}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto">
        {[
          { key: 'overview', label: 'Overview & Metrics', icon: Layers },
          { key: 'inventory', label: 'Site Inventory', icon: Warehouse },
          { key: 'pos', label: 'Purchase Orders', icon: ShoppingCart },
          { key: 'waste', label: 'Site Waste Log', icon: Trash2 },
          { key: 'plans', label: 'Plan vs Actual', icon: TrendingDown },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                Project Scope & Details
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {project.description || 'No detailed scope description provided.'}
              </p>

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-slate-800 pt-5">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">Allocated Budget</p>
                  <p className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                    {formatCurrency(project.budget)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">Start Date</p>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5">{project.startDate}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">Target Completion</p>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5">
                    {project.expectedEndDate || 'Open-ended'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Quick Telemetry
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Site Inventory Items:</span>
                  <span className="font-bold text-white">{projectInventory.length}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Total Purchase Orders:</span>
                  <span className="font-bold text-white">{projectPOs.length}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Waste Incidents:</span>
                  <span className="font-bold text-rose-400">{projectWaste.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Site Inventory */}
      {activeTab === 'inventory' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
          <h3 className="text-sm font-bold text-white mb-4">Stock on Site ({project.code})</h3>
          {projectInventory.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No inventory tracked yet for this site.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Material</th>
                    <th className="py-2.5 px-4">Code</th>
                    <th className="py-2.5 px-4">Current Stock</th>
                    <th className="py-2.5 px-4">Reorder Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {projectInventory.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-bold text-white">{item.material?.name}</td>
                      <td className="py-3 px-4 font-mono">{item.material?.code}</td>
                      <td className="py-3 px-4 font-bold text-amber-400">
                        {item.currentStock} {item.material?.unit}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {item.material?.reorderLevel} {item.material?.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Purchase Orders */}
      {activeTab === 'pos' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
          <h3 className="text-sm font-bold text-white mb-4">Purchase Orders ({project.code})</h3>
          {projectPOs.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No POs created for this site yet.</p>
          ) : (
            <div className="space-y-2">
              {projectPOs.map((po) => (
                <div key={po._id} className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/40">
                  <div>
                    <span className="font-mono text-xs font-bold text-amber-400">{po.poNumber}</span>
                    <p className="text-xs text-slate-400 mt-0.5">{po.supplier?.name || 'Supplier'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-emerald-400">{formatCurrency(po.totalAmount)}</span>
                    <StatusBadge status={po.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Waste Log */}
      {activeTab === 'waste' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
          <h3 className="text-sm font-bold text-white mb-4">Site Waste Log ({project.code})</h3>
          {projectWaste.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No waste incidents recorded for this project.</p>
          ) : (
            <div className="space-y-2">
              {projectWaste.map((w) => (
                <div key={w._id} className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/40">
                  <div>
                    <span className="text-xs font-bold text-white">{w.material?.name || 'Material'}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">Cause: {w.reason} • Qty: {w.quantity} {w.material?.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono font-bold text-rose-400">-{formatCurrency(w.costImpact)}</p>
                    <span className="text-[10px] text-slate-500">{w.incidentDate}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Consumption Plans */}
      {activeTab === 'plans' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
          <h3 className="text-sm font-bold text-white mb-4">Planned vs Actual Consumption</h3>
          {projectPlans.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No periodic consumption plans created yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Period</th>
                    <th className="py-2.5 px-4">Material</th>
                    <th className="py-2.5 px-4">Planned Qty</th>
                    <th className="py-2.5 px-4">Actual Qty</th>
                    <th className="py-2.5 px-4">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {projectPlans.map((pl) => (
                    <tr key={pl._id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-mono">{pl.period}</td>
                      <td className="py-3 px-4 font-bold text-white">{pl.material?.name}</td>
                      <td className="py-3 px-4">{pl.plannedQuantity}</td>
                      <td className="py-3 px-4">{pl.actualQuantity}</td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">
                        {pl.costVariance ? formatCurrency(pl.costVariance) : '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
