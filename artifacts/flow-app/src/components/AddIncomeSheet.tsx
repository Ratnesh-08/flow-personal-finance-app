import React, { useState, useEffect } from 'react';
import { useCreateIncome, getListIncomeQueryKey, getGetDashboardQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { INCOME_CATEGORIES } from '../lib/categories';
import { useCurrency } from '../hooks/useCurrency';

export default function AddIncomeSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const queryClient = useQueryClient();
  const createIncome = useCreateIncome();
  const { symbol } = useCurrency();
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [category, setCategory] = useState(INCOME_CATEGORIES[0].value);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (open) {
      setAmount('');
      setSource('');
      setCategory(INCOME_CATEGORIES[0].value);
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [open]);

  const handleSave = () => {
    if (!amount || !date) return;
    createIncome.mutate(
      { data: { amount: Number(amount), source, date, category } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListIncomeQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
          onOpenChange(false);
        }
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl bg-paper-raised border-border px-6 py-6 font-sans">
        <SheetHeader className="mb-6 text-left">
          <SheetTitle className="font-serif text-2xl text-ink">Add Income</SheetTitle>
          <SheetDescription className="text-gray font-sans text-sm">
            Log your latest freelance payment or paycheck.
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="income-amount" className="font-mono text-xs uppercase text-gray">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray">{symbol}</span>
              <Input
                id="income-amount"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                className="pl-7 bg-paper border-border/50 focus-visible:ring-ink"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="income-source" className="font-mono text-xs uppercase text-gray">Source (Optional)</Label>
            <Input
              id="income-source"
              placeholder="e.g. Acme Corp"
              className="bg-paper border-border/50 focus-visible:ring-ink"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="income-category" className="font-mono text-xs uppercase text-gray">Category</Label>
            <select
              id="income-category"
              className="flex h-10 w-full rounded-md border border-border/50 bg-paper px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {INCOME_CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="income-date" className="font-mono text-xs uppercase text-gray">Date</Label>
            <Input
              id="income-date"
              type="date"
              className="bg-paper border-border/50 focus-visible:ring-ink"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1 border-border/50 text-ink bg-transparent" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            className="flex-1 bg-teal hover:bg-teal/90 text-white font-medium" 
            onClick={handleSave}
            disabled={!amount || !date || createIncome.isPending}
          >
            {createIncome.isPending ? 'Saving...' : 'Save Income'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
