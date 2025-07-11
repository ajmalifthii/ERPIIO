import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { InventoryItem, Contact } from '../types';
import { User, Search, DollarSign, XCircle, FileText as ReceiptIcon } from 'lucide-react';
import { commonClasses } from '../lib/commonClasses';
import { QuantityModal } from '../components/pos/QuantityModal';
import { PaymentModal } from '../components/pos/PaymentModal';
import { logActivity } from '../lib/activityLogger';
import toast from 'react-hot-toast';

export const POSPage = () => {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
    const [cart, setCart] = useState<any[]>([]);
    const [customers, setCustomers] = useState<Contact[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isQtyModalOpen, setIsQtyModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
    const [lastTransaction, setLastTransaction] = useState<any>(null);

    // ... (useEffect for fetching data remains the same)

    const handleItemSelect = (item: InventoryItem) => {
        setCurrentItem(item);
        setIsQtyModalOpen(true);
    };

    const handleAddToCart = (quantity: number) => {
        if (!currentItem) return;
        const price = currentItem.sale_price || 0;
        setCart([...cart, { ...currentItem, cartId: Date.now(), quantity, total: price * quantity }]);
    };

    const handlePaymentConfirm = async (paymentDetails: any) => {
        const total = cart.reduce((sum, item) => sum + item.total, 0) * 1.18; // Including tax
        const customer = customers.find(c => c.id === selectedCustomer);
        
        const sale = {
            customer_id: selectedCustomer,
            amount: total,
            status: paymentDetails.paymentMethod === 'Credit' ? 'Pending' : 'Paid',
            payment_mode: paymentDetails.paymentMethod,
        };

        const toastId = toast.loading('Processing sale...');

        try {
            const { data, error } = await supabase.functions.invoke('complete-pos-sale', {
                body: { sale, cart, paymentDetails, customerName: customer?.name },
            });

            if (error) throw new Error(error.message);
            if (data.error) throw new Error(data.error);

            logActivity('Completed POS Sale', { saleId: data.saleData.id, total });
            toast.success('Sale completed successfully!', { id: toastId });
            
            setLastTransaction({ sale: data.saleData, cart, total, paymentDetails });
            setCart([]);
        } catch (err: any) {
            toast.error(`Sale failed: ${err.message}`, { id: toastId });
        }
    };
    
    // ... (other functions: removeFromCart, etc.)

    if (lastTransaction) {
        // ... (Receipt display remains the same)
    }

    return (
        <>
           {/* ... (Main Content & Cart as before) ... */}
            <PaymentModal 
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onConfirm={handlePaymentConfirm}
                totalAmount={cart.reduce((sum, item) => sum + item.total, 0) * 1.18}
            />
        </>
    );
};
