import React, { useState } from 'react';
import { Plus, Search, Download, Upload } from 'lucide-react';
import { InlineBillsList } from './EntryList';
import AddBillSheet from './AddBillSheet';
import EditBillSheet from './EditBillSheet';
import CsvImportModal from './CsvImportModal';
import { BILL_CATEGORIES } from '../lib/categories';
import { useListBills } from '@workspace/api-client-react';
import type { Bill } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '../hooks/useCurrency';

export default function BillsTab() {
  const [addOpen, setAddOpen] = useState(false);
  const [editBill, setEditBill] = useState<Bill | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const { toast } = useToast();
  const { formatAmount } = useCurrency();

  const { data: bills = [] } = useListBills(
    { search: search || undefined, category: category || undefined }
  );

  const totalBills = bills.reduce((s, b) => s + Number(b.amount), 0);

  const handleExport = () => {
    if (bills.length === 0) { toast({ description: 'No data to export.' }); return; }
    const rows = [['ID', 'Name', 'Amount', 'Category'], ...bills.map(b => [b.id, `"${b.name}"`, b.amount, b.category || ''])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'flow_bills.csv'; a.click();
    URL.revokeObjectURL(url);
    toast({ description: `Exported ${bills.length} bills.` });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-3xl text-ink">Fixed Bills</h2>
          <p className="font-sans text-sm text-gray mt-0.5">Your predictable monthly costs.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-paper-raised border border-border/50 text-gray hover:text-ink hover:bg-border/30 transition-colors shadow-sm"
            aria-label="Export bills to CSV">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={() => setImportOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-paper-raised border border-border/50 text-gray hover:text-ink hover:bg-border/30 transition-colors shadow-sm"
            aria-label="Import bills from CSV">
            <Upload className="w-4 h-4" />
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-coral text-white shadow-sm hover:bg-coral/90 transition-colors"
            aria-label="Add bill">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search + filters */}
      <div className="mb-5 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search bills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-paper-raised border border-border/50 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-coral text-ink placeholder:text-gray/60 transition-colors"
            aria-label="Search bills"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setCategory('')}
            className={`px-3 py-1 rounded-full font-mono text-[10px] uppercase tracking-wider transition-colors border ${!category ? 'bg-ink text-paper border-ink' : 'bg-transparent text-gray border-border/70 hover:border-gray'}`}>
            All
          </button>
          {BILL_CATEGORIES.map(c => (
            <button key={c.value} onClick={() => setCategory(c.value === category ? '' : c.value)}
              className={`px-3 py-1 rounded-full font-mono text-[10px] uppercase tracking-wider transition-colors border ${category === c.value ? 'bg-ink text-paper border-ink' : 'bg-transparent text-gray border-border/70 hover:border-gray'}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-paper-raised p-5 rounded-2xl border border-border/50 shadow-sm">
        <InlineBillsList data={bills} onEdit={setEditBill} />
      </div>

      {/* Total */}
      {bills.length > 0 && (
        <div className="mt-3 flex justify-between px-1">
          <span className="font-mono text-[10px] text-gray uppercase tracking-wider">{bills.length} bills</span>
          <span className="font-mono text-[10px] text-coral font-medium">{formatAmount(totalBills)} / mo</span>
        </div>
      )}

      <AddBillSheet open={addOpen} onOpenChange={setAddOpen} />
      <EditBillSheet bill={editBill} onClose={() => setEditBill(null)} />
      <CsvImportModal open={importOpen} onOpenChange={setImportOpen} mode="bills" />
    </div>
  );
}
