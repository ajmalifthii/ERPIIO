import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { commonClasses } from '../../lib/commonClasses';
import { postTransaction } from '../../lib/accountingService';

interface ManualJournalEntryFormProps {
  onSave: () => void;
}

export const ManualJournalEntryForm = ({ onSave }: ManualJournalEntryFormProps) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [debitAccount, setDebitAccount] = useState('');
  const [creditAccount, setCreditAccount] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [accounts, setAccounts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      // Fetch unique account names from the ledger
      const { data, error } = await supabase.rpc('get_unique_accounts');
      if (error) {
        console.error('Error fetching accounts:', error);
      } else {
        // Add default accounts if they don't exist
        const defaultAccounts = ['Cash', 'Sales Revenue', 'Accounts Receivable', 'Inventory', 'Accounts Payable', 'Cheques Receivable', 'Cheques Payable', 'Manual Adjustments'];
        const uniqueAccounts = new Set([...defaultAccounts, ...(data || [])]);
        setAccounts(Array.from(uniqueAccounts));
      }
    };
    fetchAccounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!debitAccount || !creditAccount || !amount || amount <= 0) {
      setError('Please fill all fields correctly. Amount must be positive.');
      return;
    }
    if (debitAccount === creditAccount) {
      setError('Debit and Credit accounts cannot be the same.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await postTransaction(
        date,
        description,
        debitAccount,
        creditAccount,
        amount
      );
      onSave();
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDebitAccount('');
    setCreditAccount('');
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <input 
            type="date" 
            className={commonClasses.input} 
            value={date}
            onChange={(e) => setDate(e.target.value)}
        />
        <input 
            type="number" 
            className={commonClasses.input} 
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
        />
         <input 
            type="text" 
            className={commonClasses.input} 
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
        />
        <select className={commonClasses.input} value={debitAccount} onChange={(e) => setDebitAccount(e.target.value)} required>
            <option value="">Select Debit Account</option>
            {accounts.map(acc => <option key={`dr-${acc}`} value={acc}>{acc}</option>)}
        </select>
        <select className={commonClasses.input} value={creditAccount} onChange={(e) => setCreditAccount(e.target.value)} required>
            <option value="">Select Credit Account</option>
            {accounts.map(acc => <option key={`cr-${acc}`} value={acc}>{acc}</option>)}
        </select>
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" className={commonClasses.button} disabled={loading}>
            {loading ? 'Posting...' : 'Post Entry'}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
    </form>
  );
};
