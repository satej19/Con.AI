import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Warehouse,
  AlertTriangle,
  ShoppingCart,
  Trash2,
  TrendingDown,
  ArrowUpRight,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { api } from '../../services/api';
import type { DashboardSummary, InventoryItem, PurchaseOrder, WasteRecord } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';

interface DashboardReference {
  _id: string;
  name?: string;
  code?: string;
  unit?: string;
  category?: InventoryItem['material']['category'];
  reorderLevel?: number;
}

interface BackendDashboardSummary {
  overview: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalMaterials: number;
    totalSuppliers: number;
    totalPOs: number;
    approvedPOs: number;
    receivedPOs: number;
  };
  inventory: {
    totalItems: number;
    lowStockItems: number;
    totalStock: number;
  };
  financial: {
    totalWasteCost: number;
    totalPlannedCost: number;
    totalActualCost: number;
    costVariance: number;
  };
  recent: {
    purchaseOrders: Array<{
      _id: string;
      poNumber: string;
      projectId: DashboardReference;
      supplierId: DashboardReference;
      items: Array<{ materialId: DashboardReference; quantity: number; unitPrice: number }>;
      totalAmount: number;
      status: PurchaseOrder['status'];
      orderDate: string;
    }>;
    wasteRecords: Array<{
      _id: string;
      projectId: DashboardReference;
      materialId: DashboardReference;
      quantity: number;
      reason: WasteRecord['reason'];
      costImpact: number;
      date: string;
    }>;
  };
  lowStockItems: InventoryItem[];
}

export const DashboardPage: React.FC = () => {
  const { selectedProjectId, selectedProject } = useProject();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = selectedProjectId !== 'all' ? { projectId: selectedProjectId } : undefined;
      const res = await api.get('/dashboard/summary', params);
      const summary = res.data as BackendDashboardSummary;
      if (summary) {
        setData({
          activeProjectsCount: summary.overview.activeProjects,
          totalStockValue: summary.inventory.totalStock,
          lowStockCount: summary.inventory.lowStockItems,
          pendingPOCount: summary.overview.approvedPOs,
          monthlyWasteCost: summary.financial.totalWasteCost,
          costVariance: summary.financial.costVariance,
          recentPurchaseOrders: (summary.recent.purchaseOrders || []).map((po) => ({
            ...po,
            project: po.projectId,
            supplier: po.supplierId,
            items: (po.items || []).map((item) => ({ ...item, material: item.materialId })),
          })) as PurchaseOrder[],
          recentWasteRecords: (summary.recent.wasteRecords || []).map((record) => ({
            ...record,
            project: record.projectId,
            material: record.materialId,
            incidentDate: record.date,
          })) as WasteRecord[],
          lowStockItems: summary.lowStockItems || [],
        });
      }
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedProjectId]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Scope Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-heading tracking-tight text-white">
            Operations & Material Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time material telemetry, procurement velocity, and stock health for{' '}
            <strong className="text-amber-400">
              {selectedProjectId === 'all' ? 'All Active Construction Sites' : selectedProject?.name}
            </strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:text-white transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => navigate('/purchase-orders')}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:bg-amber-400 transition-all"
          >
            <Plus className="h-4 w-4" />
            Create Purchase Order
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-900/60 bg-rose-950/30 p-4 text-sm text-rose-300" role="alert">
          {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Active Sites"
          value={data?.activeProjectsCount ?? 0}
          icon={FolderKanban}
          variant="blue"
          onClick={() => navigate('/projects')}
        />
        <StatCard
          title="Stock Value"
          value={formatCurrency(data?.totalStockValue ?? 0)}
          icon={Warehouse}
          variant="default"
          onClick={() => navigate('/inventory')}
        />
        <StatCard
          title="Low Stock Alerts"
          value={data?.lowStockCount ?? 0}
          icon={AlertTriangle}
          variant={data?.lowStockCount ? 'amber' : 'default'}
          subtitle={data?.lowStockCount ? 'Items below reorder level' : 'All levels healthy'}
          onClick={() => navigate('/inventory')}
        />
        <StatCard
          title="Pending POs"
          value={data?.pendingPOCount ?? 0}
          icon={ShoppingCart}
          variant="blue"
          subtitle="Awaiting Delivery / GRN"
          onClick={() => navigate('/purchase-orders')}
        />
        <StatCard
          title="Monthly Waste"
          value={formatCurrency(data?.monthlyWasteCost ?? 0)}
          icon={Trash2}
          variant="rose"
          trend={{ value: '+4.2% MoM', isPositive: false }}
          onClick={() => navigate('/waste')}
        />
        <StatCard
          title="Budget Variance"
          value={formatCurrency(data?.costVariance ?? 0)}
          icon={TrendingDown}
          variant="emerald"
          trend={{ value: 'Under Budget', isPositive: true }}
          onClick={() => navigate('/consumption')}
        />
      </div>

      {/* Action Banner for Site Operations */}
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-block rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">
            Site Material Desk
          </span>
          <h3 className="text-base font-bold text-white font-heading">
            Need to issue materials or log a receipt at site?
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Keep stock audits 100% synchronized with instant Goods Receipt Notes (GRN) and Site Issue Slips.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/inventory')}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
          >
            Issue to Site
          </button>
          <button
            onClick={() => navigate('/waste')}
            className="rounded-xl border border-rose-800/40 bg-rose-950/30 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-900/40 transition-colors"
          >
            Log Site Waste
          </button>
        </div>
      </div>

      {/* Recent Orders & Waste Records Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Purchase Orders */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-bold font-heading text-white">
                Recent Purchase Orders
              </h2>
            </div>
            <button
              onClick={() => navigate('/purchase-orders')}
              className="flex items-center gap-1 text-xs font-semibold text-amber-400 hover:underline"
            >
              View All <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3">
            {data?.recentPurchaseOrders?.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No recent purchase orders.</p>
            ) : (
              data?.recentPurchaseOrders?.map((po) => (
                <div
                  key={po._id}
                  onClick={() => navigate('/purchase-orders')}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/40 hover:border-slate-700 cursor-pointer transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white">
                        {po.poNumber}
                      </span>
                      <StatusBadge status={po.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {typeof po.supplier === 'object' && po.supplier ? po.supplier.name : 'Supplier'} •{' '}
                      {typeof po.project === 'object' && po.project ? po.project.code : 'Site'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold font-mono text-emerald-400">
                      {formatCurrency(po.totalAmount)}
                    </p>
                    <span className="text-[10px] text-slate-500">{po.orderDate}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Attention Drawer / List */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-bold font-heading text-white">
                Low Stock Thresholds
              </h2>
            </div>
            <button
              onClick={() => navigate('/inventory')}
              className="flex items-center gap-1 text-xs font-semibold text-amber-400 hover:underline"
            >
              Inventory Ledger <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3">
            {data?.lowStockCount === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                All inventory items are currently above safe reorder levels.
              </p>
            ) : data?.lowStockItems?.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                {data?.lowStockCount} low-stock record(s) require review in Inventory.
              </p>
            ) : (
              data?.lowStockItems?.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-3 rounded-xl border border-amber-900/30 bg-amber-950/10"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {item.material.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {item.material.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Current: <strong className="text-rose-400">{item.currentStock} {item.material.unit}</strong> • Reorder: {item.material.reorderLevel} {item.material.unit}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/purchase-orders')}
                    className="rounded-lg bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 text-xs font-bold text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-colors"
                  >
                    Reorder
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
