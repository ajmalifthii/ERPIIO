import { supabase } from './supabaseClient';

export const getDashboardStats = async () => {
  const { data, error } = await supabase.rpc('get_dashboard_stats');

  if (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
  
  // The RPC function returns a single JSON object.
  // If data is an array, we take the first element.
  return Array.isArray(data) ? data[0] : data;
};


export const getRecentSales = async (limit = 5) => {
  const { data, error } = await supabase
    .from('sales_orders')
    .select('id, customer_id, amount, status, customer_name:contacts (name)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  
  return data.map(({ customer_name, ...order }) => ({
    ...order,
    customer: customer_name.name,
  }));
};

export const getChequeReminders = async (days = 7) => {
  const today = new Date();
  const upcomingDate = new Date();
  upcomingDate.setDate(today.getDate() + days);

  const { data, error } = await supabase
    .from('cheques')
    .select('id, number, amount, due_date, status, client_name:contacts (name)')
    .in('status', ['Upcoming', 'Pending'])
    .lte('due_date', upcomingDate.toISOString())
    .gte('due_date', today.toISOString())
    .order('due_date', { ascending: true });
    
  if (error) throw error;
  
  return data.map(({ client_name, ...cheque }) => ({
    ...cheque,
    client: client_name.name,
  }));
};

export const getStockAlerts = async (lowStockThreshold = 10) => {
  const { data, error } = await supabase
    .from('inventory')
    .select('id, name, type, sqft, units')
    .or(`sqft.lte.${lowStockThreshold},units.lte.${lowStockThreshold}`)
    .order('name');
    
  if (error) throw error;
  return data;
};

export const getRecentActivity = async (limit = 5) => {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
};
