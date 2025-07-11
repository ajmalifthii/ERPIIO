import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Quotation } from '../types';
import toast from 'react-hot-toast';
import { DataTable } from '../components/ui/DataTable';
import { FormCard } from '../components/ui/FormCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Edit, FileText as InvoiceIcon, Trash2 } from 'lucide-react';
import { QuotationForm } from '../components/forms/QuotationForm';
import { postTransaction } from '../lib/accountingService';
import { logActivity } from '../lib/activityLogger';

export const QuotationsPage = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quoteToEdit, setQuoteToEdit] = useState<Quotation | null>(null);

  const fetchQuotations = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('quotations').select(`*, contacts(name)`).order('created_at', { ascending: false });
    if (error) {
        toast.error("Failed to fetch quotations.");
        setError(error.message);
        console.error(error);
    } else {
        setQuotations(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleSave = () => {
    toast.success('Quotation saved successfully!');
    fetchQuotations();
    setQuoteToEdit(null);
  };
  
  const handleConvertToInvoice = async (quote: Quotation) => {
    if (quote.status !== 'Accepted') {
      toast.error("Only 'Accepted' quotations can be converted.");
      return;
    }
    
    const toastId = toast.loading('Converting to invoice...');
    try {
        const { data: newSale, error: saleError } = await supabase.from('sales_orders').insert({
            customer_id: quote.customer_id,
            amount: quote.amount,
            status: 'Pending',
            payment_mode: 'Invoice',
        }).select().single();

        if (saleError) throw saleError;

        const customer = (quote.contacts as any);
        const transactionId = await postTransaction(
            new Date().toISOString(),
            `Invoice from Quote #${(quote.id as string).substring(0,8)} for ${customer?.name}`,
            'Accounts Receivable', 'Sales Revenue', quote.amount
        );

        await supabase.from('sales_orders').update({ ledger_transaction_id: transactionId }).eq('id', newSale.id);
        await supabase.from('quotations').update({ status: 'Invoiced' }).eq('id', quote.id);
        
        logActivity('Converted Quotation to Invoice', { quoteId: quote.id, saleId: newSale.id });
        toast.success('Converted to Invoice!', { id: toastId });
        fetchQuotations();
    } catch(err: any) {
        toast.error(`Conversion failed: ${err.message}`, { id: toastId });
        setError(err.message);
    }
  };
  
  const handleDelete = async (quoteId: string) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
        const toastId = toast.loading('Deleting quotation...');
        const { error } = await supabase.from('quotations').delete().eq('id', quoteId);
        if (error) {
            toast.error(`Error: ${error.message}`, { id: toastId });
            setError(error.message);
        } else {
            toast.success('Quotation deleted.', { id: toastId });
            fetchQuotations();
        }
    }
  }

  return (
    <div className="space-y-4">
      <FormCard title={quoteToEdit ? "Edit Quotation" : "Create New Quotation"}>
        <QuotationForm onSave={handleSave} quoteToEdit={quoteToEdit} />
      </FormCard>
      <DataTable 
        title="All Quotations"
        columns={['ID', 'Customer', 'Amount', 'Status', 'Valid Until', 'Actions']}
        data={quotations.map(quote => [
          (quote.id as string).substring(0, 8),
          (quote.contacts as any)?.name || 'N/A',
          `LKR ${quote.amount.toFixed(2)}`,
          <StatusBadge status={quote.status} />,
          new Date(quote.valid_until).toLocaleDateString(),
          <div className="flex space-x-1">
             <button onClick={() => handleConvertToInvoice(quote)} title="Convert to Invoice" className="p-1 disabled:opacity-50" disabled={quote.status !== 'Accepted'}>
                <InvoiceIcon className="h-4 w-4 text-emerald-500" />
             </button>
             <button onClick={() => setQuoteToEdit(quote)} title="Edit" className="p-1"><Edit className="h-4 w-4" /></button>
             <button onClick={() => handleDelete(quote.id)} title="Delete" className="p-1"><Trash2 className="h-4 w-4 text-red-500" /></button>
          </div>
        ])}
        loading={loading}
        error={error}
      />
    </div>
  );
};