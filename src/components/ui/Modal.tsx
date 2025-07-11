import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="bg-slate-50 dark:bg-gray-900/70 dark:backdrop-blur-xl border border-white/10 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] m-4 flex flex-col"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-black/20">
            <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </header>
        <main className="p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
