import { useState, useEffect } from 'react';
import {
  Home, FileText, CreditCard, Package, Calculator, Users, ShoppingCart, Repeat, BarChart3,
  UserCheck, X, ChevronLeft, Printer, ClipboardList, Landmark, Library
} from 'lucide-react'; // Removed Bell, Menu, Search, Sun, Moon, LogOut
import { Toaster } from 'react-hot-toast';

import { DashboardPage } from './pages/DashboardPage';
import { SalesPage } from './pages/SalesPage';
import { ChequesPage } from './pages/ChequesPage';
import { InventoryPage } from './pages/InventoryPage';
import { ContactsPage } from './pages/ContactsPage';
import { PurchasesPage } from './pages/PurchasesPage';
import { UsersPage } from './pages/UsersPage';
import { GeneralLedgerPage } from './pages/GeneralLedgerPage';
import { ReportsPage } from './pages/ReportsPage';
import { LoginPage } from './pages/LoginPage';
import { POSPage } from './pages/POSPage';
import { QuotationsPage } from './pages/QuotationsPage';
import { BankAccountsPage } from './pages/BankAccountsPage';
import { BankReconciliationPage } from './pages/BankReconciliationPage';
import { RecurringExpensesPage } from './pages/RecurringExpensesPage';
// import { commonClasses } from './lib/commonClasses'; // Removed commonClasses
// import { supabase } from './lib/supabaseClient'; // supabase is not used directly in this file after removing handleLogout
import { useAuth } from './contexts/AuthContext';

const App = () => {
  const { session, profile, loading } = useAuth();
  const [isDarkMode, /* setIsDarkMode */] = useState(() => { // setIsDarkMode is not used
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isDarkMode') === 'true';
    }
    return true; // Default to true (dark mode) if localStorage is not available or not set
  });
  const [activeView, setActiveView] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('home');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 1024);

  const navigateTo = (view: string, tab?: string) => {
    setActiveView(view);
    if (tab) setActiveTab(tab);
    setShowMobileSidebar(false);
  };

  // const toggleDarkMode = () => setIsDarkMode(prev => { // Removed toggleDarkMode function
  //   const newState = !prev;
  //   localStorage.setItem('isDarkMode', String(newState));
  //   return newState;
  // });

  const toggleSidebarCollapse = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const handleResize = () => setIsSidebarCollapsed(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const allNavItems = [
    { id: 'home', name: 'Dashboard', icon: Home, roles: ['Admin', 'Accountant', 'Sales', 'Inventory'], view: 'dashboard' },
    { id: 'pos', name: 'POS', icon: Printer, roles: ['Admin', 'Sales'], view: 'pos' },
    { id: 'quotations', name: 'Quotations', icon: ClipboardList, roles: ['Admin', 'Sales'], view: 'dashboard' },
    { id: 'sales', name: 'Sales', icon: FileText, roles: ['Admin', 'Sales'], view: 'dashboard' },
    { id: 'cheques', name: 'Cheques', icon: CreditCard, roles: ['Admin', 'Accountant'], view: 'dashboard' },
    { id: 'inventory', name: 'Inventory', icon: Package, roles: ['Admin', 'Inventory', 'Sales'], view: 'dashboard' },
    { id: 'accounting', name: 'Ledger', icon: Calculator, roles: ['Admin', 'Accountant'], view: 'dashboard' },
    { id: 'recurring-expenses', name: 'Recurring', icon: Repeat, roles: ['Admin', 'Accountant'], view: 'dashboard' },
    { id: 'bank-accounts', name: 'Bank Accounts', icon: Landmark, roles: ['Admin', 'Accountant'], view: 'dashboard' },
    { id: 'bank-reconciliation', name: 'Reconciliation', icon: Library, roles: ['Admin', 'Accountant'], view: 'dashboard' },
    { id: 'customers', name: 'Contacts', icon: Users, roles: ['Admin', 'Sales'], view: 'dashboard' },
    { id: 'purchases', name: 'Purchases', icon: ShoppingCart, roles: ['Admin', 'Inventory'], view: 'dashboard' },
    { id: 'reports', name: 'Reports', icon: BarChart3, roles: ['Admin', 'Accountant'], view: 'dashboard' },
    { id: 'users', name: 'Users', icon: UserCheck, roles: ['Admin'], view: 'dashboard' },
  ];

  const navItems = allNavItems.filter(item => profile?.role && item.roles.includes(profile.role));

  // const handleLogout = async () => await supabase.auth.signOut(); // Removed handleLogout
  
  if (!session) return <LoginPage />;
  if (activeView === 'pos') return <POSPage />;

  const renderDashboardContent = () => {
    // While authenticating, we can show a loader inside the main content area
    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500"></div>
            </div>
        );
    }
    switch (activeTab) {
      case 'home': return <DashboardPage navigateTo={navigateTo} />;
      case 'sales': return <SalesPage />;
      case 'cheques': return <ChequesPage />;
      case 'inventory': return <InventoryPage />;
      case 'accounting': return <GeneralLedgerPage />;
      case 'bank-accounts': return <BankAccountsPage />;
      case 'bank-reconciliation': return <BankReconciliationPage />;
      case 'customers': return <ContactsPage />;
      case 'purchases': return <PurchasesPage />;
      case 'reports': return <ReportsPage />;
      case 'users': return <UsersPage />;
      case 'quotations': return <QuotationsPage />;
      case 'recurring-expenses' : return <RecurringExpensesPage />;
      default: return <DashboardPage navigateTo={navigateTo} />;
    }
  };
  
  // const userInitial = profile?.email?.substring(0, 2)?.toUpperCase() || '??'; // Removed userInitial

  return (
    <>
      <Toaster position="top-right" toastOptions={{
        className: 'dark:bg-slate-700 dark:text-white dark:border-slate-600',
        duration: 3000,
        success: { iconTheme: { primary: '#0d9488', secondary: 'white' } },
        error: { iconTheme: { primary: '#ef4444', secondary: 'white' } }
      }} />
      <div className="min-h-screen text-gray-800 dark:text-gray-300 bg-slate-100 dark:bg-slate-900 flex">
        <aside className={`fixed lg:relative inset-y-0 left-0 z-50 ${isSidebarCollapsed ? 'w-20' : 'w-64'} 
                           ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'} 
                           lg:translate-x-0 transition-all duration-300 flex-shrink-0`}>
          <div className="h-full bg-white dark:bg-slate-800/80 backdrop-blur-lg border-r border-slate-200 dark:border-slate-700/60 m-2 rounded-xl flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between h-16">
              {!isSidebarCollapsed && (
                <h1 className="text-xl font-bold bg-gradient-to-r from-teal-400 to-sky-400 bg-clip-text text-transparent">
                  LeatherERP
                </h1>
              )}
              <button onClick={toggleSidebarCollapse} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 hidden lg:block">
                <ChevronLeft className={`h-5 w-5 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
              </button>
              <button onClick={() => setShowMobileSidebar(false)} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 lg:hidden">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
              {/* Skeleton UI for nav items */}
              {loading && navItems.length === 0 ? (
                  <div className="space-y-2 animate-pulse">
                      {[...Array(8)].map((_, i) => (
                           <div key={i} className="h-10 bg-slate-300/50 dark:bg-slate-700/50 rounded-lg"></div>
                      ))}
                  </div>
              ) : navItems.map((item) => (
                <button
                  key={item.id} onClick={() => navigateTo(item.view, item.id)} title={item.name}
                  className={`w-full flex items-center p-3 rounded-lg transition-colors group ${activeTab === item.id ? 'bg-teal-500/10 text-teal-400' : 'hover:bg-slate-200/60 dark:hover:bg-slate-700/50'}`}>
                  <item.icon className={`h-5 w-5 flex-shrink-0 ${isSidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
                  {!isSidebarCollapsed && <span className="font-semibold text-sm truncate">{item.name}</span>}
                </button>
              ))}
            </nav>
            <div className="p-2 border-t border-slate-200 dark:border-slate-700/60">
              {/* ... user profile section ... */}
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg">
             {/* ... header content ... */}
          </header>
          <main className="flex-1 overflow-y-auto p-4">
            {renderDashboardContent()}
          </main>
        </div>
      </div>
    </>
  );
};

export default App;
