import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { commonClasses } from '../../lib/commonClasses';
import { SalesOrder, Contact } from '../../types';
import { logActivity } from '../../lib/activityLogger';
import { postTransaction, reverseTransaction } from '../../lib/accountingService';

interface SalesFormProps {
  onSave: () => void;
  orderToEdit: SalesOrder | null;
}

export const SalesForm = ({ onSave, orderToEdit }: SalesFormProps) => {
  const [customerId, setCustomerId] = useState('');
  const [material, setMaterial] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [price, setPrice] = useState<number | ''>('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      const { data } = await supabase.from('contacts').select('id, name').eq('type', 'Customer');
      setContacts(data || []);
    };
    fetchContacts();
  }, []);

  useEffect(() => {
    if (orderToEdit) {
      setCustomerId(orderToEdit.customer_id || '');
      setMaterial(orderToEdit.material);
      setQuantity(orderToEdit.qty);
      setPrice(orderToEdit.amount);
    } else {
      resetForm();
    }
  }, [orderToEdit]);

  const resetForm = () => {
    setCustomerId('');
    setMaterial('');
    setQuantity('');
    setPrice('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (price === '' || price <= 0) {
        setError("Price must be a positive number.");
        return;
    }
    setLoading(true);
    setError(null);

    const customer = contacts.find(c => c.id === customerId);
    if (!customer) {
        setError("Customer not found.");
        setLoading(false);
        return;
    }

    const orderData = {
      customer_id: customerId,
      material,
      qty: quantity === '' ? null : quantity,
      amount: price,
      status: 'Pending', 
    };

    try {
      if (orderToEdit) {
        // 1. Reverse the original ledger transaction
        await reverseTransaction(orderToEdit.ledger_transaction_id, `Edit of Sales Order ${orderToEdit.id}`);
      }

      // 2. Post the new transaction
      const newTransactionId = await postTransaction(
        new Date().toISOString(),
        `Sale to ${customer.name}`,
        'Accounts Receivable',
        'Sales Revenue',
        orderData.amount
      );
      
      const dataWithLedgerId = { ...orderData, ledger_transaction_id: newTransactionId };

      // 3. Upsert the sales order
      let response;
      if (orderToEdit) {
        response = await supabase.from('sales_orders').update(dataWithLedgerId).eq('id', orderToEdit.id);
        logActivity('Updated Sales Order', { id: orderToEdit.id });
      } else {
        response = await supabase.from('sales_orders').insert([dataWithLedgerId]);
        logActivity('Created Sales Order', { customer_id: orderData.customer_id });
      }

      if (response.error) throw response.error;
      
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <select 
          className={commonClasses.input} 
          value={customerId} 
          onChange={(e) => setCustomerId(e.target.value)}
          required
        >
          <option value="">Select Customer</option>
          {contacts.map(contact => (
            <option key={contact.id} value={contact.id}>{contact.name}</option>
          ))}
        </select>
        <input 
          type="text" 
          className={commonClasses.input} 
          placeholder="Material" 
          value={material} 
          onChange={(e) => setMaterial(e.target.value)} 
          required 
        />
        <input 
          type="number" 
          className={commonClasses.input} 
          placeholder="Quantity" 
          value={quantity} 
          onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))} 
          required 
        />
        <input 
          type="number" 
          className={commonClasses.input} 
          placeholder="Price" 
          value={price} 
          onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} 
          required 
        />
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" className={commonClasses.button} disabled={loading}>
          {loading ? 'Saving...' : (orderToEdit ? 'Update Order' : 'Create Order')}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </form>
  );
};
