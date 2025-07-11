import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { FormCard } from '../../components/ui/FormCard';

// Define the structure of our P&L data
interface PL_Data {
  revenue: number;
  costOfSales: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;
}

export const ProfitAndLossPage = () => {
  const [plData, setPlData] = useState<PL_Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPLData = async () => {
    setLoading(true);
    setError(null);
    try {
      // We will create this RPC function in Supabase
      const { data, error } = await supabase.rpc('get_profit_and_loss');
      if (error) throw error;
      
      // Calculate derived values
      const revenue = data.find((d: any) => d.category === 'Revenue')?.total || 0;
      const costOfSales = data.find((d: any) => d.category === 'Cost of Sales')?.total || 0;
      const expenses = data.find((d: any) => d.category === 'Expenses')?.total || 0;
      const grossProfit = revenue - costOfSales;
      const netProfit = grossProfit - expenses;

      setPlData({ revenue, costOfSales, grossProfit, expenses, netProfit });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPLData();
  }, []);

  const renderLineItem = (label: string, value: number, isTotal = false, isPositiveGood = true) => {
    const textColor = value >= 0 ? 
      (isPositiveGood ? 'text-emerald-500' : 'text-red-500') : 
      (isPositiveGood ? 'text-red-500' : 'text-emerald-500');

    return (
      <div className={`flex justify-between py-2 ${isTotal ? 'font-bold border-t border-gray-600 mt-2 pt-2' : ''}`}>
        <span>{label}</span>
        <span className={textColor}>{value.toFixed(2)}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FormCard title="Profit & Loss Statement">
        <p className="text-sm text-gray-500 dark:text-gray-400 pb-4">
          This report shows the company's financial performance over a period of time.
        </p>
        
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {plData && (
          <div className="max-w-md mx-auto">
            {renderLineItem('Total Revenue', plData.revenue)}
            {renderLineItem('Cost of Goods Sold (COGS)', plData.costOfSales, false, false)}
            {renderLineItem('Gross Profit', plData.grossProfit, true)}
            
            <div className="mt-6">
                {renderLineItem('Operating Expenses', plData.expenses, false, false)}
                {renderLineItem('Net Profit', plData.netProfit, true)}
            </div>
          </div>
        )}
      </FormCard>
    </div>
  );
};
