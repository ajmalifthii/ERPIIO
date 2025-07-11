import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { commonClasses } from '../../lib/commonClasses';

interface QuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  itemName: string;
  unitType: 'sqft' | 'units';
}

export const QuantityModal = ({ isOpen, onClose, onConfirm, itemName, unitType }: QuantityModalProps) => {
  const [quantity, setQuantity] = useState(1);

  const handleConfirm = () => {
    onConfirm(quantity);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Enter quantity for ${itemName}`}>
      <div className="space-y-4">
        <label className="block">
          <span className="text-gray-400">Quantity ({unitType})</span>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className={`${commonClasses.input} mt-1 w-full`}
            autoFocus
          />
        </label>
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className={commonClasses.buttonSecondary}>Cancel</button>
          <button onClick={handleConfirm} className={commonClasses.button}>Confirm</button>
        </div>
      </div>
    </Modal>
  );
};
