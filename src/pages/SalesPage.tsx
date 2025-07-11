import { useState, useEffect } from 'react';
import { Download, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { DataTable } from '../components/ui/DataTable';
import { FormCard } from '../components/ui/FormCard';
import { SalesForm } from '../components/forms/SalesForm';
import { StatusBadge } from '../components/ui/StatusBadge';
import { supabase } from '../lib/supabaseClient';
import { SalesOrder } from '../types';
import { reverseTransaction } from '../lib/accountingService';
import { logActivity } from '../lib/activityLogger';

export const SalesPage = () => {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderToEdit, setOrderToEdit] = useState<SalesOrder | null>(null);

  const fetchSalesOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
        .from('sales_orders')
        .select(`
          id, customer_id, material, qty, amount, status, ledger_transaction_id,
          contacts (name)
        `);

    if (error) {
        toast.error("Failed to fetch sales orders.");
        setError(error.message);
        console.error(error);
    } else {
        const formattedData = data.map(order => ({ ...order, customer: (order.contacts as any).name }));
        setSalesOrders(formattedData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSalesOrders();
  }, []);

  const handleEdit = (order: SalesOrder) => {
    setOrderToEdit(order);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDelete = async (order: SalesOrder) => {
    if (window.confirm('Are you sure you want to delete this sales order? This will also reverse the accounting entries.')) {
      const toastId = toast.loading('Deleting sales order...');
      try {
        await reverseTransaction(order.ledger_transaction_id, `Deletion of Sales Order ${order.id}`);
        const { error: deleteError } = await supabase.from('sales_orders').delete().eq('id', order.id);
        if (deleteError) throw deleteError;
        
        logActivity('Deleted Sales Order', { id: order.id });
        toast.success('Sales order deleted.', { id: toastId });
        fetchSalesOrders();
      } catch (error: any) {
        toast.error(`Error: ${error.message}`, { id: toastId });
        setError(error.message);
      }
    }
  };

  const handleSave = () => {
    toast.success('Sales order saved successfully!');
    fetchSalesOrders();
    setOrderToEdit(null);
  };

  return (
    <div className="space-y-4">
      <FormCard title={orderToEdit ? "Edit Sales Order" : "Create New Sales Order"}>
        <SalesForm onSave={handleSave} orderToEdit={orderToEdit} />
      </FormCard>
      <DataTable 
        title="All Sales Orders"
        columns={['ID', 'Customer', 'Material', 'Qty', 'Amount', 'Status', 'Actions']}
        data={(salesOrders || []).map(order => [
          order.id.substring(0,8),
          order.customer,
          order.material,
          order.qty,
          `LKR ${order.amount.toFixed(2)}`,
          <StatusBadge status={order.status} />,
          <div className="flex space-x-1">
             <button className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-black/20"><Download className="h-4 w-4" /></button>
             <button onClick={() => handleEdit(order)} className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-black/20"><Edit className="h-4 w-4" /></button>
             <button onClick={() => handleDelete(order)} className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-black/20"><Trash2 className="h-4 w-4 text-red-500" /></button>
          </div>
        ])}
        loading={loading}
        error={error}
      />
    </div>
  );
};