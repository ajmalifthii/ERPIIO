import React from 'react';
import { BarChart3 } from 'lucide-react';

// We will define a type for our reports
interface Report {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType;
}

// Import the report pages
import { TrialBalancePage } from './Reports/TrialBalancePage';
import { ProfitAndLossPage } from './Reports/ProfitAndLossPage';
import { BalanceSheetPage } from './Reports/BalanceSheetPage';

// List of available reports
const availableReports: Report[] = [
  {
    id: 'trial-balance',
    name: 'Trial Balance',
    description: 'A summary of all accounts and their debit or credit balances.',
    component: TrialBalancePage,
  },
  {
    id: 'profit-and-loss',
    name: 'Profit & Loss Statement',
    description: 'Shows the company financial performance over a period of time.',
    component: ProfitAndLossPage,
  },
  {
    id: 'balance-sheet',
    name: 'Balance Sheet',
    description: 'A snapshot of the company financial position.',
    component: BalanceSheetPage,
  }
];

export const ReportsPage = () => {
  const [selectedReport, setSelectedReport] = React.useState<Report | null>(null);

  if (selectedReport) {
    const ReportComponent = selectedReport.component;
    return (
      <div>
        <button 
          onClick={() => setSelectedReport(null)} 
          className="text-teal-500 hover:underline mb-4"
        >
          &larr; Back to Reports List
        </button>
        <ReportComponent />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Available Reports</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableReports.map(report => (
          <div 
            key={report.id}
            onClick={() => setSelectedReport(report)}
            className="p-4 rounded-lg bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors"
          >
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-6 w-6 text-teal-400" />
              <h2 className="text-lg font-semibold">{report.name}</h2>
            </div>
            <p className="text-sm text-gray-400 mt-2">{report.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
