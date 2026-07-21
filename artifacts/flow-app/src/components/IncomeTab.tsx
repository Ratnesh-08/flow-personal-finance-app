import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { InlineIncomeList } from './EntryList';
import AddIncomeSheet from './AddIncomeSheet';

export default function IncomeTab() {
  const [open, setOpen] = useState(false);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-serif text-3xl text-ink">Income</h2>
          <p className="font-sans text-sm text-gray mt-1">Track your variable earnings.</p>
        </div>
        <button 
          onClick={() => setOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-teal text-white shadow-sm hover:bg-teal/90 transition-colors"
          aria-label="Add income"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      
      <div className="bg-paper-raised p-5 rounded-2xl border border-border/50 shadow-sm">
        <InlineIncomeList />
      </div>

      <AddIncomeSheet open={open} onOpenChange={setOpen} />
    </div>
  );
}
