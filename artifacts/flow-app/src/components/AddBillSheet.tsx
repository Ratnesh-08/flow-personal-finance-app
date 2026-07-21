import React, { useState, useEffect } from 'react';
import { useCreateBill, getListBillsQueryKey, getGetDashboardQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AddBillSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const queryClient = useQueryClient();
  const createBill = useCreateBill();
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (open) {
      setAmount('');
      setName('');
    }
  }, [open]);

  const handleSave = () => {
    if (!amount || !name) return;
    createBill.mutate(
      { data: { amount: Number(amount), name } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListBillsQueryKey() });
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
          <SheetTitle className="font-serif text-2xl text-ink">Add Fixed Bill</SheetTitle>
          <SheetDescription className="text-gray font-sans text-sm">
            Add a monthly recurring expense.
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="bill-name" className="font-mono text-xs uppercase text-gray">Bill Name</Label>
            <Input
              id="bill-name"
              placeholder="e.g. Rent, Internet"
              className="bg-paper border-border/50 focus-visible:ring-ink"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bill-amount" className="font-mono text-xs uppercase text-gray">Monthly Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray">$</span>
              <Input
                id="bill-amount"
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
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1 border-border/50 text-ink bg-transparent" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            className="flex-1 bg-coral hover:bg-coral/90 text-white font-medium" 
            onClick={handleSave}
            disabled={!amount || !name || createBill.isPending}
          >
            {createBill.isPending ? 'Saving...' : 'Save Bill'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
