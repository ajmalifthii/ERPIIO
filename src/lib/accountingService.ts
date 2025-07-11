import { supabase } from './supabaseClient';
import { logActivity } from './activityLogger';

const ACCOUNT_TYPES = {
    'Assets': 'debit',
    'Liabilities': 'credit',
    'Equity': 'credit',
    'Revenue': 'credit',
    'Expenses': 'debit'
};

const getAccountType = async (accountName: string) => {
    const { data, error } = await supabase
        .from('accounts')
        .select('type')
        .eq('name', accountName)
        .single();

    if (error) throw new Error(`Could not fetch account type for ${accountName}: ${error.message}`);
    if (!data) throw new Error(`Account ${accountName} not found.`);
    
    return data.type;
}

/**
 * Posts a double-entry transaction to the ledger.
 * For every debit, there must be a corresponding credit.
 * @param date - The date of the transaction.
 * @param description - A description of the transaction.
 * @param debitAccount - The account to be debited.
 * @param creditAccount - The account to be credited.
 * @param amount - The amount of the transaction.
 * @returns The transaction_id of the new ledger entries.
 */
export const postTransaction = async (
  date: string, 
  description: string, 
  debitAccount: string, 
  creditAccount: string, 
  amount: number
): Promise<string> => {
  if (amount <= 0) {
    throw new Error("Transaction amount must be positive.");
  }

  const debitAccountType = await getAccountType(debitAccount);
  const creditAccountType = await getAccountType(creditAccount);

  if (ACCOUNT_TYPES[debitAccountType] !== 'debit') {
      throw new Error(`Invalid debit: Account ${debitAccount} of type ${debitAccountType} cannot be debited.`);
  }

  if (ACCOUNT_TYPES[creditAccountType] !== 'credit') {
    throw new Error(`Invalid credit: Account ${creditAccount} of type ${creditAccountType} cannot be credited.`);
  }

  const transaction_id = crypto.randomUUID();

  const entries = [
    { date, account: debitAccount, type: 'debit', amount, description, transaction_id },
    { date, account: creditAccount, type: 'credit', amount, description, transaction_id },
  ];

  const { error } = await supabase.from('ledger').insert(entries);

  if (error) {
    console.error('Error posting to ledger:', error);
    throw error;
  }
  
  await logActivity('Posted Ledger Transaction', { description, amount });
  return transaction_id;
};

/**
 * Reverses a given ledger transaction by creating opposite entries.
 * @param transaction_id - The ID of the transaction to reverse.
 * @param reason - The reason for the reversal (e.g., "Deletion of SO-123").
 */
export const reverseTransaction = async (transaction_id: string, reason: string) => {
    if (!transaction_id) {
        console.warn("No ledger transaction to reverse.");
        return;
    }

    const reversal_id = crypto.randomUUID();
    const reversalDate = new Date().toISOString();

    const { data: originalEntries, error: fetchError } = await supabase
        .from('ledger')
        .select('*')
        .eq('transaction_id', transaction_id);
    
    if (fetchError) throw fetchError;
    if (!originalEntries || originalEntries.length === 0) {
        throw new Error(`No ledger entries found for transaction_id: ${transaction_id}`);
    }

    const reversalEntries = originalEntries.map(entry => ({
        date: reversalDate,
        account: entry.account,
        type: entry.type === 'debit' ? 'credit' : 'debit',
        amount: entry.amount,
        description: `Reversal for: ${reason}`,
        transaction_id: reversal_id,
        reverses_transaction: transaction_id
    }));

    const { error: insertError } = await supabase.from('ledger').insert(reversalEntries);
    if (insertError) throw insertError;

    await logActivity('Reversed Ledger Transaction', { original_id: transaction_id, reason });
};
