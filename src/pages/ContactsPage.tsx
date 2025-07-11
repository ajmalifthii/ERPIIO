import { useState, useEffect } from 'react';
import { Edit, Eye, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { DataTable } from '../components/ui/DataTable';
import { FormCard } from '../components/ui/FormCard';
import { Modal } from '../components/ui/Modal';
import { ContactForm } from '../components/forms/ContactForm';
import { supabase } from '../lib/supabaseClient';
import { Contact, SalesOrder, Cheque } from '../types';

export const ContactsPage = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
  const [contactSales, setContactSales] = useState<SalesOrder[]>([]);
  const [contactCheques, setContactCheques] = useState<Cheque[]>([]);

  const fetchContacts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('contacts').select('*');
    if (error) {
        toast.error("Failed to fetch contacts.");
        setError(error.message);
        console.error(error);
    } else {
        setContacts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleViewDetails = async (contact: Contact) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
    // ... logic to fetch related data
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedContact(null);
  };

  const handleEdit = (contact: Contact) => {
    setContactToEdit(contact);
    // Scroll to the top to make the form visible
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDelete = async (contact: Contact) => {
    if (window.confirm(`Are you sure you want to delete ${contact.name}?`)) {
      const toastId = toast.loading('Deleting contact...');
      try {
        const { error } = await supabase.from('contacts').delete().eq('id', contact.id);
        if (error) throw error;
        toast.success('Contact deleted successfully.', { id: toastId });
        fetchContacts();
      } catch (error: any) {
        toast.error(`Error: ${error.message}`, { id: toastId });
        setError(error.message);
      }
    }
  };

  const handleSave = () => {
    toast.success('Contact saved successfully!');
    fetchContacts();
    setContactToEdit(null);
  };

  return (
    <>
      <div className="space-y-4">
        <FormCard title={contactToEdit ? "Edit Contact" : "Add New Contact"}>
          <ContactForm onSave={handleSave} contactToEdit={contactToEdit} />
        </FormCard>
        <DataTable 
          title="Contact List"
          columns={['ID', 'Name', 'Type', 'Email', 'Phone', 'Balance', 'Actions']}
          data={(contacts || []).map(contact => [
            contact.id,
            contact.name,
            contact.type,
            contact.email,
            contact.phone,
            `LKR ${contact.balance?.toFixed(2) || '0.00'}`,
            <div className="flex space-x-1">
               <button onClick={() => handleViewDetails(contact)} className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-black/20"><Eye className="h-4 w-4" /></button>
               <button onClick={() => handleEdit(contact)} className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-black/20"><Edit className="h-4 w-4" /></button>
               <button onClick={() => handleDelete(contact)} className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-black/20"><Trash2 className="h-4 w-4 text-red-500" /></button>
            </div>
          ])}
          loading={loading}
          error={error}
        />
      </div>
      
      {/* ... Modal ... */}
    </>
  );
};