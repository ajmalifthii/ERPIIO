import { DollarSign, CreditCard, Package, Users, Eye, Edit } from 'lucide-react';
import { StatsCard } from '../components/ui/StatsCard';
import { DataTable } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { QuickActionsWidget } from '../components/widgets/QuickActionsWidget';
import { ChequeRemindersWidget } from '../components/widgets/ChequeRemindersWidget';
import { StockAlertsWidget } from '../components/widgets/StockAlertsWidget';
import { commonClasses } from '../lib/commonClasses';
import { getDashboardStats, getRecentSales, getRecentActivity } from '../lib/dashboardService';
import { SalesOrder, ActivityLog } from '../types';
import { timeAgo } from '../lib/utils';
import { useState, useEffect, ReactNode } from 'react';

interface DashboardStats {
  monthlyRevenue: number;
  outstandingCheques: number;
  inventoryValue: number;
  customerCount: number;
}

interface DashboardPageProps {
  navigateTo: (view: string, tab?: string) => void;
}

export const DashboardPage = ({ navigateTo }: DashboardPageProps) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSales, setRecentSales] = useState<SalesOrder[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Keep global loading for initial error handling, but we won't show a global spinner
      setLoading(true);
      setError(null);
      try {
        const [statsData, salesData, activityData] = await Promise.all([
          getDashboardStats(),
          getRecentSales(),
          getRecentActivity()
        ]);
        setStats(statsData);
        setRecentSales(salesData as SalesOrder[]);
        setRecentActivity(activityData);
      } catch (err: any) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Global error is still useful
  if (error && !stats) {
    return (
      <div className={`${commonClasses.card} bg-red-500/10 border-red-500/30 text-center p-4`}>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  const salesColumns: (string | ReactNode)[] = ['ID', 'Customer', 'Amount', 'Status', 'Actions'];
  const salesData: (string | ReactNode)[][] = recentSales.map(order => [
    order.id,
    order.customer,
    `LKR ${order.amount.toFixed(2)}`,
    <StatusBadge status={order.status} />,
    <div className="flex space-x-2">
      <button className="p-1 rounded-md hover:bg-slate-700"><Eye className="h-4 w-4" /></button>
      <button className="p-1 rounded-md hover:bg-slate-700"><Edit className="h-4 w-4" /></button>
    </div>
  ]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Monthly Revenue" value={stats ? `LKR ${stats.monthlyRevenue.toFixed(2)}` : 'LKR 0.00'} icon={DollarSign} color="teal" loading={loading} />
        <StatsCard title="Outstanding Cheques" value={stats ? `LKR ${stats.outstandingCheques.toFixed(2)}` : 'LKR 0.00'} icon={CreditCard} color="amber" loading={loading} />
        <StatsCard title="Inventory Value" value={stats ? `LKR ${stats.inventoryValue.toFixed(2)}` : 'LKR 0.00'} icon={Package} color="sky" loading={loading} />
        <StatsCard title="Active Customers" value={stats ? stats.customerCount.toString() : '0'} icon={Users} color="emerald" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <QuickActionsWidget navigateTo={navigateTo} />
          <DataTable
            title="Recent Sales"
            columns={salesColumns}
            data={salesData}
            loading={loading && recentSales.length === 0}
            error={error && recentSales.length === 0 ? error : null}
          />
        </div>
        <div className="space-y-6">
          <ChequeRemindersWidget />
          <StockAlertsWidget />
          <div className={commonClasses.card}>
            <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
            {loading && recentActivity.length === 0 ? (
                <div className="space-y-3 animate-pulse">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-10 bg-slate-300/50 dark:bg-slate-700/50 rounded"></div>
                    ))}
                </div>
            ) : (
                <ul className="space-y-3">
                  {recentActivity.length > 0 ? recentActivity.map(activity => (
                    <li key={activity.id} className="text-sm flex flex-col">
                      <div>
                        <span className="font-semibold text-gray-200">{activity.user_email || 'A user'}</span>
                        <span className="text-gray-400"> {activity.action.toLowerCase()}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{timeAgo(activity.created_at)}</p>
                    </li>
                  )) : <p className="text-sm text-gray-500">No recent activity logged.</p>}
                </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
