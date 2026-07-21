import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { InlineBillsList } from './EntryList';
import AddBillSheet from './AddBillSheet';

export default function BillsTab() {
  const [open, setOpen] = useState(false);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-serif text-3xl text-ink">Fixed Bills</h2>
          <p className="font-sans text-sm text-gray mt-1">Your predictable monthly costs.</p>
        </div>
        <button 
          onClick={() => setOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-coral text-white shadow-sm hover:bg-coral/90 transition-colors"
          aria-label="Add bill"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      
      <div className="bg-paper-raised p-5 rounded-2xl border border-border/50 shadow-sm">
        <InlineBillsList />
      </div>

      <AddBillSheet open={open} onOpenChange={setOpen} />
    </div>
  );
}
