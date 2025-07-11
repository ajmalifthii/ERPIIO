import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { commonClasses } from '../../lib/commonClasses';
import { InventoryItem, Contact } from '../../types';
import { logActivity } from '../../lib/activityLogger';

interface InventoryFormProps {
  onSave: () => void;
  itemToEdit: InventoryItem | null;
}

export const InventoryForm = ({ onSave, itemToEdit }: InventoryFormProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('Leather');
  const [pieces, setPieces] = useState<number | ''>('');
  const [sqft, setSqft] = useState<number | ''>('');
  const [units, setUnits] = useState<number | ''>('');
  const [cost, setCost] = useState<number | ''>('');
  const [salePrice, setSalePrice] = useState<number | ''>('');
  const [supplierId, setSupplierId] = useState('');
  const [suppliers, setSuppliers] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuppliers = async () => {
      const { data } = await supabase.from('contacts').select('id, name').eq('type', 'Vendor');
      setSuppliers(data || []);
    };
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setType(itemToEdit.type);
      setPieces(itemToEdit.pieces || '');
      setSqft(itemToEdit.sqft || '');
      setUnits(itemToEdit.units || '');
      setCost(itemToEdit.cost || '');
      setSalePrice(itemToEdit.sale_price || '');
      setSupplierId(itemToEdit.supplier_id || '');
    } else {
      resetForm();
    }
  }, [itemToEdit]);

  const resetForm = () => {
    setName('');
    setType('Leather');
    setPieces('');
    setSqft('');
    setUnits('');
    setCost('');
    setSalePrice('');
    setSupplierId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const itemData = {
      name,
      type,
      pieces: type === 'Leather' ? (pieces === '' ? null : pieces) : null,
      sqft: type === 'Leather' ? (sqft === '' ? null : sqft) : null,
      units: type !== 'Leather' ? (units === '' ? null : units) : null,
      cost: cost === '' ? null : cost,
      sale_price: salePrice === '' ? null : salePrice,
      supplier_id: supplierId,
      status: 'Available' // Default status
    };

    try {
      let response;
      if (itemToEdit) {
        response = await supabase.from('inventory').update(itemData).eq('id', itemToEdit.id);
        logActivity('Updated Inventory Item', { id: itemToEdit.id, name: itemData.name });
      } else {
        response = await supabase.from('inventory').insert([itemData]).select();
        logActivity('Created Inventory Item', { name: itemData.name });
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <input type="text" className={commonClasses.input} placeholder="Item Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <select className={commonClasses.input} value={type} onChange={(e) => setType(e.target.value)}>
          <option>Leather</option>
          <option>Adhesive</option>
          <option>Tool</option>
          <option>Other</option>
        </select>
        <select className={commonClasses.input} value={supplierId} onChange={(e) => setSupplierId(e.target.value)} required>
          <option value="">Select Supplier</option>
          {suppliers.map(supplier => (
            <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
          ))}
        </select>

        {type === 'Leather' ? (
          <>
            <input type="number" className={commonClasses.input} placeholder="Pieces" value={pieces} onChange={(e) => setPieces(e.target.value === '' ? '' : Number(e.target.value))} />
            <input type="number" className={commonClasses.input} placeholder="Square Feet" value={sqft} onChange={(e) => setSqft(e.target.value === '' ? '' : Number(e.target.value))} required />
          </>
        ) : (
          <input type="number" className={commonClasses.input} placeholder="Units" value={units} onChange={(e) => setUnits(e.target.value === '' ? '' : Number(e.target.value))} required />
        )}
        
        <input type="number" className={commonClasses.input} placeholder="Cost" value={cost} onChange={(e) => setCost(e.target.value === '' ? '' : Number(e.target.value))} required />
        <input type="number" className={commonClasses.input} placeholder="Sale Price" value={salePrice} onChange={(e) => setSalePrice(e.target.value === '' ? '' : Number(e.target.value))} required />
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" className={commonClasses.button} disabled={loading}>
          {loading ? 'Saving...' : (itemToEdit ? 'Update Item' : 'Add to Inventory')}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </form>
  );
};
