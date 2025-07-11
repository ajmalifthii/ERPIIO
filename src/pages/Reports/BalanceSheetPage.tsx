import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { FormCard } from '../../components/ui/FormCard';

interface BalanceSheetData {
    assets: Array<{ account: string; balance: number }>;
    liabilities: Array<{ account: string; balance: number }>;
    equity: Array<{ account: string; balance: number }>;
}

interface BalanceSheetTotals {
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
}

export const BalanceSheetPage = () => {
  const [bsData, setBsData] = useState<BalanceSheetData | null>(null);
  const [totals, setTotals] = useState<BalanceSheetTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalanceSheet = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.rpc('get_balance_sheet');
        if (error) throw error;
        
        const assets = data.filter((d: any) => d.category === 'Assets');
        const liabilities = data.filter((d: any) => d.category === 'Liabilities');
        const equity = data.filter((d: any) => d.category === 'Equity');

        const totalAssets = assets.reduce((sum: number, item: any) => sum + item.balance, 0);
        const totalLiabilities = liabilities.reduce((sum: number, item: any) => sum + item.balance, 0);
        const totalEquity = equity.reduce((sum: number, item: any) => sum + item.balance, 0);

        setBsData({ assets, liabilities, equity });
        setTotals({ totalAssets, totalLiabilities, totalEquity });

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBalanceSheet();
  }, []);

  const renderSection = (title: string, items: Array<{ account: string; balance: number }>, total: number) => (
    <div>
        <h3 className="text-lg font-bold text-teal-400 mb-2">{title}</h3>
        {items.map(item => (
            <div key={item.account} className="flex justify-between py-1">
                <span>{item.account}</span>
                <span>{item.balance.toFixed(2)}</span>
            </div>
        ))}
        <div className="flex justify-between font-bold border-t border-gray-600 mt-2 pt-2">
            <span>Total {title}</span>
            <span>{total.toFixed(2)}</span>
        </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <FormCard title="Balance Sheet">
        <p className="text-sm text-gray-500 dark:text-gray-400 pb-4">
          This report presents a snapshot of the company's financial position at a single point in time.
        </p>
        
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {bsData && totals && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {renderSection('Assets', bsData.assets, totals.totalAssets)}
            
            <div className="space-y-6">
                {renderSection('Liabilities', bsData.liabilities, totals.totalLiabilities)}
                {renderSection('Equity', bsData.equity, totals.totalEquity)}
                
                <div className="flex justify-between font-bold text-lg border-t-2 border-teal-500 pt-3">
                    <span>Total Liabilities & Equity</span>
                    <span>{(totals.totalLiabilities + totals.totalEquity).toFixed(2)}</span>
                </div>
                 {totals.totalAssets.toFixed(2) !== (totals.totalLiabilities + totals.totalEquity).toFixed(2) && (
                    <p className="text-red-500 text-sm text-right pt-1">Assets do not equal Liabilities + Equity!</p>
                )}
            </div>
          </div>
        )}
      </FormCard>
    </div>
  );
};
