alter table public.bank_accounts
add column ledger_account_id uuid references public.accounts(id);
