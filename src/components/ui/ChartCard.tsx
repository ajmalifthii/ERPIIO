import { commonClasses } from "../../lib/commonClasses";

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

export const ChartCard = ({ title, children }: ChartCardProps) => (
  <div className={commonClasses.card}>
    <h3 className="text-md font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
    <div className="h-72 w-full">
      {children}
    </div>
  </div>
);
