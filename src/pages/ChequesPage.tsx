import { useState, useEffect } from 'react';
import { Edit, Trash2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { DataTable } from '../components/ui/DataTable';
import { FormCard } from '../components/ui/FormCard';
import { ChequeForm } from '../components/forms/ChequeForm';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { supabase } from '../lib/supabaseClient';
import { Cheque } from '../types';
import { reverseTransaction, postTransaction } from '../lib/accountingService';
import { logActivity } from '../lib/activityLogger';
import toast from 'react-hot-toast';

export const ChequesPage = () => {
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chequeToEdit, setChequeToEdit] = useState<Cheque | null>(null);
  const [chequeToUpdate, setChequeToUpdate] = useState<Cheque | null>(null);

  const fetchCheques = async () => { /* ... same as before ... */ };
  useEffect(() => { fetchCheques(); }, []);
  
  const handleUpdateStatus = async (newStatus: 'Cleared' | 'Bounced') => {
    if (!chequeToUpdate) return;
    const toastId = toast.loading(`Updating cheque to ${newStatus}...`);

    try {
        // Business logic for status change
        if (newStatus === 'Cleared') {
            // For incoming cheques, debit bank and credit cheques receivable.
            // For outgoing, debit accounts payable and credit bank.
            const debitAccount = chequeToUpdate.type === 'Incoming' ? 'Bank' : 'Accounts Payable';
            const creditAccount = chequeToUpdate.type === 'Incoming' ? 'Cheques Receivable' : 'Bank';
            await postTransaction(new Date().toISOString(), `Cheque ${chequeToUpdate.number} Cleared`, debitAccount, creditAccount, chequeToUpdate.amount);
        } else if (newStatus === 'Bounced') {
             // Reverse the original transaction and create a new one for the bounce
            await reverseTransaction(chequeToUpdate.ledger_transaction_id, `Cheque ${chequeToUpdate.number} Bounced`);
            const debitAccount = chequeToUpdate.type === 'Incoming' ? 'Bounced Cheques' : 'Bank Charges'; // Or similar
            const creditAccount = chequeToUpdate.type === 'Incoming' ? 'Accounts Receivable' : 'Bank';
            await postTransaction(new Date().toISOString(), `Cheque ${chequeToUpdate.number} Bounced`, debitAccount, creditAccount, chequeToUpdate.amount);
        }
      
        // Update cheque status in DB
        const { error: updateError } = await supabase.from('cheques').update({ status: newStatus }).eq('id', chequeToUpdate.id);
        if (updateError) throw updateError;

        logActivity(`Updated Cheque Status`, { id: chequeToUpdate.id, status: newStatus });
        toast.success('Cheque status updated.', { id: toastId });
        fetchCheques();
    } catch (err: any) {
        toast.error(`Failed to update status: ${err.message}`, { id: toastId });
    } finally {
        setChequeToUpdate(null);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* ... FormCard and DataTable ... */}
        {/* Inside DataTable mapping */}
        <button onClick={() => setChequeToUpdate(cheque)} title="Update Status" className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-black/20">
            <CheckCircle className="h-4 w-4 text-green-500" />
        </button>
      </div>

      {chequeToUpdate && (
        <Modal isOpen={!!chequeToUpdate} onClose={() => setChequeToUpdate(null)} title="Update Cheque Status">
            <div className='p-4'>
                <p>Update status for Cheque #{chequeToUpdate.number} (LKR {chequeToUpdate.amount.toFixed(2)})?</p>
                <div className="flex justify-around mt-6">
                    <button onClick={() => handleUpdateStatus('Cleared')} className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        <CheckCircle />
                        <span>Mark as Cleared</span>
                    </button>
                    <button onClick={() => handleUpdateStatus('Bounced')} className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        <XCircle />
                        <span>Mark as Bounced</span>
                    </button>
                </div>
            </div>
        </Modal>
      )}
    </>
  );
};
