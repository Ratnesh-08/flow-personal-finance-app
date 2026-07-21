import React from 'react';
import { useListIncome, useListBills, useDeleteIncome, useDeleteBill, getListIncomeQueryKey, getListBillsQueryKey, getGetDashboardQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { formatCurrency, formatDate } from '../lib/format';
import { Trash2 } from 'lucide-react';

export function InlineIncomeList() {
  const { data: income = [] } = useListIncome();
  const deleteIncome = useDeleteIncome();
  const queryClient = useQueryClient();

  const handleDelete = (id: number) => {
    deleteIncome.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListIncomeQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      }
    });
  };

  if (income.length === 0) {
    return <div className="text-gray italic text-sm font-sans mb-4">No income entries yet.</div>;
  }

  return (
    <div className="flex flex-col gap-2 mb-4">
      {income.map(entry => (
        <div key={entry.id} className="flex items-center justify-between py-2 border-b border-border/50 border-dashed last:border-0">
          <div className="flex flex-col">
            <span className="font-sans text-ink">{entry.source || 'Income'}</span>
            <span className="font-mono text-xs text-gray">{formatDate(entry.date)}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-teal font-medium">+{formatCurrency(entry.amount)}</span>
            <button 
              onClick={() => handleDelete(entry.id)} 
              className="text-gray hover:text-coral transition-colors p-1"
              disabled={deleteIncome.isPending}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function InlineBillsList() {
  const { data: bills = [] } = useListBills();
  const deleteBill = useDeleteBill();
  const queryClient = useQueryClient();

  const handleDelete = (id: number) => {
    deleteBill.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBillsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      }
    });
  };

  if (bills.length === 0) {
    return <div className="text-gray italic text-sm font-sans mb-4">No bills added yet.</div>;
  }

  return (
    <div className="flex flex-col gap-2 mb-4">
      {bills.map(bill => (
        <div key={bill.id} className="flex items-center justify-between py-2 border-b border-border/50 border-dashed last:border-0">
          <div className="flex flex-col">
            <span className="font-sans text-ink">{bill.name}</span>
            <span className="font-mono text-xs text-gray">monthly</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-coral font-medium">-{formatCurrency(bill.amount)}</span>
            <button 
              onClick={() => handleDelete(bill.id)} 
              className="text-gray hover:text-coral transition-colors p-1"
              disabled={deleteBill.isPending}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
