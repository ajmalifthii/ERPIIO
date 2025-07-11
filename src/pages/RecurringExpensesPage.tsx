import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { RecurringExpense } from '../types';
import { DataTable } from '../components/ui/DataTable';
import { FormCard } from '../components/ui/FormCard';
import { commonClasses } from '../lib/commonClasses';
import { StatusBadge } from '../components/ui/StatusBadge';
import toast from 'react-hot-toast';

export const RecurringExpensesPage = () => {
    const [expenses, setExpenses] = useState<RecurringExpense[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState<number | ''>('');
    const [debitAccount, setDebitAccount] = useState('Rent Expense');
    const [creditAccount, setCreditAccount] = useState('Cash');
    const [frequency, setFrequency] = useState('Monthly');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchExpenses = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('recurring_expenses').select('*').order('created_at');
        if (error) {
            toast.error("Could not fetch expenses.");
            setError(error.message);
        }
        else setExpenses(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!amount || amount <= 0) {
            toast.error("Amount must be a positive number.");
            return;
        }

        const { error } = await supabase.from('recurring_expenses').insert({
            description,
            amount,
            debit_account: debitAccount,
            credit_account: creditAccount,
            frequency,
            start_date: startDate,
            next_due_date: startDate // The first one is due on the start date
        });

        if (error) {
            toast.error(error.message);
            setError(error.message);
        }
        else {
            toast.success("Recurring expense created!");
            fetchExpenses();
            // Reset form
            setDescription(''); setAmount(''); setDebitAccount('Rent Expense'); setFrequency('Monthly');
        }
    };

    return (
        <div className="space-y-4">
            <FormCard title="Set Up New Recurring Expense">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <input type="text" placeholder="Description (e.g., Office Rent)" value={description} onChange={e => setDescription(e.target.value)} className={commonClasses.input} required />
                    <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(Number(e.target.value))} className={commonClasses.input} required />
                    <select value={frequency} onChange={e => setFrequency(e.target.value)} className={commonClasses.input}>
                        <option>Monthly</option>
                        <option>Weekly</option>
                        <option>Yearly</option>
                    </select>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={commonClasses.input} />
                    <input type="text" placeholder="Debit Account" value={debitAccount} onChange={e => setDebitAccount(e.target.value)} className={commonClasses.input} required />
                    <input type="text" placeholder="Credit Account" value={creditAccount} onChange={e => setCreditAccount(e.target.value)} className={commonClasses.input} required />
                    <div className="flex justify-end col-span-full">
                        <button type="submit" className={commonClasses.button}>Save Expense</button>
                    </div>
                </form>
            </FormCard>
            <DataTable
                title="Configured Recurring Expenses"
                columns={['Description', 'Amount', 'Frequency', 'Next Due Date', 'Status']}
                data={expenses.map(exp => [
                    exp.description,
                    `LKR ${exp.amount.toFixed(2)}`,
                    exp.frequency,
                    new Date(exp.next_due_date).toLocaleDateString(),
                    <StatusBadge status={exp.is_active ? 'Active' : 'Inactive'} />
                ])}
                loading={loading}
                error={error}
            />
        </div>
    );
};