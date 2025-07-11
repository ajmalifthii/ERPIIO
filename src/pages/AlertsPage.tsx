import { DataTable } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';

export const AlertsPage = () => {
  const alerts = [
    { id: 'ALERT-001', type: 'Cheque Due', message: "Cheque #123456 from Acme Corp due on 2025-02-15", priority: 'High' },
    { id: 'ALERT-002', type: 'Low Stock', message: "Premium Leather is low in stock (10 pieces remaining)", priority: 'Medium' },
    { id: 'ALERT-003', type: 'Payment Reminder', message: "John Doe has an outstanding balance of €250", priority: 'Low' },
  ];

  return (
    <div className="space-y-4">
      <DataTable 
        title="Active Alerts"
        columns={['ID', 'Type', 'Message', 'Priority']}
        data={alerts.map(a => [a.id, a.type, a.message, <StatusBadge status={a.priority} />])}
      />
    </div>
  );
};
