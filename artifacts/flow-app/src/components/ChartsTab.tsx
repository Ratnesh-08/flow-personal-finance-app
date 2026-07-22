import React from 'react';
import { useGetMonthlyAnalytics, useListBills } from '@workspace/api-client-react';
import { useCurrency } from '../hooks/useCurrency';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Loader2 } from 'lucide-react';
import { BILL_CATEGORIES, getCategoryColor } from '../lib/categories';

export default function ChartsTab() {
  const { data: analytics, isLoading: analyticsLoading } = useGetMonthlyAnalytics();
  const { data: bills = [], isLoading: billsLoading } = useListBills();
  const { formatAmount } = useCurrency();

  if (analyticsLoading || billsLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-ink/20" />
      </div>
    );
  }

  // Calculate Category Breakdown
  const categoryTotals = bills.reduce((acc, bill) => {
    const cat = bill.category || 'other';
    acc[cat] = (acc[cat] || 0) + bill.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryBreakdown = Object.entries(categoryTotals)
    .map(([cat, amount]) => ({
      name: BILL_CATEGORIES.find(c => c.value === cat)?.label || cat,
      amount,
      color: getCategoryColor('bill', cat)
    }))
    .sort((a, b) => b.amount - a.amount);

  const maxCategoryAmount = Math.max(...categoryBreakdown.map(c => c.amount), 1);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-3xl text-ink mb-1">Charts</h2>
        <p className="font-sans text-sm text-gray mb-8">Visualize your cash flow.</p>
      </div>

      {/* Monthly Cash Flow Chart */}
      <div className="bg-paper-raised border border-border/50 rounded-2xl p-5 shadow-sm">
        <div className="mb-6">
          <h3 className="font-mono text-xs uppercase tracking-wider text-gray">Income vs Bills</h3>
        </div>
        
        {(!analytics || analytics.length === 0) ? (
          <div className="h-[220px] flex items-center justify-center text-sm italic text-gray">
            Not enough data yet.
          </div>
        ) : (
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis 
                  dataKey="label" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'var(--gray)', fontFamily: 'var(--font-mono)' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'var(--gray)', fontFamily: 'var(--font-mono)' }}
                  tickFormatter={(val) => formatAmount(val)}
                />
                <Tooltip 
                  cursor={{ fill: 'var(--border)', opacity: 0.2 }}
                  contentStyle={{ backgroundColor: 'var(--paper-raised)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--ink)', fontFamily: 'var(--font-sans)' }}
                  itemStyle={{ fontFamily: 'var(--font-mono)' }}
                  formatter={(value: number) => [formatAmount(value), undefined]}
                />
                <Bar dataKey="income" name="Income" fill="#2F6E63" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="bills" name="Bills" fill="#C1584A" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      <div className="bg-paper-raised border border-border/50 rounded-2xl p-5 shadow-sm">
        <div className="mb-6">
          <h3 className="font-mono text-xs uppercase tracking-wider text-gray">Bill Breakdown</h3>
        </div>

        {categoryBreakdown.length === 0 ? (
          <div className="text-sm italic text-gray">No bills categorized yet.</div>
        ) : (
          <div className="space-y-4">
            {categoryBreakdown.map((cat, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-sans text-sm text-ink">{cat.name}</span>
                  <span className="font-mono text-xs text-gray">{formatAmount(cat.amount)}</span>
                </div>
                <div className="h-2 bg-border/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${(cat.amount / maxCategoryAmount) * 100}%`,
                      backgroundColor: cat.color 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
