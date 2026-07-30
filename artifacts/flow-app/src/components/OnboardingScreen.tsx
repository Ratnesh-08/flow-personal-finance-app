import React, { useState } from 'react';
import { useUpdateSettings, useListIncome, getGetSettingsQueryKey, getGetDashboardQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddIncomeSheet from './AddIncomeSheet';
import AddBillSheet from './AddBillSheet';
import { InlineIncomeList, InlineBillsList } from './EntryList';
import { useListBills } from '@workspace/api-client-react';

export default function OnboardingScreen() {
  const [showIncomeSheet, setShowIncomeSheet] = useState(false);
  const [showBillSheet, setShowBillSheet] = useState(false);
  
  const queryClient = useQueryClient();
  const updateSettings = useUpdateSettings();
  const { data: income = [] } = useListIncome();
  console.log("Income:", income);
  console.log("Is array?", Array.isArray(income));

  const { data: bills = [] } = useListBills();
  console.log("Bills:", bills);
  console.log("Is bills array?", Array.isArray(bills));

  const handleCalculate = () => {
    updateSettings.mutate({ data: { onboarded: true } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      }
    });
  };

  return (
    <div className="flex flex-col min-h-full bg-paper px-6 py-12 animate-in fade-in duration-500">
      <div className="flex-1 w-full flex flex-col">
        <h1 className="text-4xl font-serif font-bold text-ink mb-4">
          Flow<span className="text-gold">.</span>
        </h1>
        <p className="text-ink/80 font-sans text-lg leading-relaxed mb-12">
          Add a few income entries and your regular bills. Flow works out what's actually safe to spend.
        </p>

        <div className="space-y-12 flex-1">
          {/* Income Section */}
          <section>
            <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-2">
              <h2 className="font-mono text-sm uppercase text-ink tracking-wider font-medium">Recent Income</h2>
              <button 
                onClick={() => setShowIncomeSheet(true)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-teal/10 text-teal hover:bg-teal/20 transition-colors"
                aria-label="Add income"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <InlineIncomeList data={income} />
          </section>

          {/* Bills Section */}
          <section>
            <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-2">
              <h2 className="font-mono text-sm uppercase text-ink tracking-wider font-medium">Fixed Bills</h2>
              <button 
                onClick={() => setShowBillSheet(true)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-coral/10 text-coral hover:bg-coral/20 transition-colors"
                aria-label="Add bill"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <InlineBillsList data={bills} />
          </section>
        </div>

        <div className="mt-12">
          <Button
            className="w-full bg-ink hover:bg-ink/90 text-paper h-14 text-lg font-sans rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
            onClick={handleCalculate}
            disabled={income.length === 0 || updateSettings.isPending}
          >
            {updateSettings.isPending ? 'Calculating...' : 'Calculate my Safe to Spend'}
          </Button>
          {income.length === 0 && (
             <p className="text-center text-xs text-gray mt-3 font-sans">Please add at least one income entry</p>
          )}
        </div>
      </div>

      <AddIncomeSheet open={showIncomeSheet} onOpenChange={setShowIncomeSheet} />
      <AddBillSheet open={showBillSheet} onOpenChange={setShowBillSheet} />
    </div>
  );
}
