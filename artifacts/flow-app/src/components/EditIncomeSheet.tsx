import React, { useState, useEffect } from 'react';
import { useUpdateIncome, getListIncomeQueryKey, getGetDashboardQueryKey, IncomeEntry } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { INCOME_CATEGORIES } from '../lib/categories';
import { useCurrency } from '../hooks/useCurrency';
import { useToast } from '@/hooks/use-toast';

interface Props {
  entry: IncomeEntry | null;
  onClose: () => void;
}

export default function EditIncomeSheet({ entry, onClose }: Props) {
  const queryClient = useQueryClient();
  const updateIncome = useUpdateIncome();
  const { symbol } = useCurrency();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [category, setCategory] = useState(INCOME_CATEGORIES[0].value);
  const [date, setDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (entry) {
      setAmount(String(entry.amount));
      setSource(entry.source || '');
      setCategory(entry.category || INCOME_CATEGORIES[0].value);
      setDate(entry.date || '');
      setError('');
    }
  }, [entry]);

  const handleSave = () => {
    if (!amount || Number(amount) <= 0) { setError('Amount must be greater than 0'); return; }
    if (!date) { setError('Date is required'); return; }
    setError('');

    updateIncome.mutate(
      { id: entry!.id, data: { amount: Number(amount), source, date, category } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListIncomeQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
          toast({ description: 'Income updated.' });
          onClose();
        },
        onError: () => { toast({ description: 'Failed to update. Please try again.', variant: 'destructive' }); }
      }
    );
  };

  return (
    <Sheet open={!!entry} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl bg-paper-raised border-border px-6 py-6 font-sans">
        <SheetHeader className="mb-6 text-left">
          <SheetTitle className="font-serif text-2xl text-ink">Edit Income</SheetTitle>
          <SheetDescription className="text-gray font-sans text-sm">Update this income entry.</SheetDescription>
        </SheetHeader>

        {error && <p className="text-coral text-sm mb-4 font-sans">{error}</p>}

        <div className="space-y-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="edit-income-amount" className="font-mono text-xs uppercase text-gray">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray">{symbol}</span>
              <Input id="edit-income-amount" type="number" min="0.01" step="1" placeholder="0"
                className="pl-7 bg-paper border-border/50 focus-visible:ring-ink"
                value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-income-source" className="font-mono text-xs uppercase text-gray">Source</Label>
            <Input id="edit-income-source" placeholder="e.g. Acme Corp"
              className="bg-paper border-border/50 focus-visible:ring-ink"
              value={source} onChange={(e) => setSource(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-income-category" className="font-mono text-xs uppercase text-gray">Category</Label>
            <select id="edit-income-category"
              className="flex h-10 w-full rounded-md border border-border/50 bg-paper px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
              value={category} onChange={(e) => setCategory(e.target.value)}>
              {INCOME_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-income-date" className="font-mono text-xs uppercase text-gray">Date</Label>
            <Input id="edit-income-date" type="date"
              className="bg-paper border-border/50 focus-visible:ring-ink"
              value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1 border-border/50 text-ink bg-transparent" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 bg-teal hover:bg-teal/90 text-white font-medium" onClick={handleSave}
            disabled={!amount || !date || updateIncome.isPending}>
            {updateIncome.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
