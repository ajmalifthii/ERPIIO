import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { commonClasses } from '../../lib/commonClasses';
import { Purchase, Contact, InventoryItem } from '../../types';
import { logActivity } from '../../lib/activityLogger';
import { postTransaction, reverseTransaction } from '../../lib/accountingService';

interface PurchaseFormProps {
  onSave: () => void;
  purchaseToEdit: Purchase | null;
}

export const PurchaseForm = ({ onSave, purchaseToEdit }: PurchaseFormProps) => {
  const [supplierId, setSupplierId] = useState('');
  const [itemId, setItemId] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [cost, setCost] = useState<number | ''>('');
  const [paymentType, setPaymentType] = useState('Cash');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [suppliers, setSuppliers] = useState<Contact[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: supplierData } = await supabase.from('contacts').select('id, name').eq('type', 'Vendor');
      setSuppliers(supplierData || []);
      const { data: itemData } = await supabase.from('inventory').select('id, name');
      setInventoryItems(itemData || []);
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (purchaseToEdit) {
      setSupplierId(purchaseToEdit.supplier_id || '');
      setItemId(purchaseToEdit.item_id || '');
      setQuantity(purchaseToEdit.quantity || '');
      setCost(purchaseToEdit.cost || '');
      setPaymentType(purchaseToEdit.payment_type || 'Cash');
      setPurchaseDate(purchaseToEdit.date ? new Date(purchaseToEdit.date).toISOString().split('T')[0] : '');
    } else {
      resetForm();
    }
  }, [purchaseToEdit]);

  const resetForm = () => {
    setSupplierId('');
    setItemId('');
    setQuantity('');
    setCost('');
    setPaymentType('Cash');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cost === '' || cost <= 0) {
        setError("Cost must be a positive number.");
        return;
    }
    setLoading(true);
    setError(null);

    const supplier = suppliers.find(s => s.id === supplierId);
    const item = inventoryItems.find(i => i.id === itemId);
    if (!supplier || !item) {
        setError("Supplier or Item not found.");
        setLoading(false);
        return;
    }

    const purchaseData = {
      supplier_id: supplierId,
      item_id: itemId,
      quantity: quantity === '' ? null : quantity,
      cost: cost,
      payment_type: paymentType,
      date: purchaseDate,
      status: 'Received'
    };

    try {
      if (purchaseToEdit) {
        await reverseTransaction(purchaseToEdit.ledger_transaction_id, `Edit of Purchase ${purchaseToEdit.id}`);
      }

      const creditAccount = paymentType === 'Cash' ? 'Cash' : 'Accounts Payable';
      const newTransactionId = await postTransaction(
          purchaseData.date,
          `Purchase of ${item.name} from ${supplier.name}`,
          'Inventory',
          creditAccount,
          purchaseData.cost
      );

      const dataWithLedgerId = { ...purchaseData, ledger_transaction_id: newTransactionId };

      if (purchaseToEdit) {
        await supabase.from('purchases').update(dataWithLedgerId).eq('id', purchaseToEdit.id);
        logActivity('Updated Purchase', { id: purchaseToEdit.id });
      } else {
        await supabase.from('purchases').insert([dataWithLedgerId]);
        logActivity('Created Purchase', { item_id: purchaseData.item_id });
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
        <select className={commonClasses.input} value={supplierId} onChange={(e) => setSupplierId(e.target.value)} required>
          <option value="">Select Supplier</option>
          {suppliers.map(supplier => (
            <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
          ))}
        </select>
        <select className={commonClasses.input} value={itemId} onChange={(e) => setItemId(e.target.value)} required>
          <option value="">Select Item</option>
          {inventoryItems.map(item => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <input type="number" className={commonClasses.input} placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))} required />
        <input type="number" className={commonClasses.input} placeholder="Total Cost" value={cost} onChange={(e) => setCost(e.target.value === '' ? '' : Number(e.target.value))} required />
        <select className={commonClasses.input} value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
          <option>Cash</option>
          <option>Cheque</option>
        </select>
        <input type="date" className={commonClasses.input} placeholder="Purchase Date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} required />
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" className={commonClasses.button} disabled={loading}>
          {loading ? 'Saving...' : (purchaseToEdit ? 'Update Purchase' : 'Record Purchase')}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </form>
  );
};
