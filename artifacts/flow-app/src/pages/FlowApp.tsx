import React, { useState, useEffect, useRef } from 'react';
import { useGetSettings, useGetDashboard, useLoadDemoData, useClearAllData, getGetDashboardQueryKey, getGetSettingsQueryKey, getListIncomeQueryKey, getListBillsQueryKey, getListSavingsGoalsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import OnboardingScreen from '../components/OnboardingScreen';
import HomeTab from '../components/HomeTab';
import IncomeTab from '../components/IncomeTab';
import BillsTab from '../components/BillsTab';
import ChartsTab from '../components/ChartsTab';
import GoalsTab from '../components/GoalsTab';
import { Loader2, Sun, Moon, MoreHorizontal } from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';
import { useCurrency, CURRENCIES, Currency } from '../hooks/useCurrency';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

type Tab = 'home' | 'income' | 'bills' | 'goals' | 'charts';

const TAB_LABELS: Record<Tab, string> = {
  home: 'Home',
  income: 'Income',
  bills: 'Bills',
  goals: 'Goals',
  charts: 'Charts',
};

export default function FlowApp() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useGetSettings();
  const { data: dashboard } = useGetDashboard();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const { theme, setTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const { toast } = useToast();
  const notificationsShown = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const loadDemo = useLoadDemoData();
  const clearAll = useClearAllData();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListIncomeQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListBillsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListSavingsGoalsQueryKey() });
  };

  const handleLoadDemo = () => {
    setMenuOpen(false);
    loadDemo.mutate(undefined, {
      onSuccess: () => { invalidateAll(); toast({ description: 'Demo data loaded.' }); },
      onError: () => toast({ description: 'Failed to load demo data.', variant: 'destructive' }),
    });
  };

  const handleClearAll = () => {
    setMenuOpen(false);
    if (!window.confirm('Clear all your data? This cannot be undone.')) return;
    clearAll.mutate(undefined, {
      onSuccess: () => { invalidateAll(); toast({ description: 'All data cleared.' }); },
      onError: () => toast({ description: 'Failed to clear data.', variant: 'destructive' }),
    });
  };

  useEffect(() => {
    if (!dashboard || notificationsShown.current) return;
    const hasShown = sessionStorage.getItem('flow-notified');
    if (hasShown) { notificationsShown.current = true; return; }

    if (dashboard.safeToSpend < (dashboard.baselineIncome * 0.1) && dashboard.baselineIncome > 0) {
      toast({ description: "Low available funds — you're close to your limit.", variant: 'destructive' });
    } else if (dashboard.insights?.daysRemainingInMonth <= 3) {
      toast({ description: `Month end approaching — ${dashboard.insights.daysRemainingInMonth} days left.` });
    } else if (dashboard.bufferBalance >= dashboard.bufferGoal && dashboard.bufferGoal > 0) {
      toast({ description: 'Buffer goal reached — well done.', className: 'bg-teal text-white border-none' });
    }

    sessionStorage.setItem('flow-notified', 'true');
    notificationsShown.current = true;
  }, [dashboard, toast]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full bg-paper">
        <Loader2 className="w-8 h-8 animate-spin text-ink/20" />
      </div>
    );
  }

  if (!settings?.onboarded) {
    return <OnboardingScreen />;
  }

  const tabs: Tab[] = ['home', 'income', 'bills', 'goals', 'charts'];

  return (
    <div className="flex flex-col h-full bg-paper">
      {/* Header */}
      <div className="pt-6 px-5 pb-3 bg-paper-raised z-10 sticky top-0 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-serif font-bold text-ink tracking-tight flex items-baseline">
            Flow<span className="text-gold text-3xl leading-none">.</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Currency picker */}
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="appearance-none bg-transparent font-mono text-xs text-ink outline-none cursor-pointer pr-3 hover:opacity-70 transition-opacity"
                aria-label="Select currency"
              >
                {(Object.keys(CURRENCIES) as Currency[]).map((c) => (
                  <option key={c} value={c} className="bg-paper text-ink">{CURRENCIES[c]} {c}</option>
                ))}
              </select>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray text-[8px]">▼</div>
            </div>

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-gray hover:text-ink transition-colors p-1"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* More menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-gray hover:text-ink transition-colors p-1"
                aria-label="More options"
                aria-expanded={menuOpen}
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden="true" />
                  <div className="absolute right-0 top-8 z-20 bg-paper-raised border border-border/70 rounded-xl shadow-lg py-1 w-44 font-sans text-sm">
                    <button
                      onClick={handleLoadDemo}
                      disabled={loadDemo.isPending}
                      className="w-full text-left px-4 py-2.5 hover:bg-paper transition-colors text-ink text-sm"
                    >
                      {loadDemo.isPending ? 'Loading...' : 'Load Demo Data'}
                    </button>
                    <div className="border-t border-border/50 mx-3 my-1" />
                    <button
                      onClick={handleClearAll}
                      disabled={clearAll.isPending}
                      className="w-full text-left px-4 py-2.5 hover:bg-paper transition-colors text-coral text-sm"
                    >
                      {clearAll.isPending ? 'Clearing...' : 'Clear All Data'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-border/30 p-0.5 rounded-lg" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 text-[11px] font-mono rounded-md transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-paper text-ink shadow-sm font-medium'
                  : 'text-gray hover:text-ink'
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5 pb-24 relative">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
              <HomeTab />
            </motion.div>
          )}
          {activeTab === 'income' && (
            <motion.div key="income" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
              <IncomeTab />
            </motion.div>
          )}
          {activeTab === 'bills' && (
            <motion.div key="bills" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
              <BillsTab />
            </motion.div>
          )}
          {activeTab === 'goals' && (
            <motion.div key="goals" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
              <GoalsTab />
            </motion.div>
          )}
          {activeTab === 'charts' && (
            <motion.div key="charts" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
              <ChartsTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="text-center py-4 border-t border-border/50 mt-auto bg-paper-raised text-[10px] font-mono text-gray/50">
        Flow · safe to spend
      </div>
    </div>
  );
}
