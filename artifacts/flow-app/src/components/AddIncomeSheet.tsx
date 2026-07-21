import React, { useState, useEffect } from 'react';
import { useCreateIncome, getListIncomeQueryKey, getGetDashboardQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AddIncomeSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const queryClient = useQueryClient();
  const createIncome = useCreateIncome();
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (open) {
      setAmount('');
      setSource('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [open]);

  const handleSave = () => {
    if (!amount || !date) return;
    createIncome.mutate(
      { data: { amount: Number(amount), source, date } },
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
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray">$</span>
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
