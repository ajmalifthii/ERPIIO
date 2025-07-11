import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { commonClasses } from '../../lib/commonClasses';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  loading?: boolean;
  color?: string;
  trend?: 'up' | 'down';
  trendValue?: string;
}

export const StatsCard = ({ title, value, icon: Icon, loading, color = 'teal', trend, trendValue }: StatsCardProps) => {
    if (loading) {
        return (
            <div className={`${commonClasses.card} animate-pulse`}>
                <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-300/50 dark:bg-slate-700/50 rounded w-3/4"></div>
                        <div className="h-6 bg-slate-300/50 dark:bg-slate-700/50 rounded w-1/2"></div>
                    </div>
                    <div className="p-2 rounded-full bg-slate-300/50 dark:bg-slate-700/50">
                        <div className="h-5 w-5"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={commonClasses.card}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 truncate">{title}</p>
                    <p className={`text-xl font-bold text-gray-800 dark:text-white`}>{value}</p>
                    {trend && (
                        <div className={`flex items-center mt-1 text-xs ${trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                            {trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                            <span className="font-semibold">{trendValue}</span>
                        </div>
                    )}
                </div>
                {Icon && (
                    <div className={`p-2 rounded-full bg-${color}-500/20`}>
                        <Icon className={`h-5 w-5 text-${color}-600 dark:text-${color}-400`} data-testid="stats-card-icon" />
                    </div>
                )}
            </div>
        </div>
    );
};
