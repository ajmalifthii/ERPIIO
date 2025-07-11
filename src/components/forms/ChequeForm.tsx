import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { commonClasses } from '../../lib/commonClasses';
import { Cheque, Contact } from '../../types';
import { logActivity } from '../../lib/activityLogger';
import { postTransaction, reverseTransaction } from '../../lib/accountingService';
import { SL_BANKS } from '../../lib/constants'; // Import from constants

interface ChequeFormProps {
  onSave: () => void;
  chequeToEdit: Cheque | null;
}

export const ChequeForm = ({ onSave, chequeToEdit }: ChequeFormProps) => {
  const [number, setNumber] = useState('');
  const [contactId, setContactId] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [dueDate, setDueDate] = useState('');
  const [bank, setBank] = useState('');
  const [type, setType] = useState('Incoming');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      const { data } = await supabase.from('contacts').select('id, name');
      setContacts(data || []);
    };
    fetchContacts();
  }, []);

  useEffect(() => {
    if (chequeToEdit) {
      setNumber(chequeToEdit.number);
      setContactId(chequeToEdit.contact_id || '');
      setAmount(chequeToEdit.amount);
      setDueDate(chequeToEdit.due_date);
      setBank(chequeToEdit.bank);
      setType(chequeToEdit.type);
    } else {
      resetForm();
    }
  }, [chequeToEdit]);

  const resetForm = () => {
    setNumber('');
    setContactId('');
    setAmount('');
    setDueDate('');
    setBank('');
    setType('Incoming');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount === '' || amount <= 0) {
        setError("Amount must be a positive number.");
        return;
    }
    setLoading(true);
    setError(null);

    const client = contacts.find(c => c.id === contactId);
    if (!client) {
      setError("Client/Vendor not found.");
      setLoading(false);
      return;
    }

    const chequeData = {
      number,
      contact_id: contactId,
      amount: amount,
      due_date: dueDate,
      bank,
      type,
      status: 'Pending',
    };

    try {
      if (chequeToEdit) {
        await reverseTransaction(chequeToEdit.ledger_transaction_id, `Edit of Cheque ${chequeToEdit.id}`);
      }
      
      let debitAccount, creditAccount, description;
      if(type === 'Incoming') {
          debitAccount = 'Cheques Receivable';
          creditAccount = 'Accounts Receivable';
          description = `Received cheque ${chequeData.number} from ${client.name}`;
      } else {
          debitAccount = 'Accounts Payable';
          creditAccount = 'Cheques Payable';
          description = `Issued cheque ${chequeData.number} to ${client.name}`;
      }
      
      const newTransactionId = await postTransaction(
          new Date().toISOString(),
          description,
          debitAccount,
          creditAccount,
          chequeData.amount
      );
      
      const dataWithLedgerId = { ...chequeData, ledger_transaction_id: newTransactionId };

      if (chequeToEdit) {
        await supabase.from('cheques').update(dataWithLedgerId).eq('id', chequeToEdit.id);
        logActivity('Updated Cheque', { id: chequeToEdit.id });
      } else {
        await supabase.from('cheques').insert([dataWithLedgerId]);
        logActivity('Created Cheque', { number: chequeData.number });
      }
      
      onSave();
      resetForm();

    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <input 
          type="text" 
          className={commonClasses.input} 
          placeholder="Cheque Number" 
          value={number} 
          onChange={(e) => setNumber(e.target.value)} 
          required 
        />
        <select 
          className={commonClasses.input} 
          value={contactId} 
          onChange={(e) => setContactId(e.target.value)}
          required
        >
          <option value="">Select Client/Vendor</option>
          {contacts.map(contact => (
            <option key={contact.id} value={contact.id}>{contact.name}</option>
          ))}
        </select>
        <input 
          type="number" 
          className={commonClasses.input} 
          placeholder="Amount" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))} 
          required 
        />
        <input 
          type="date" 
          className={commonClasses.input} 
          placeholder="Due Date" 
          value={dueDate} 
          onChange={(e) => setDueDate(e.target.value)} 
          required
        />
        <select 
          className={commonClasses.input} 
          value={bank} 
          onChange={(e) => setBank(e.target.value)}
          required
        >
          <option value="">Select Bank</option>
          {SL_BANKS.map(bankName => (
            <option key={bankName} value={bankName}>{bankName}</option>
          ))}
        </select>
        <select 
          className={commonClasses.input} 
          value={type} 
          onChange={(e) => setType(e.target.value)}
        >
          <option>Incoming</option>
          <option>Outgoing</option>
        </select>
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" className={commonClasses.button} disabled={loading}>
          {loading ? 'Saving...' : (chequeToEdit ? 'Update Cheque' : 'Add Cheque')}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </form>
  );
};
