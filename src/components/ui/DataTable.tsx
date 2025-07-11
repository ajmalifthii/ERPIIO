import { commonClasses } from '../../lib/commonClasses';
import { LucideIcon } from 'lucide-react';

interface DataTableProps {
  columns: string[];
  data: (string | JSX.Element)[][];
  title: string;
  loading: boolean;
  error: string | null;
  actions?: {
    icon: LucideIcon;
    className?: string;
  }[];
}

export const DataTable = ({ columns, data, title, loading, error, actions = [] }: DataTableProps) => (
  <div className={`${commonClasses.card} overflow-hidden`}>
    <div className="flex items-center justify-between mb-3 px-1 pt-1">
      <h3 className="text-md font-bold text-gray-900 dark:text-white">{title}</h3>
      <div className="flex space-x-2">
        {actions.map((action, index) => (
          <button key={index} className={action.className || commonClasses.buttonSecondary}>
            {action.icon && <action.icon className="h-4 w-4" />}
          </button>
        ))}
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full min-w-max">
          <thead className="bg-slate-100/50 dark:bg-black/20 border-t border-b border-slate-200 dark:border-white/10">
            <tr>
              {columns.map((column, index) => (
                <th key={index} className={commonClasses.th}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/50 dark:divide-white/10">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-4">Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-4 text-red-500">Error: {error}</td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-slate-100/50 dark:hover:bg-black/10 transition-colors duration-200">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className={`${commonClasses.td} whitespace-nowrap`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
  </div>
);