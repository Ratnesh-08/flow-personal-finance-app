import React, { useState, useEffect } from 'react';
import { useUpdateBill, getListBillsQueryKey, getGetDashboardQueryKey, Bill } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BILL_CATEGORIES } from '../lib/categories';
import { useCurrency } from '../hooks/useCurrency';
import { useToast } from '@/hooks/use-toast';

interface Props {
  bill: Bill | null;
  onClose: () => void;
}

export default function EditBillSheet({ bill, onClose }: Props) {
  const queryClient = useQueryClient();
  const updateBill = useUpdateBill();
  const { symbol } = useCurrency();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState(BILL_CATEGORIES[0].value);
  const [error, setError] = useState('');

  useEffect(() => {
    if (bill) {
      setAmount(String(bill.amount));
      setName(bill.name || '');
      setCategory(bill.category || BILL_CATEGORIES[0].value);
      setError('');
    }
  }, [bill]);

  const handleSave = () => {
    if (!name.trim()) { setError('Name is required'); return; }
    if (!amount || Number(amount) <= 0) { setError('Amount must be greater than 0'); return; }
    setError('');

    updateBill.mutate(
      { id: bill!.id, data: { amount: Number(amount), name: name.trim(), category } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListBillsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
          toast({ description: 'Bill updated.' });
          onClose();
        },
        onError: () => { toast({ description: 'Failed to update. Please try again.', variant: 'destructive' }); }
      }
    );
  };

  return (
    <Sheet open={!!bill} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl bg-paper-raised border-border px-6 py-6 font-sans">
        <SheetHeader className="mb-6 text-left">
          <SheetTitle className="font-serif text-2xl text-ink">Edit Bill</SheetTitle>
          <SheetDescription className="text-gray font-sans text-sm">Update this bill.</SheetDescription>
        </SheetHeader>

        {error && <p className="text-coral text-sm mb-4 font-sans">{error}</p>}

        <div className="space-y-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="edit-bill-name" className="font-mono text-xs uppercase text-gray">Bill Name</Label>
            <Input id="edit-bill-name" placeholder="e.g. Rent, Internet"
              className="bg-paper border-border/50 focus-visible:ring-ink"
              value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-bill-amount" className="font-mono text-xs uppercase text-gray">Monthly Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray">{symbol}</span>
              <Input id="edit-bill-amount" type="number" min="0.01" step="1" placeholder="0"
                className="pl-7 bg-paper border-border/50 focus-visible:ring-ink"
                value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-bill-category" className="font-mono text-xs uppercase text-gray">Category</Label>
            <select id="edit-bill-category"
              className="flex h-10 w-full rounded-md border border-border/50 bg-paper px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
              value={category} onChange={(e) => setCategory(e.target.value)}>
              {BILL_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1 border-border/50 text-ink bg-transparent" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 bg-coral hover:bg-coral/90 text-white font-medium" onClick={handleSave}
            disabled={!amount || !name || updateBill.isPending}>
            {updateBill.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
