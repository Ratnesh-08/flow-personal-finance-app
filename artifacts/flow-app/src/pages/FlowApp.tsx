import React, { useState } from 'react';
import { useGetSettings } from '@workspace/api-client-react';
import OnboardingScreen from '../components/OnboardingScreen';
import HomeTab from '../components/HomeTab';
import IncomeTab from '../components/IncomeTab';
import BillsTab from '../components/BillsTab';
import { Loader2 } from 'lucide-react';

export default function FlowApp() {
  const { data: settings, isLoading } = useGetSettings();
  const [activeTab, setActiveTab] = useState<'home' | 'income' | 'bills'>('home');

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-ink/20" />
      </div>
    );
  }

  if (!settings?.onboarded) {
    return <OnboardingScreen />;
  }

  return (
    <div className="flex flex-col h-full bg-paper">
      {/* Header / Tabs */}
      <div className="pt-8 px-6 pb-4 bg-paper-raised z-10 sticky top-0 border-b border-border/50">
        <div className="flex items-center justify-between mb-6">
          <div className="text-2xl font-serif font-bold text-ink tracking-tight flex items-baseline">
            Flow<span className="text-gold text-3xl leading-none">.</span>
          </div>
        </div>

        <div className="flex bg-border/40 p-1 rounded-lg">
          {(['home', 'income', 'bills'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 text-xs font-mono rounded-md capitalize transition-colors duration-200 ${
                activeTab === tab 
                  ? 'bg-paper text-ink shadow-sm' 
                  : 'text-gray hover:text-ink'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24">
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'income' && <IncomeTab />}
        {activeTab === 'bills' && <BillsTab />}
      </div>

      {/* Footer */}
      <div className="text-center py-6 border-t border-border/50 mt-auto bg-paper-raised text-[10px] font-mono text-gray">
        Flow · your data is saved
      </div>
    </div>
  );
}
