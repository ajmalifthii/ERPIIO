import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { LedgerEntry } from '../types';
import { DataTable } from '../components/ui/DataTable';
import { FormCard } from '../components/ui/FormCard';
import { ManualJournalEntryForm } from '../components/forms/ManualJournalEntryForm';
import { reverseTransaction } from '../lib/accountingService';
import toast from 'react-hot-toast';
import { RotateCcw } from 'lucide-react';

export const GeneralLedgerPage = () => {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchLedgerEntries = async () => { /* ... same as before ... */ };
  useEffect(() => { fetchLedgerEntries(); }, [refreshKey]);

  const handleSave = () => { setRefreshKey(prevKey => prevKey + 1); };
  
  const handleReverse = async (transactionId: string) => {
    if (window.confirm('Are you sure you want to reverse this entire transaction?')) {
      const toastId = toast.loading('Reversing transaction...');
      try {
        await reverseTransaction(transactionId, 'Manual reversal from General Ledger.');
        toast.success('Transaction reversed.', { id: toastId });
        handleSave(); // Refresh data
      } catch (err: any) {
        toast.error(`Reversal failed: ${err.message}`, { id: toastId });
      }
    }
  };

  return (
    <div className="space-y-4">
        <FormCard title="Manual Journal Entry">
            <ManualJournalEntryForm onSave={handleSave} />
        </FormCard>
        <DataTable
            title="General Ledger"
            columns={['Date', 'Account', 'Description', 'Debit', 'Credit', 'Actions']}
            data={entries.map(entry => [
                new Date(entry.date).toLocaleDateString(),
                entry.account_id,
                entry.description,
                entry.type === 'debit' ? `LKR ${entry.amount.toFixed(2)}` : '',
                entry.type === 'credit' ? `LKR ${entry.amount.toFixed(2)}` : '',
                <button 
                  onClick={() => handleReverse(entry.transaction_id)} 
                  title="Reverse Transaction"
                  className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-black/20"
                >
                  <RotateCcw className="h-4 w-4 text-amber-500" />
                </button>
            ])}
            loading={loading}
            error={error}
        />
    </div>
  );
};
