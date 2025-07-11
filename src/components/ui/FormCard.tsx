import { commonClasses } from '../../lib/commonClasses';
import { LucideIcon } from 'lucide-react';

interface FormCardProps {
  title: string;
  children: React.ReactNode;
  actions?: {
    icon: LucideIcon;
    label: string;
    className?: string;
  }[];
}

export const FormCard = ({ title, children, actions }: FormCardProps) => (
  <div className={`${commonClasses.card} mb-4`}>
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-md font-bold text-gray-900 dark:text-white">{title}</h3>
      {actions && (
        <div className="flex space-x-2">
          {actions.map((action, index) => (
            <button key={index} className={action.className || commonClasses.buttonSecondary}>
              {action.icon && <action.icon className="h-4 w-4 mr-1.5" />}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);
