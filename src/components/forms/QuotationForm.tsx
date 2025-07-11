import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { commonClasses } from '../../lib/commonClasses';
import { Quotation, Contact, InventoryItem } from '../../types';
import { PlusCircle, Trash2 } from 'lucide-react';

interface QuotationFormProps {
  onSave: () => void;
  quoteToEdit: Quotation | null;
}

interface LineItem {
  item_id: string;
  quantity: number;
  price: number;
}

export const QuotationForm = ({ onSave, quoteToEdit }: QuotationFormProps) => {
  const [customerId, setCustomerId] = useState('');
  const [status, setStatus] = useState('Draft');
  const [validUntil, setValidUntil] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([{ item_id: '', quantity: 1, price: 0 }]);
  
  const [customers, setCustomers] = useState<Contact[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: customerData } = await supabase.from('contacts').select('*').eq('type', 'Customer');
      setCustomers(customerData || []);
      const { data: inventoryData } = await supabase.from('inventory').select('*');
      setInventoryItems(inventoryData || []);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (quoteToEdit) {
      setCustomerId(quoteToEdit.customer_id || '');
      setStatus(quoteToEdit.status || 'Draft');
      setValidUntil(quoteToEdit.valid_until ? new Date(quoteToEdit.valid_until).toISOString().split('T')[0] : '');
      setLineItems(quoteToEdit.details || []);
    } else {
      resetForm();
    }
  }, [quoteToEdit]);

  const resetForm = () => {
    setCustomerId('');
    setStatus('Draft');
    setValidUntil('');
    setLineItems([{ item_id: '', quantity: 1, price: 0 }]);
  };

  const handleLineItemChange = (index: number, field: keyof LineItem, value: any) => {
    const updatedItems = [...lineItems];
    updatedItems[index][field] = value;

    // Auto-fill price if item is selected
    if (field === 'item_id') {
      const selectedItem = inventoryItems.find(i => i.id === value);
      updatedItems[index].price = selectedItem?.sale_price || 0;
    }

    setLineItems(updatedItems);
  };
  
  const addLineItem = () => setLineItems([...lineItems, { item_id: '', quantity: 1, price: 0 }]);
  const removeLineItem = (index: number) => setLineItems(lineItems.filter((_, i) => i !== index));

  const totalAmount = lineItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const quoteData = {
      customer_id: customerId,
      status,
      valid_until: validUntil,
      amount: totalAmount,
      details: lineItems,
    };

    try {
        let response;
        if(quoteToEdit) {
            response = await supabase.from('quotations').update(quoteData).eq('id', quoteToEdit.id);
        } else {
            response = await supabase.from('quotations').insert([quoteData]);
        }
        if (response.error) throw response.error;
        onSave();
        resetForm();
    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <select value={customerId} onChange={e => setCustomerId(e.target.value)} className={commonClasses.input} required>
          <option value="">Select Customer</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} className={commonClasses.input}>
          <option>Draft</option><option>Sent</option><option>Accepted</option><option>Expired</option>
        </select>
        <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className={commonClasses.input} />
      </div>

      {/* Line Items */}
      <div className="space-y-2">
        <h4 className="font-semibold">Line Items</h4>
        {lineItems.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-center">
            <select value={item.item_id} onChange={e => handleLineItemChange(index, 'item_id', e.target.value)} className={`${commonClasses.input} col-span-5`} required>
              <option value="">Select Item</option>
              {inventoryItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
            <input type="number" value={item.quantity} onChange={e => handleLineItemChange(index, 'quantity', Number(e.target.value))} className={`${commonClasses.input} col-span-2`} placeholder="Qty" />
            <input type="number" value={item.price} onChange={e => handleLineItemChange(index, 'price', Number(e.target.value))} className={`${commonClasses.input} col-span-2`} placeholder="Price" />
            <div className="col-span-2">LKR {(item.quantity * item.price).toFixed(2)}</div>
            <button type="button" onClick={() => removeLineItem(index)} className="text-red-500 hover:text-red-400"><Trash2 size={20}/></button>
          </div>
        ))}
        <button type="button" onClick={addLineItem} className="flex items-center space-x-2 text-teal-400 hover:text-teal-300"><PlusCircle size={20}/><span>Add Item</span></button>
      </div>
      
      <div className="font-bold text-xl text-right">Total: LKR {totalAmount.toFixed(2)}</div>

      <div className="flex justify-end pt-2">
        <button type="submit" className={commonClasses.button} disabled={loading}>{loading ? 'Saving...' : 'Save Quotation'}</button>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </form>
  );
};
