import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { commonClasses } from '../../lib/commonClasses';
import { getStockAlerts } from '../../lib/dashboardService';
import { InventoryItem } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';

export const StockAlertsWidget = () => {
  const [alerts, setAlerts] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const data = await getStockAlerts();
        setAlerts(data);
      } catch (error) {
        console.error("Error fetching stock alerts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);
  
  const formatQuantity = (item: InventoryItem) => {
    if (item.type === 'Leather') {
      return `${item.sqft || 0} sqft left`;
    }
    return `${item.units || 0} units left`;
  }

  return (
    <div className={commonClasses.card}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-md font-bold text-gray-900 dark:text-white">Low Stock Alerts</h3>
        <button className="text-xs font-semibold text-teal-500 hover:underline flex items-center">
          View All <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
        </button>
      </div>
      <div className="space-y-2.5">
        {loading ? <p className="text-sm text-gray-500">Loading...</p> :
         alerts.length === 0 ? <p className="text-sm text-gray-500">No low stock items.</p> :
         alerts.slice(0, 3).map(item => (
          <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-black/20">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatQuantity(item)}
              </p>
            </div>
            {/* Assuming low stock items have a specific status, or we can create a new badge */}
            <StatusBadge status="Low Stock" />
          </div>
        ))}
      </div>
    </div>
  );
};
