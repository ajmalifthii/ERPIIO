import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { itemId } = await req.json();
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Check for related purchases or sales order items
    const { data: purchases, error: pError } = await supabase.from('purchases').select('id').eq('material_id', itemId);
    const { data: sales, error: sError } = await supabase.from('sales_order_items').select('id').eq('inventory_item_id', itemId);

    if (pError || sError) throw new Error(pError?.message || sError?.message);

    if (purchases.length > 0 || sales.length > 0) {
      return new Response(JSON.stringify({ 
        error: 'This item cannot be deleted as it is linked to existing purchases or sales orders.' 
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 409, // Conflict
      });
    }

    const { error: deleteError } = await supabase.from('inventory').delete().eq('id', itemId);
    if (deleteError) throw new Error(`Deletion failed: ${deleteError.message}`);

    return new Response(JSON.stringify({ message: 'Item deleted successfully.' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
