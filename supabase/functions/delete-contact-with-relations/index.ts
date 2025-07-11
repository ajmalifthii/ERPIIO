import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { contactId } = await req.json();
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Check for related sales orders
    const { data: sales, error: salesError } = await supabase.from('sales_orders').select('id').eq('customer_id', contactId);
    if (salesError) throw new Error(`Error checking sales: ${salesError.message}`);

    // Check for related cheques
    const { data: cheques, error: chequesError } = await supabase.from('cheques').select('id').eq('contact_id', contactId);
    if (chequesError) throw new Error(`Error checking cheques: ${chequesError.message}`);

    if (sales.length > 0 || cheques.length > 0) {
        // In a real application, you might want to prevent deletion if relations exist,
        // or perform a cascading delete. Here, we'll return a specific message.
        return new Response(JSON.stringify({ 
            error: 'This contact cannot be deleted because they have associated sales orders or cheques.' 
        }), {
            headers: { 'Content-Type': 'application/json' },
            status: 409, // Conflict
        });
    }

    // If no relations, proceed with deletion
    const { error: deleteError } = await supabase.from('contacts').delete().eq('id', contactId);
    if (deleteError) throw new Error(`Deletion failed: ${deleteError.message}`);

    return new Response(JSON.stringify({ message: 'Contact deleted successfully' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})
