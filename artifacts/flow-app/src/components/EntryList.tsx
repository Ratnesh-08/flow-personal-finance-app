import React from 'react';
import { useDeleteIncome, useDeleteBill, getListIncomeQueryKey, getListBillsQueryKey, getGetDashboardQueryKey } from '@workspace/api-client-react';
import type { IncomeEntry, Bill } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { formatDate } from '../lib/format';
import { Trash2, Pencil } from 'lucide-react';
import { useCurrency } from '../hooks/useCurrency';
import { getCategoryColor } from '../lib/categories';
import { useToast } from '@/hooks/use-toast';

interface InlineIncomeListProps {
  data: IncomeEntry[];
  onEdit?: (entry: IncomeEntry) => void;
}

export function InlineIncomeList({ data: income, onEdit }: InlineIncomeListProps) {
  const deleteIncome = useDeleteIncome();
  const queryClient = useQueryClient();
  const { formatAmount } = useCurrency();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    deleteIncome.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListIncomeQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
        toast({ description: 'Entry deleted.' });
      },
      onError: () => toast({ description: 'Failed to delete.', variant: 'destructive' }),
    });
  };

  if (income.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="font-sans text-sm text-gray">No income entries found.</p>
        <p className="font-mono text-[10px] text-gray/60 mt-1 uppercase tracking-wider">Add your first income above</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {income.map(entry => (
        <div key={entry.id} className="flex items-center justify-between py-2.5 border-b border-border/50 border-dashed last:border-0 group rounded-lg hover:bg-paper/60 transition-colors px-1">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: getCategoryColor('income', entry.category || '') }}
              aria-hidden="true"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-sans text-ink text-sm truncate">{entry.source || 'Income'}</span>
              <span className="font-mono text-[10px] text-gray">{formatDate(entry.date)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="font-mono text-sm text-teal font-medium">+{formatAmount(entry.amount)}</span>
            {onEdit && (
              <button
                onClick={() => onEdit(entry)}
                className="text-gray hover:text-ink transition-colors p-1.5 opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Edit entry"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => handleDelete(entry.id)}
              className="text-gray hover:text-coral transition-colors p-1.5 opacity-0 group-hover:opacity-100 focus:opacity-100"
              disabled={deleteIncome.isPending}
              aria-label="Delete entry"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

interface InlineBillsListProps {
  data: Bill[];
  onEdit?: (bill: Bill) => void;
}

export function InlineBillsList({ data: bills, onEdit }: InlineBillsListProps) {
  const deleteBill = useDeleteBill();
  const queryClient = useQueryClient();
  const { formatAmount } = useCurrency();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    deleteBill.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBillsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
        toast({ description: 'Bill deleted.' });
      },
      onError: () => toast({ description: 'Failed to delete.', variant: 'destructive' }),
    });
  };

  if (bills.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="font-sans text-sm text-gray">No bills found.</p>
        <p className="font-mono text-[10px] text-gray/60 mt-1 uppercase tracking-wider">Add your first bill above</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {bills.map(bill => (
        <div key={bill.id} className="flex items-center justify-between py-2.5 border-b border-border/50 border-dashed last:border-0 group rounded-lg hover:bg-paper/60 transition-colors px-1">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: getCategoryColor('bill', bill.category || '') }}
              aria-hidden="true"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-sans text-ink text-sm truncate">{bill.name}</span>
              <span className="font-mono text-[10px] text-gray">monthly</span>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="font-mono text-sm text-coral font-medium">-{formatAmount(bill.amount)}</span>
            {onEdit && (
              <button
                onClick={() => onEdit(bill)}
                className="text-gray hover:text-ink transition-colors p-1.5 opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Edit bill"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => handleDelete(bill.id)}
              className="text-gray hover:text-coral transition-colors p-1.5 opacity-0 group-hover:opacity-100 focus:opacity-100"
              disabled={deleteBill.isPending}
              aria-label="Delete bill"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
