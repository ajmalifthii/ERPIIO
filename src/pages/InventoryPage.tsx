import { useState, useEffect } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { DataTable } from '../components/ui/DataTable';
import { FormCard } from '../components/ui/FormCard';
import { InventoryForm } from '../components/forms/InventoryForm';
import { StatusBadge } from '../components/ui/StatusBadge';
import { supabase } from '../lib/supabaseClient';
import { InventoryItem } from '../types';
import toast from 'react-hot-toast';

export const InventoryPage = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);

  const fetchInventory = async () => { /* ... same as before ... */ };
  useEffect(() => { fetchInventory(); }, []);
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const toastId = toast.loading('Deleting item...');
      try {
        const { error, data } = await supabase.functions.invoke('delete-inventory-item-with-relations', {
            body: { itemId: id },
        });

        if (error) throw new Error(error.message);
        if (data.error) throw new Error(data.error);

        toast.success('Item deleted successfully.', { id: toastId });
        fetchInventory();
      } catch (err: any) {
        toast.error(`Error: ${err.message}`, { id: toastId });
      }
    }
  };

  // ... rest of the component

  const columns = [
    { accessor: 'name', Header: 'Name' },
    { accessor: 'quantity', Header: 'Quantity' },
    { accessor: 'purchase_price', Header: 'Purchase Price' },
    { accessor: 'sale_price', Header: 'Sale Price' },
    { accessor: 'status', Header: 'Status', Cell: ({ value }: { value: string }) => <StatusBadge status={value} /> },
    {
      id: 'actions',
      Header: 'Actions',
      Cell: ({ row }: any) => (
        <div className="flex space-x-2">
          <button onClick={() => setItemToEdit(row.original)} className="text-blue-500 hover:text-blue-700">
            <Edit size={18} />
          </button>
          <button onClick={() => handleDelete(row.original.id)} className="text-red-500 hover:text-red-700">
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <div className="p-4">Loading inventory...</div>;
  if (error) return <div className="p-4 text-red-500">Error loading inventory: {error}</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Inventory Management</h1>

      <FormCard title={itemToEdit ? "Edit Item" : "Add New Item"} onClear={() => setItemToEdit(null)}>
        <InventoryForm
          itemToEdit={itemToEdit}
          onSuccess={() => {
            fetchInventory();
            setItemToEdit(null);
          }}
        />
      </FormCard>

      <DataTable
        columns={columns}
        data={inventory}
        filterGlobal={true}
        filterPlaceholder="Search inventory..."
      />
    </div>
  );
};
