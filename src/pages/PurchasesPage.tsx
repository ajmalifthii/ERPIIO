import { useState, useEffect } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { DataTable } from '../components/ui/DataTable';
import { FormCard } from '../components/ui/FormCard';
import { PurchaseForm } from '../components/forms/PurchaseForm';
import { StatusBadge } from '../components/ui/StatusBadge';
import { supabase } from '../lib/supabaseClient';
import { Purchase } from '../types';
import { reverseTransaction } from '../lib/accountingService';
import { logActivity } from '../lib/activityLogger';

export const PurchasesPage = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseToEdit, setPurchaseToEdit] = useState<Purchase | null>(null);

  const fetchPurchases = async () => {
    setLoading(true);
    const { data, error } = await supabase
        .from('purchases')
        .select(`*, contacts (name), inventory (name, type)`);

    if (error) {
        toast.error("Failed to fetch purchases.");
        setError(error.message);
        console.error(error);
    } else {
        const formattedData = data.map(p => ({
            ...p,
            supplier: (p.contacts as any).name,
            material: (p.inventory as any).name,
            item_type: (p.inventory as any).type
        }));
        setPurchases(formattedData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const handleEdit = (purchase: Purchase) => {
    setPurchaseToEdit(purchase);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDelete = async (purchase: Purchase) => {
    if (window.confirm('Are you sure you want to delete this purchase record?')) {
      const toastId = toast.loading('Deleting purchase...');
      try {
        await reverseTransaction(purchase.ledger_transaction_id, `Deletion of Purchase ${purchase.id}`);
        await supabase.from('purchases').delete().eq('id', purchase.id);
        logActivity('Deleted Purchase', { id: purchase.id });
        toast.success('Purchase record deleted.', { id: toastId });
        fetchPurchases();
      } catch (error: any) {
        toast.error(`Error: ${error.message}`, { id: toastId });
        setError(error.message);
      }
    }
  };

  const handleSave = () => {
    toast.success('Purchase record saved successfully!');
    fetchPurchases();
    setPurchaseToEdit(null);
  };
  
  const formatQuantity = (purchase: Purchase) => {
    return `${purchase.quantity} ${(purchase as any).item_type === 'Leather' ? 'sqft' : 'units'}`;
  }

  return (
    <div className="space-y-4">
      <FormCard title={purchaseToEdit ? "Edit Purchase" : "Record New Purchase"}>
        <PurchaseForm onSave={handleSave} purchaseToEdit={purchaseToEdit} />
      </FormCard>
      <DataTable 
        title="Purchase History"
        columns={['ID', 'Supplier', 'Item', 'Quantity', 'Cost', 'Payment Type', 'Date', 'Status', 'Actions']}
        data={(purchases || []).map(purchase => [
          (purchase.id as string).substring(0,8),
          purchase.supplier,
          purchase.material,
          formatQuantity(purchase),
          `LKR ${purchase.cost.toFixed(2)}`,
          purchase.payment_type,
          new Date(purchase.date).toLocaleDateString(),
          <StatusBadge status={purchase.status} />,
          <div className="flex space-x-1">
             <button onClick={() => handleEdit(purchase)} className="p-1"><Edit className="h-4 w-4" /></button>
             <button onClick={() => handleDelete(purchase)} className="p-1"><Trash2 className="h-4 w-4 text-red-500" /></button>
          </div>
        ])}
        loading={loading}
        error={error}
      />
    </div>
  );
};