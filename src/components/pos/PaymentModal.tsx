import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { commonClasses } from '../../lib/commonClasses';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentDetails: any) => void;
  totalAmount: number;
}

export const PaymentModal = ({ isOpen, onClose, onConfirm, totalAmount }: PaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountPaid, setAmountPaid] = useState(totalAmount);
  const [chequeNumber, setChequeNumber] = useState('');
  const [chequeDueDate, setChequeDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    onConfirm({
      paymentMethod,
      amountPaid,
      change: amountPaid - totalAmount,
      chequeNumber,
      chequeDueDate,
      notes
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Process Payment">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Total: LKR {totalAmount.toFixed(2)}</h2>
        
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={commonClasses.input}>
          <option>Cash</option>
          <option>Cheque</option>
          <option>Credit</option>
        </select>

        <input
            type="number"
            value={amountPaid}
            onChange={(e) => setAmountPaid(Number(e.target.value))}
            className={commonClasses.input}
            placeholder="Amount Paid"
        />

        {paymentMethod === 'Cheque' && (
            <>
                <input type="text" placeholder="Cheque Number" className={commonClasses.input} value={chequeNumber} onChange={e => setChequeNumber(e.target.value)} />
                <input type="date" placeholder="Cheque Due Date" className={commonClasses.input} value={chequeDueDate} onChange={e => setChequeDueDate(e.target.value)} />
            </>
        )}
        
        <textarea placeholder="Notes..." className={commonClasses.input} value={notes} onChange={e => setNotes(e.target.value)} />

        <div className="text-lg font-semibold text-center">
            Change Due: LKR {(amountPaid - totalAmount > 0 ? amountPaid - totalAmount : 0).toFixed(2)}
        </div>

        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className={commonClasses.buttonSecondary}>Cancel</button>
          <button onClick={handleConfirm} className={commonClasses.button}>Confirm Payment</button>
        </div>
      </div>
    </Modal>
  );
};
