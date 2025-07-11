export interface UserProfile {
    id: string;
    email: string;
    role: 'Admin' | 'Accountant' | 'Sales' | 'Inventory';
    last_sign_in_at?: string;
}

export interface Contact {
    id: string;
    name: string;
    type: 'Customer' | 'Supplier' | 'Other';
    email: string;
    phone: string;
    address: string;
    balance: number;
}

export interface InventoryItem {
    id: string;
    name: string;
    type: 'Leather' | 'Accessory';
    pieces?: number;
    sqft?: number;
    units?: number;
    cost?: number;
    sale_price?: number;
    status: 'In Stock' | 'Low Stock' | 'Out of Stock';
    supplier_id: string;
    supplier?: string; // Optional because it's joined
}

export interface Purchase {
    id: string;
    supplier_id: string;
    material_id: string;
    quantity: number;
    cost: number;
    payment_type: 'Cash' | 'Credit';
    date: string;
    status: 'Received' | 'Pending';
    ledger_transaction_id: string;
    supplier?: string; // Joined
    material?: string; // Joined
}

export interface SalesOrder {
    id: string;
    customer_id: string;
    material: string;
    qty: number;
    amount: number;
    status: 'Delivered' | 'Pending' | 'Cancelled';
    payment_mode: 'Cash' | 'Credit' | 'Invoice';
    ledger_transaction_id: string;
    customer?: string; // Joined
}

export interface Cheque {
    id: string;
    number: string;
    contact_id: string;
    amount: number;
    due_date: string;
    bank: string;
    status: 'Pending' | 'Cleared' | 'Bounced';
    type: 'Incoming' | 'Outgoing';
    ledger_transaction_id: string;
    client?: string; // Joined
}

export interface Quotation {
    id: string;
    customer_id: string;
    amount: number;
    status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Invoiced';
    valid_until: string;
    details: any; // Or a more specific type for quote details
    contacts?: { name: string }; // For joined data
}

export interface LedgerEntry {
    id:string;
    date: string;
    account_id: string;
    description: string;
    amount: number;
    type: 'debit' | 'credit';
    transaction_id: string;
    is_reconciled: boolean;
    created_at?: string;
}

export interface BankAccount {
    id: string;
    bank_name: string;
    account_number: string;
    account_type: string;
    starting_balance: number;
    current_balance: number;
    ledger_account_id?: string;
    ledger_account?: { name: string };
}

export interface RecurringExpense {
    id: string;
    description: string;
    amount: number;
    frequency: 'Monthly' | 'Weekly' | 'Yearly';
    next_due_date: string;
    is_active: boolean;
    debit_account: string;
    credit_account: string;
    last_posted_date?: string;
    created_at?: string;
}

export interface Document {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  related_to_type?: 'Purchase' | 'Sale' | 'Contact';
  related_to_id?: string;
}
