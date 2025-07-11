import { DataTable } from '../components/ui/DataTable';
import { FormCard } from '../components/ui/FormCard';
import { commonClasses } from '../lib/commonClasses';

export const DiscountsPage = () => {
  const discounts = [
    { id: 'DSC-001', name: 'New Year Sale', type: '%', value: '10', material: 'All', status: 'Active' },
    { id: 'DSC-002', name: 'Bulk Purchase', type: 'Amount', value: '50', material: 'Premium Leather', status: 'Active' },
    { id: 'DSC-003', name: 'Clearance', type: 'Price/sq.ft.', value: '8', material: 'Damaged Leather', status: 'Inactive' },
  ];

  return (
    <div className="space-y-4">
      <FormCard title="Create New Discount">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <input type="text" className={commonClasses.input} placeholder="Discount Name" />
          <select className={commonClasses.input}>
            <option>Percentage (%)</option>
            <option>Fixed Amount</option>
            <option>New Price/sq.ft.</option>
          </select>
          <input type="number" className={commonClasses.input} placeholder="Value" />
          <input type="text" className={commonClasses.input} placeholder="Applicable Material (or 'All')" />
        </div>
        <div className="flex justify-end pt-2">
          <button className={commonClasses.button}>Save Discount</button>
        </div>
      </FormCard>
      <DataTable 
        title="Discount Rules"
        columns={['ID', 'Name', 'Type', 'Value', 'Material', 'Status']}
        data={discounts.map(d => [d.id, d.name, d.type, d.value, d.material, d.status])}
      />
    </div>
  );
};
