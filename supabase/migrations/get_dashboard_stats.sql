create or replace function get_dashboard_stats()
returns json
language plpgsql
security definer
as $$
declare
  thirty_days_ago date := now() - interval '30 days';
  monthly_revenue numeric;
  outstanding_cheques numeric;
  inventory_value numeric;
  active_customers integer;
begin
  -- 1. Monthly Revenue
  select coalesce(sum(amount), 0) into monthly_revenue
  from public.sales_orders
  where created_at >= thirty_days_ago;

  -- 2. Outstanding Cheques
  select coalesce(sum(amount), 0) into outstanding_cheques
  from public.cheques
  where status in ('Pending', 'Upcoming');

  -- 3. Inventory Value
  select coalesce(sum(cost * 
    case 
      when type = 'Leather' then sqft 
      else units 
    end
  ), 0) into inventory_value
  from public.inventory;

  -- 4. Active Customers
  select count(*) into active_customers
  from public.contacts
  where type = 'Customer';

  return json_build_object(
    'monthlyRevenue', monthly_revenue,
    'outstandingCheques', outstanding_cheques,
    'inventoryValue', inventory_value,
    'customerCount', active_customers
  );
end;
$$;
