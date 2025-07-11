import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { BankAccount } from '../types';
import { DataTable } from '../components/ui/DataTable';
import { FormCard } from '../components/ui/FormCard';
import { commonClasses } from '../lib/commonClasses';
import { PlusCircle, Trash2 } from 'lucide-react';
import { SL_BANKS } from '../lib/constants'; // Import from constants

export const BankAccountsPage = () => {
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Form state
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountType, setAccountType] = useState('Current - Corporate');
    const [startingBalance, setStartingBalance] = useState(0);

    const fetchAccounts = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('bank_accounts').select('*');
        if (error) {
            console.error(error);
            setError(error.message);
        }
        else setAccounts(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.from('bank_accounts').insert({
            bank_name: bankName,
            account_number: accountNumber,
            account_type: accountType,
            starting_balance: startingBalance,
            current_balance: startingBalance // Initially the same
        });

        if (error) {
            alert(error.message);
            setError(error.message);
        }
        else {
            fetchAccounts();
            // Reset form
            setBankName(''); setAccountNumber(''); setAccountType('Current - Corporate'); setStartingBalance(0);
        }
    };

    return (
        <div className="space-y-4">
            <FormCard title="Add New Bank Account">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <select value={bankName} onChange={e => setBankName(e.target.value)} className={commonClasses.input} required>
                        <option value="">Select Bank</option>
                        {SL_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <input type="text" placeholder="Account Number" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className={commonClasses.input} required />
                    <select value={accountType} onChange={e => setAccountType(e.target.value)} className={commonClasses.input}>
                        <option>Current - Corporate</option>
                        <option>Current - Personal</option>
                        <option>Savings</option>
                    </select>
                    <input type="number" placeholder="Current Balance" value={startingBalance} onChange={e => setStartingBalance(Number(e.target.value))} className={commonClasses.input} required />
                    <div className="flex justify-end col-span-full">
                        <button type="submit" className={commonClasses.button}>Add Account</button>
                    </div>
                </form>
            </FormCard>
            <DataTable
                title="Managed Bank Accounts"
                columns={['Bank', 'Account Number', 'Type', 'Current Balance']}
                data={accounts.map(acc => [
                    acc.bank_name,
                    acc.account_number,
                    acc.account_type,
                    `LKR ${acc.current_balance.toFixed(2)}`
                ])}
                loading={loading}
                error={error}
            />
        </div>
    );
};