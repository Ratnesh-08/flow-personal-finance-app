import React, { useEffect, useState } from 'react';
import { useGetDashboard } from '@workspace/api-client-react';
import { formatDate } from '../lib/format';
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useCurrency } from '../hooks/useCurrency';
import { useCountUp } from '../hooks/useCountUp';
import { motion } from 'framer-motion';

const HEALTH_CONFIG = {
  excellent: { label: 'Excellent', color: '#2F6E63', bg: 'bg-teal/10' },
  good: { label: 'Good', color: '#C9A227', bg: 'bg-gold/10' },
  fair: { label: 'Fair', color: '#C9A227', bg: 'bg-gold/10' },
  tight: { label: 'Tight', color: '#C1584A', bg: 'bg-coral/10' },
};

export default function HomeTab() {
  const { data: dashboard, isLoading } = useGetDashboard();
  const { formatAmount } = useCurrency();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const safeToSpendAnimated = useCountUp(dashboard?.safeToSpend || 0);
  const progressPct = Math.min(100, Math.round(((dashboard?.bufferBalance || 0) / Math.max(dashboard?.bufferGoal || 1, 0.01)) * 100));

  if (isLoading || !dashboard) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-ink/20" />
      </div>
    );
  }

  const insights = dashboard.insights;
  const health = insights?.budgetHealth ? HEALTH_CONFIG[insights.budgetHealth as keyof typeof HEALTH_CONFIG] : null;

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">

      {/* Safe to Spend Hero */}
      <motion.div variants={item} className="bg-paper-raised border border-border/50 rounded-2xl p-6 shadow-sm">
        <div className="text-center mb-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-gray mb-2">Safe to Spend</div>
          <div
            className="font-serif text-[3.5rem] leading-none text-ink tracking-tight mb-1"
            aria-live="polite"
            aria-atomic="true"
          >
            {formatAmount(safeToSpendAnimated)}
          </div>
          {health && (
            <div className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full ${health.bg}`}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: health.color }} />
              <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: health.color }}>{health.label}</span>
            </div>
          )}
        </div>

        <div className="border-t border-dashed border-border/50 pt-4 flex justify-around">
          <div className="text-center">
            <div className="font-mono text-[10px] uppercase text-gray mb-0.5">Income</div>
            <div className="font-sans text-sm text-ink">{formatAmount(dashboard.baselineIncome)}</div>
          </div>
          <div className="w-px bg-border/50" />
          <div className="text-center">
            <div className="font-mono text-[10px] uppercase text-gray mb-0.5">Bills</div>
            <div className="font-sans text-sm text-ink">{formatAmount(dashboard.totalBills)}</div>
          </div>
          <div className="w-px bg-border/50" />
          <div className="text-center">
            <div className="font-mono text-[10px] uppercase text-gray mb-0.5">Buffer</div>
            <div className="font-sans text-sm text-ink">{Math.round((dashboard.bufferPct || 0) * 100)}%</div>
          </div>
        </div>
      </motion.div>

      {/* Cushion Buffer */}
      <motion.div variants={item} className="bg-paper-raised border border-border/50 rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-baseline mb-2">
          <h3 className="font-sans text-sm text-ink font-medium">Cushion Buffer</h3>
          <span className="font-mono text-[10px] text-gray">
            {formatAmount(dashboard.bufferBalance)} / {formatAmount(dashboard.bufferGoal)}
          </span>
        </div>
        <div className="flex justify-end mb-1">
          <span className="font-mono text-[10px] text-teal font-medium">{progressPct}%</span>
        </div>
        <div className="h-2.5 bg-border/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal rounded-full transition-all duration-1000 ease-out"
            style={{ width: mounted ? `${progressPct}%` : '0%' }}
          />
        </div>
        <p className="font-mono text-[10px] text-gray uppercase tracking-wider mt-2">
          Targeting {dashboard.bufferGoalMonths}× baseline monthly income
        </p>
      </motion.div>

      {/* Insights Grid */}
      {insights && (
        <motion.div variants={item} className="grid grid-cols-2 gap-3">
          <div className="bg-paper-raised border border-border/50 rounded-xl p-4 shadow-sm">
            <div className="font-mono text-[10px] text-gray uppercase tracking-wider mb-1">Daily Budget</div>
            <div className="font-serif text-2xl text-ink">{formatAmount(insights.dailyBudget)}</div>
            <div className="font-mono text-[10px] text-gray mt-0.5">per day remaining</div>
          </div>
          <div className="bg-paper-raised border border-border/50 rounded-xl p-4 shadow-sm">
            <div className="font-mono text-[10px] text-gray uppercase tracking-wider mb-1">Days Left</div>
            <div className="font-serif text-2xl text-ink">{insights.daysRemainingInMonth}</div>
            <div className="font-mono text-[10px] text-gray mt-0.5">in this month</div>
          </div>
          <div className="bg-paper-raised border border-border/50 rounded-xl p-4 shadow-sm">
            <div className="font-mono text-[10px] text-gray uppercase tracking-wider mb-1">Savings Rate</div>
            <div className="font-serif text-2xl text-gold">{Math.round(insights.savingsPct)}%</div>
            <div className="font-mono text-[10px] text-gray mt-0.5">of income buffered</div>
          </div>
          <div className="bg-paper-raised border border-border/50 rounded-xl p-4 shadow-sm">
            <div className="font-mono text-[10px] text-gray uppercase tracking-wider mb-1">Committed</div>
            <div className="font-serif text-2xl text-coral">{Math.round(insights.spendingRate)}%</div>
            <div className="font-mono text-[10px] text-gray mt-0.5">of income to bills</div>
          </div>
        </motion.div>
      )}

      {/* Recent Activity */}
      <motion.div variants={item}>
        <h3 className="font-mono text-[10px] uppercase tracking-wider text-gray mb-3 px-1">Recent Activity</h3>
        <div className="bg-paper-raised border border-border/50 rounded-xl overflow-hidden shadow-sm">
          {dashboard.recentActivity.length === 0 ? (
            <div className="py-8 text-center">
              <p className="font-sans text-sm text-gray">No activity yet.</p>
              <p className="font-mono text-[10px] text-gray/60 mt-1 uppercase tracking-wider">Add income or bills to get started</p>
            </div>
          ) : (
            dashboard.recentActivity.map((item, idx) => (
              <div
                key={`${item.type}-${item.id}-${idx}`}
                className="flex justify-between items-center py-3 px-4 border-b border-border/40 border-dashed last:border-0 hover:bg-paper/50 transition-colors"
              >
                <div className="flex flex-col min-w-0">
                  <span className="font-sans text-ink text-sm truncate">{item.label}</span>
                  <span className="font-mono text-[10px] text-gray mt-0.5">
                    {item.date ? formatDate(item.date) : 'Monthly'}
                  </span>
                </div>
                <div className={`font-mono text-sm ml-3 flex-shrink-0 ${item.type === 'income' ? 'text-teal' : 'text-coral'}`}>
                  {item.type === 'income' ? '+' : '-'}{formatAmount(item.amount)}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
