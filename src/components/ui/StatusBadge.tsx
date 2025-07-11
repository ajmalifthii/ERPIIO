import { commonClasses } from '../../lib/commonClasses';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusStyle = (s: string) => {
    switch (s.toLowerCase()) {
      case 'paid': case 'available': case 'active': case 'cleared': case 'received':
        return `${commonClasses.badge} ${commonClasses.badgeSuccess}`;
      case 'partial': case 'pending': case 'upcoming': case 'medium':
        return `${commonClasses.badge} ${commonClasses.badgeWarning}`;
      case 'overdue': case 'damaged': case 'high':
        return `${commonClasses.badge} ${commonClasses.badgeDanger}`;
      case 'low':
        return `${commonClasses.badge} ${commonClasses.badgeInfo}`;
      default:
        return `${commonClasses.badge} ${commonClasses.badgePending}`;
    }
  };
  return <span className={getStatusStyle(status)}>{status}</span>;
};
