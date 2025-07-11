import { SalesOrder, Cheque, InventoryItem, Contact, Purchase, User, Document } from '../types';

// All monetary values are in Sri Lankan Rupees (LKR)

export const salesOrders: SalesOrder[] = [
  { id: 'SO-001', customer: 'John Doe', material: 'Premium Leather', qty: '150 sq.ft.', amount: 450000, status: 'Paid', paymentMode: 'Cash + Cheque', date: '2025-01-15' },
  { id: 'SO-002', customer: 'Jane Smith', material: 'Cutting Tool', qty: '2 units', amount: 36000, status: 'Partial', paymentMode: 'Credit', date: '2025-01-14' },
  { id: 'SO-003', customer: 'Mike Johnson', material: 'Leather Glue', qty: '10 units', amount: 24000, status: 'Pending', paymentMode: 'Cheque', date: '2025-01-13' },
];

export const cheques: Cheque[] = [
  { id: 'CHQ-001', number: '123456', client: 'Acme Corp', amount: 150000, dueDate: '2025-02-15', bank: 'Bank of Ceylon', status: 'Upcoming', type: 'Incoming' },
  { id: 'CHQ-002', number: '789012', client: 'Globex Inc', amount: 75000, dueDate: '2025-01-20', bank: 'Sampath Bank', status: 'Overdue', type: 'Incoming' },
  { id: 'CHQ-003', number: '456789', client: 'Tech Solutions', amount: 225000, dueDate: '2025-02-10', bank: 'Commercial Bank', status: 'Upcoming', type: 'Outgoing' },
];

export const inventory: InventoryItem[] = [
  { id: 'INV-001', name: 'Premium Leather', type: 'Leather', pieces: 50, sqft: 1000, costPerSqft: 3000, salePerSqft: 4500, status: 'Available', supplier: 'Leather Co.' },
  { id: 'INV-002', name: 'Leather Glue', type: 'Adhesive', pieces: 50, units: 50, costPerUnit: 1500, salePerUnit: 2400, status: 'Available', supplier: 'Adhesive Inc.' },
  { id: 'INV-003', name: 'Damaged Leather', type: 'Leather', pieces: 3, sqft: 15, costPerSqft: 0, salePerSqft: 0, status: 'Damaged', supplier: 'Leather Co.' },
];

export const customers: Contact[] = [
  { id: 'CUST-001', name: 'John Doe', type: 'Customer', email: 'john@example.com', phone: '+94123456789', balance: 75000, creditLimit: 1500000, paymentTerms: 'Net 30' },
  { id: 'VEND-001', name: 'Leather Co.', type: 'Vendor', email: 'sales@leatherco.com', phone: '+94123456780', balance: -150000, creditLimit: 0, paymentTerms: 'Due on Receipt' },
];

export const purchases: Purchase[] = [
  { id: 'PO-001', supplier: 'Leather Co.', material: 'Cowhide', quantity: '200 sq.ft.', cost: 600000, paymentType: 'Cheque', date: '2025-01-10', status: 'Received' },
  { id: 'PO-002', supplier: 'Tool Supply', material: 'Stitching Awl', quantity: '5 units', cost: 22500, paymentType: 'Cash', date: '2025-01-08', status: 'Received' },
];

export const users: User[] = [
  { id: 'USER-001', name: 'Admin User', email: 'admin@company.com', role: 'Admin', lastActivity: '2025-01-15', status: 'Active', modules: ['All'] },
  { id: 'USER-002', name: 'Sales Rep', email: 'sales@company.com', role: 'Sales', lastActivity: '2025-01-14', status: 'Active', modules: ['Sales', 'Customers', 'Inventory'] },
];

export const documents: Document[] = [
  { id: 'DOC-001', name: 'Cheque_ABC123.pdf', type: 'Scanned Cheque', relatedTo: 'Invoice SO-001', uploadDate: '2025-01-10', size: '2.3 MB' },
  { id: 'DOC-002', name: 'Supplier_Receipt_XYZ.jpg', type: 'Receipt', relatedTo: 'Purchase PO-001', uploadDate: '2025-01-08', size: '1.8 MB' },
];
