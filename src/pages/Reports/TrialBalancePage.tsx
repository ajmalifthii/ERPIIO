import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { DataTable } from '../../components/ui/DataTable';
import { FormCard } from '../../components/ui/FormCard';

interface TrialBalanceEntry {
  account: string;
  debit: number;
  credit: number;
}

export const TrialBalancePage = () => {
  const [trialBalance, setTrialBalance] = useState<TrialBalanceEntry[]>([]);
  const [totals, setTotals] = useState({ debit: 0, credit: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrialBalance = async () => {
    setLoading(true);
    setError(null);
    try {
      // We will create this RPC function in Supabase
      const { data, error } = await supabase.rpc('get_trial_balance');
      if (error) throw error;
      
      setTrialBalance(data);

      // Calculate totals
      const totalDebit = data.reduce((sum: number, item: TrialBalanceEntry) => sum + item.debit, 0);
      const totalCredit = data.reduce((sum: number, item: TrialBalanceEntry) => sum + item.credit, 0);
      setTotals({ debit: totalDebit, credit: totalCredit });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrialBalance();
  }, []);

  return (
    <div className="space-y-4">
      <FormCard title="Trial Balance">
        <p className="text-sm text-gray-500 dark:text-gray-400 pb-4">
          This report summarizes all the accounts in the general ledger. The total debits must equal the total credits.
        </p>
        <DataTable
          columns={['Account', 'Debit (LKR)', 'Credit (LKR)']}
          data={trialBalance.map(entry => [
            entry.account,
            entry.debit > 0 ? entry.debit.toFixed(2) : '-',
            entry.credit > 0 ? entry.credit.toFixed(2) : '-',
          ])}
          loading={loading}
          error={error}
        />
        <div className="pt-4 flex justify-end">
            <div className="w-1/3">
                <div className="flex justify-between font-bold border-t-2 pt-2">
                    <span>Total</span>
                    <div className="flex space-x-8">
                        <span>{totals.debit.toFixed(2)}</span>
                        <span>{totals.credit.toFixed(2)}</span>
                    </div>
                </div>
                {totals.debit !== totals.credit && (
                    <p className="text-red-500 text-sm text-right pt-1">Totals do not match!</p>
                )}
            </div>
        </div>
      </FormCard>
    </div>
  );
};
