import { Printer, FilePlus, Box, UserPlus } from 'lucide-react';
import { commonClasses } from '../../lib/commonClasses';

interface QuickActionsWidgetProps {
    navigateTo: (view: string, tab?: string) => void;
}

export const QuickActionsWidget = ({ navigateTo }: QuickActionsWidgetProps) => (
  <div className={commonClasses.card}>
    <h3 className="text-md font-bold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <button onClick={() => navigateTo('pos')} className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-100 dark:bg-black/20 hover:bg-slate-200 dark:hover:bg-black/40 transition-colors">
        <Printer className="h-6 w-6 text-teal-400 mb-1" />
        <span className="text-sm font-semibold">POS</span>
      </button>
      <button onClick={() => navigateTo('dashboard', 'sales')} className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-100 dark:bg-black/20 hover:bg-slate-200 dark:hover:bg-black/40 transition-colors">
        <FilePlus className="h-6 w-6 text-sky-400 mb-1" />
        <span className="text-sm font-semibold">New Sale</span>
      </button>
      <button onClick={() => navigateTo('dashboard', 'inventory')} className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-100 dark:bg-black/20 hover:bg-slate-200 dark:hover:bg-black/40 transition-colors">
        <Box className="h-6 w-6 text-amber-400 mb-1" />
        <span className="text-sm font-semibold">Add Stock</span>
      </button>
       <button onClick={() => navigateTo('dashboard', 'customers')} className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-100 dark:bg-black/20 hover:bg-slate-200 dark:hover:bg-black/40 transition-colors">
        <UserPlus className="h-6 w-6 text-emerald-400 mb-1" />
        <span className="text-sm font-semibold">New Contact</span>
      </button>
    </div>
  </div>
);
