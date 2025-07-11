import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { BankAccount, LedgerEntry } from '../types';
import { commonClasses } from '../lib/commonClasses';
import Papa from 'papaparse';
import toast from 'react-hot-toast';

interface BankTransaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    match_id?: string | null;
    is_manual_match?: boolean;
}

interface UILedgerEntry extends LedgerEntry {
    match_id?: string | null;
    is_manual_match?: boolean;
}

export const BankReconciliationPage = () => {
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<string>('');
    const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
    const [ledgerEntries, setLedgerEntries] = useState<UILedgerEntry[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [selectedBankTx, setSelectedBankTx] = useState<BankTransaction | null>(null);
    const [selectedLedgerEntry, setSelectedLedgerEntry] = useState<UILedgerEntry | null>(null);

    useEffect(() => {
        const fetchAccounts = async () => {
            const { data } = await supabase.from('bank_accounts').select('*, ledger_account:accounts(name)');
            setAccounts(data || []);
        };
        fetchAccounts();
    }, []);
    
    const fetchTransactions = async () => {
        const account = accounts.find(a => a.id === selectedAccount);
        if (!account || !account.ledger_account_id) return;

        const { data: ledgerData, error } = await supabase
            .from('ledger')
            .select('*')
            .eq('account_id', account.ledger_account_id)
            .eq('is_reconciled', false)
            .order('date', { ascending: true });
        
        if(error) toast.error("Failed to fetch ledger entries.");
        else setLedgerEntries(ledgerData || []);
    };

    useEffect(() => {
        fetchTransactions();
    }, [selectedAccount, accounts]);

    const autoMatchTransactions = (bankTxs: BankTransaction[], ledger: UILedgerEntry[]) => {
        const matchedBankTxs = [...bankTxs];
        const matchedLedger = [...ledger];

        for (const bankTx of matchedBankTxs) {
            if (bankTx.match_id) continue;

            const potentialMatch = matchedLedger.find(entry => 
                !entry.match_id &&
                Math.abs(bankTx.amount) === entry.amount &&
                ((bankTx.amount > 0 && entry.type === 'debit') || (bankTx.amount < 0 && entry.type === 'credit'))
            );

            if (potentialMatch) {
                const matchId = crypto.randomUUID();
                bankTx.match_id = matchId;
                potentialMatch.match_id = matchId;
            }
        }
        setBankTransactions(matchedBankTxs);
        setLedgerEntries(matchedLedger);
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const parsedData: BankTransaction[] = results.data.map((row: any) => ({
                        id: crypto.randomUUID(),
                        date: row.Date,
                        description: row.Description,
                        amount: parseFloat(row.Debit) ? -parseFloat(row.Debit) : parseFloat(row.Credit),
                    }));
                    autoMatchTransactions(parsedData, ledgerEntries);
                }
            });
        }
    };
    
    const handleReconcileAll = async () => {
        const matchesToReconcile = ledgerEntries.filter(e => e.match_id && !e.is_manual_match);
        if(matchesToReconcile.length === 0) {
            toast.error("No automatic matches to reconcile.");
            return;
        }

        const { error } = await supabase
            .from('ledger')
            .update({ is_reconciled: true })
            .in('id', matchesToReconcile.map(e => e.id));

        if (error) {
            toast.error("Reconciliation failed: " + error.message);
        } else {
            toast.success(`${matchesToReconcile.length} transactions reconciled successfully!`);
            fetchTransactions(); // Refetch
            setBankTransactions(bankTransactions.filter(t => !matchesToReconcile.some(e => e.match_id === t.match_id)));
        }
    };

    const handleManualMatch = () => {
        if(!selectedBankTx || !selectedLedgerEntry) return;

        const matchId = crypto.randomUUID();
        setBankTransactions(bankTransactions.map(t => t.id === selectedBankTx.id ? {...t, match_id: matchId, is_manual_match: true } : t));
        setLedgerEntries(ledgerEntries.map(e => e.id === selectedLedgerEntry.id ? {...e, match_id: matchId, is_manual_match: true } : e));
        setSelectedBankTx(null);
        setSelectedLedgerEntry(null);
    }
    
    const isManualMatchPossible = selectedBankTx && selectedLedgerEntry && !selectedBankTx.match_id && !selectedLedgerEntry.match_id;

    return (
      <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold">Bank Reconciliation</h1>
                <div className="flex items-center space-x-2">
                    <select value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)} className={commonClasses.input}>
                        <option value="">Select Bank Account</option>
                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.bank_name} - {acc.account_number}</option>)}
                    </select>
                    <button onClick={() => fileInputRef.current?.click()} className={`${commonClasses.buttonSecondary}`} disabled={!selectedAccount}>
                        Import Statement
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileImport} />
                    <button onClick={handleManualMatch} className={commonClasses.button} disabled={!isManualMatchPossible}>
                        Match Selected
                    </button>
                     <button onClick={handleReconcileAll} className={commonClasses.buttonSuccess}>
                        Reconcile All Auto-Matches
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gray-800 h-[70vh] overflow-y-auto">
                    <h2 className="font-bold mb-2">Bank Statement Transactions</h2>
                    {bankTransactions.map(t => {
                        const isSelected = selectedBankTx?.id === t.id;
                        const isMatched = t.match_id;
                        const bgColor = isSelected ? 'bg-blue-600' : isMatched ? 'bg-teal-800/50' : 'bg-gray-700 hover:bg-gray-600';
                        return (
                            <div key={t.id} onClick={() => !isMatched && setSelectedBankTx(t)} className={`p-2 rounded cursor-pointer ${bgColor} flex justify-between mb-1`}>
                                {/* ... UI ... */}
                            </div>
                        )
                    })}
                </div>

                <div className="p-4 rounded-lg bg-gray-800 h-[70vh] overflow-y-auto">
                    <h2 className="font-bold mb-2">Unreconciled Ledger Entries</h2>
                    {ledgerEntries.map(entry => {
                        const isSelected = selectedLedgerEntry?.id === entry.id;
                        const isMatched = entry.match_id;
                        const bgColor = isSelected ? 'bg-blue-600' : isMatched ? 'bg-teal-800/50' : 'bg-gray-700 hover:bg-gray-600';
                        return (
                             <div key={entry.id} onClick={() => !isMatched && setSelectedLedgerEntry(entry)} className={`p-2 rounded cursor-pointer ${bgColor} flex justify-between mb-1`}>
                                 {/* ... UI ... */}
                             </div>
                         )
                     })}
                </div>
            </div>
        </div>
    );
};
