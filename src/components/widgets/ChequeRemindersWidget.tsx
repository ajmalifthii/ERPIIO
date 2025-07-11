import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { commonClasses } from '../../lib/commonClasses';
import { getChequeReminders } from '../../lib/dashboardService';
import { Cheque } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';

export const ChequeRemindersWidget = () => {
  const [reminders, setReminders] = useState<Cheque[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        setLoading(true);
        const data = await getChequeReminders();
        // @ts-ignore
        setReminders(data);
      } catch (error) {
        console.error("Error fetching cheque reminders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReminders();
  }, []);

  return (
    <div className={commonClasses.card}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-md font-bold text-gray-900 dark:text-white">Cheque Reminders (Next 7 Days)</h3>
        <button className="text-xs font-semibold text-teal-500 hover:underline flex items-center">
          View All <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
        </button>
      </div>
      <div className="space-y-2.5">
        {loading ? <p className="text-sm text-gray-500">Loading...</p> : 
         reminders.length === 0 ? <p className="text-sm text-gray-500">No upcoming cheques.</p> :
         reminders.slice(0, 3).map(cheque => (
          <div key={cheque.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-black/20">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {/* @ts-ignore */}
                {cheque.client} - LKR {cheque.amount.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Due: {new Date(cheque.due_date).toLocaleDateString()}
              </p>
            </div>
            <StatusBadge status={cheque.status} />
          </div>
        ))}
      </div>
    </div>
  );
};
