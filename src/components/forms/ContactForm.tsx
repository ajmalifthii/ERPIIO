import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { commonClasses } from '../../lib/commonClasses';
import { Contact } from '../../types';
import { logActivity } from '../../lib/activityLogger';

interface ContactFormProps {
  onSave: () => void;
  contactToEdit: Contact | null;
}

export const ContactForm = ({ onSave, contactToEdit }: ContactFormProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('Customer');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [creditLimit, setCreditLimit] = useState<number | ''>('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (contactToEdit) {
      setName(contactToEdit.name);
      setType(contactToEdit.type);
      setEmail(contactToEdit.email || '');
      setPhone(contactToEdit.phone || '');
      setCreditLimit(contactToEdit.creditLimit || '');
      setPaymentTerms(contactToEdit.paymentTerms || '');
    } else {
      resetForm();
    }
  }, [contactToEdit]);

  const resetForm = () => {
    setName('');
    setType('Customer');
    setEmail('');
    setPhone('');
    setCreditLimit('');
    setPaymentTerms('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const contactData = {
      name,
      type,
      email,
      phone,
      credit_limit: creditLimit === '' ? null : creditLimit,
      payment_terms: paymentTerms,
    };

    try {
      let response;
      if (contactToEdit) {
        response = await supabase.from('contacts').update(contactData).eq('id', contactToEdit.id);
        logActivity('Updated Contact', { id: contactToEdit.id, name: contactData.name });
      } else {
        response = await supabase.from('contacts').insert([contactData]).select();
        logActivity('Created Contact', { name: contactData.name });
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
        <input 
          type="text" 
          className={commonClasses.input} 
          placeholder="Contact Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
        <select 
          className={commonClasses.input} 
          value={type} 
          onChange={(e) => setType(e.target.value)}
        >
          <option>Customer</option>
          <option>Vendor</option>
        </select>
        <input 
          type="email" 
          className={commonClasses.input} 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="tel" 
          className={commonClasses.input} 
          placeholder="Phone" 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)} 
        />
        <input 
          type="number" 
          className={commonClasses.input} 
          placeholder="Credit Limit" 
          value={creditLimit} 
          onChange={(e) => setCreditLimit(e.target.value === '' ? '' : Number(e.target.value))} 
        />
        <input 
          type="text" 
          className={commonClasses.input} 
          placeholder="Payment Terms" 
          value={paymentTerms} 
          onChange={(e) => setPaymentTerms(e.target.value)} 
        />
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" className={commonClasses.button} disabled={loading}>
          {loading ? 'Saving...' : (contactToEdit ? 'Update Contact' : 'Save Contact')}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </form>
  );
};
