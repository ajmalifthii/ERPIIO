import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { sale, cart, paymentDetails, customerName } = await req.json();
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // 1. Create Sales Order
    const { data: saleData, error: saleError } = await supabase.from('sales_orders').insert(sale).select().single();
    if (saleError) throw new Error(`Sale Error: ${saleError.message}`);

    // 2. Post to Ledger
    const transaction = {
      date: new Date().toISOString(),
      description: `POS Sale to ${customerName || 'Walk-in Customer'}`,
      debit_account_id: paymentDetails.paymentMethod === 'Cash' ? 'CASH_ACCOUNT_ID' : 'AR_ACCOUNT_ID', // Replace with actual IDs
      credit_account_id: 'SALES_REVENUE_ACCOUNT_ID', // Replace with actual ID
      amount: sale.amount
    };
    // This assumes you have a function or trigger to create ledger entries from a transaction table
    const { error: ledgerError } = await supabase.from('transactions').insert(transaction);
    if (ledgerError) throw new Error(`Ledger Error: ${ledgerError.message}`);

    // 3. Update Inventory
    for (const item of cart) {
        const { data: currentItem, error: fetchError } = await supabase.from('inventory').select('sqft, units').eq('id', item.id).single();
        if (fetchError) throw new Error(`Inventory fetch error: ${fetchError.message}`);
        
        const newQty = item.type === 'Leather' ? (currentItem.sqft - item.quantity) : (currentItem.units - item.quantity);
        const { error: updateError } = await supabase.from('inventory').update({ [item.type === 'Leather' ? 'sqft' : 'units']: newQty }).eq('id', item.id);
        if (updateError) throw new Error(`Inventory update error: ${updateError.message}`);
    }

    return new Response(JSON.stringify({ saleData }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    // Basic error compensation - could be more robust
    // For instance, if ledger or inventory fails, should we delete the created sale?
    // For now, we just return the error to the client.
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
