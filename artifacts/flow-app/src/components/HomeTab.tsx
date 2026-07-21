import React from 'react';
import { useGetDashboard } from '@workspace/api-client-react';
import { formatCurrency, formatDate } from '../lib/format';
import { Loader2 } from 'lucide-react';

export default function HomeTab() {
  const { data: dashboard, isLoading } = useGetDashboard();

  if (isLoading || !dashboard) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-ink/20" />
      </div>
    );
  }

  const progressPct = Math.min(100, Math.round((dashboard.bufferBalance / (dashboard.bufferGoal || 1)) * 100));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Safe to Spend Hero */}
      <div className="bg-paper-raised border border-border/50 rounded-2xl p-6 shadow-sm">
        <div className="text-center mb-6">
          <div className="font-mono text-xs uppercase tracking-widest text-gray mb-3">Safe to Spend</div>
          <div className="font-serif text-6xl text-ink tracking-tight mb-1">
            {formatCurrency(dashboard.safeToSpend)}
          </div>
        </div>
        
        <div className="border-t border-dashed border-border/50 pt-4 flex justify-between px-2">
          <div className="text-center">
            <div className="font-mono text-[10px] uppercase text-gray mb-1">Baseline Income</div>
            <div className="font-sans text-sm text-ink">{formatCurrency(dashboard.baselineIncome)}</div>
          </div>
          <div className="text-center">
            <div className="font-mono text-[10px] uppercase text-gray mb-1">Fixed Bills</div>
            <div className="font-sans text-sm text-ink">{formatCurrency(dashboard.totalBills)}</div>
          </div>
        </div>
      </div>

      {/* Cushion Buffer */}
      <div className="bg-paper-raised border border-border/50 rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-baseline mb-3">
          <h3 className="font-sans text-ink font-medium">Cushion Buffer</h3>
          <span className="font-mono text-xs text-gray">
            {formatCurrency(dashboard.bufferBalance)} <span className="text-border mx-1">/</span> {formatCurrency(dashboard.bufferGoal)}
          </span>
        </div>
        <div className="h-2 bg-border/30 rounded-full overflow-hidden mb-3">
          <div 
            className="h-full bg-teal transition-all duration-1000 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="font-mono text-[10px] text-gray uppercase tracking-wider">
          Targeting {dashboard.bufferGoalMonths} months of baseline
        </p>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="font-mono text-xs uppercase tracking-wider text-gray mb-4 px-1">Recent Activity</h3>
        <div className="space-y-1">
          {dashboard.recentActivity.length === 0 ? (
            <p className="text-sm italic text-gray font-sans px-1">No activity yet.</p>
          ) : (
            dashboard.recentActivity.map((item, idx) => (
              <div key={`${item.type}-${item.id}-${idx}`} className="flex justify-between items-center py-2.5 px-2 border-b border-border/50 border-dashed last:border-0 hover:bg-paper-raised transition-colors rounded-md">
                <div className="flex flex-col">
                  <span className="font-sans text-ink text-sm">{item.label}</span>
                  <span className="font-mono text-[10px] text-gray mt-0.5">
                    {item.date ? formatDate(item.date) : 'Monthly'}
                  </span>
                </div>
                <div className={`font-mono text-sm ${item.type === 'income' ? 'text-teal' : 'text-coral'}`}>
                  {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
