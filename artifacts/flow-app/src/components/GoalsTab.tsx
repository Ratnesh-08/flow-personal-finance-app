import React, { useState } from 'react';
import { useListSavingsGoals, useCreateSavingsGoal, useUpdateSavingsGoal, useDeleteSavingsGoal, getListSavingsGoalsQueryKey, useGetDashboard } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrency } from '../hooks/useCurrency';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Check, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

// ── Savings Goals ────────────────────────────────────────────────────────────

function AddGoalSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const queryClient = useQueryClient();
  const createGoal = useCreateSavingsGoal();
  const { symbol } = useCurrency();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');

  const reset = () => { setName(''); setTarget(''); setCurrent(''); setDeadline(''); setError(''); };

  const handleSave = () => {
    if (!name.trim()) { setError('Name is required'); return; }
    if (!target || Number(target) <= 0) { setError('Target amount must be greater than 0'); return; }
    setError('');
    createGoal.mutate(
      { data: { name: name.trim(), targetAmount: Number(target), currentAmount: Number(current) || 0, deadline: deadline || undefined } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSavingsGoalsQueryKey() });
          toast({ description: 'Goal created.' });
          reset(); onOpenChange(false);
        },
        onError: () => toast({ description: 'Failed to create goal.', variant: 'destructive' })
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <SheetContent side="bottom" className="rounded-t-2xl bg-paper-raised border-border px-6 py-6 font-sans">
        <SheetHeader className="mb-6 text-left">
          <SheetTitle className="font-serif text-2xl text-ink">New Savings Goal</SheetTitle>
          <SheetDescription className="text-gray font-sans text-sm">Set a target and track your progress.</SheetDescription>
        </SheetHeader>
        {error && <p className="text-coral text-sm mb-4">{error}</p>}
        <div className="space-y-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="goal-name" className="font-mono text-xs uppercase text-gray">Goal Name</Label>
            <Input id="goal-name" placeholder="e.g. Emergency Fund" className="bg-paper border-border/50 focus-visible:ring-ink" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal-target" className="font-mono text-xs uppercase text-gray">Target Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray">{symbol}</span>
              <Input id="goal-target" type="number" min="1" step="1" placeholder="0" className="pl-7 bg-paper border-border/50 focus-visible:ring-ink" value={target} onChange={(e) => setTarget(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal-current" className="font-mono text-xs uppercase text-gray">Already Saved (optional)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray">{symbol}</span>
              <Input id="goal-current" type="number" min="0" step="1" placeholder="0" className="pl-7 bg-paper border-border/50 focus-visible:ring-ink" value={current} onChange={(e) => setCurrent(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal-deadline" className="font-mono text-xs uppercase text-gray">Target Date (optional)</Label>
            <Input id="goal-deadline" type="date" className="bg-paper border-border/50 focus-visible:ring-ink" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1 border-border/50 text-ink bg-transparent" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="flex-1 bg-teal hover:bg-teal/90 text-white font-medium" onClick={handleSave} disabled={!name || !target || createGoal.isPending}>
            {createGoal.isPending ? 'Saving...' : 'Create Goal'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function GoalCard({ goal, onAddProgress }: { goal: { id: number; name: string; targetAmount: number; currentAmount: number; deadline: string | null; completed: boolean }; onAddProgress: (id: number, amount: number) => void }) {
  const queryClient = useQueryClient();
  const deleteGoal = useDeleteSavingsGoal();
  const updateGoal = useUpdateSavingsGoal();
  const { formatAmount } = useCurrency();
  const { toast } = useToast();
  const [addingProgress, setAddingProgress] = useState(false);
  const [progressAmount, setProgressAmount] = useState('');

  const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;

  const daysRemaining = (() => {
    if (!goal.deadline) return null;
    const diff = new Date(goal.deadline + 'T00:00:00').getTime() - Date.now();
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
  })();

  const handleDelete = () => {
    deleteGoal.mutate({ id: goal.id }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListSavingsGoalsQueryKey() }); toast({ description: 'Goal removed.' }); },
    });
  };

  const handleToggleComplete = () => {
    updateGoal.mutate({ id: goal.id, data: { completed: !goal.completed, currentAmount: !goal.completed ? goal.targetAmount : goal.currentAmount } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListSavingsGoalsQueryKey() }),
    });
  };

  const handleSaveProgress = () => {
    const newAmount = goal.currentAmount + Number(progressAmount);
    updateGoal.mutate({ id: goal.id, data: { currentAmount: newAmount, completed: newAmount >= goal.targetAmount } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSavingsGoalsQueryKey() });
        setProgressAmount(''); setAddingProgress(false);
        toast({ description: 'Progress updated.' });
      }
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`bg-paper-raised border rounded-2xl p-5 shadow-sm ${goal.completed ? 'border-teal/50 bg-teal/5' : 'border-border/50'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-sans text-ink font-medium">{goal.name}</h3>
          {daysRemaining !== null && !goal.completed && (
            <p className="font-mono text-[10px] text-gray mt-0.5">
              {daysRemaining === 0 ? 'Due today' : `${daysRemaining}d remaining`}
            </p>
          )}
          {goal.completed && <p className="font-mono text-[10px] text-teal mt-0.5 uppercase tracking-wider">Completed</p>}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleToggleComplete} className={`p-1.5 rounded-full transition-colors ${goal.completed ? 'text-teal bg-teal/10' : 'text-gray hover:text-teal'}`} aria-label={goal.completed ? 'Mark incomplete' : 'Mark complete'}>
            <Check className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleDelete} className="p-1.5 rounded-full text-gray hover:text-coral transition-colors" aria-label="Delete goal">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex justify-between items-baseline mb-2">
        <span className="font-mono text-sm text-ink">{formatAmount(goal.currentAmount)}</span>
        <span className="font-mono text-xs text-gray">{pct}% of {formatAmount(goal.targetAmount)}</span>
      </div>

      <div className="h-2 bg-border/30 rounded-full overflow-hidden mb-3">
        <div className="h-full bg-gold rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
      </div>

      {!goal.completed && (
        <AnimatePresence>
          {addingProgress ? (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex gap-2">
              <Input type="number" min="1" placeholder="Amount to add" className="flex-1 h-8 text-sm bg-paper border-border/50 focus-visible:ring-teal" value={progressAmount} onChange={(e) => setProgressAmount(e.target.value)} />
              <Button size="sm" className="h-8 bg-teal text-white hover:bg-teal/90 text-xs" onClick={handleSaveProgress} disabled={!progressAmount || updateGoal.isPending}>Add</Button>
              <Button size="sm" variant="outline" className="h-8 text-xs border-border/50" onClick={() => { setAddingProgress(false); setProgressAmount(''); }}>Cancel</Button>
            </motion.div>
          ) : (
            <button onClick={() => setAddingProgress(true)} className="font-mono text-[10px] uppercase text-gray hover:text-ink transition-colors tracking-wider">
              + Add progress
            </button>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}

// ── What If Simulator ─────────────────────────────────────────────────────────

function WhatIfSimulator() {
  const { data: dashboard } = useGetDashboard();
  const { formatAmount } = useCurrency();

  const baseline = dashboard?.baselineIncome || 0;
  const bills = dashboard?.totalBills || 0;
  const bufferPct = dashboard?.bufferPct || 0.2;

  const [incomeAdj, setIncomeAdj] = useState(0);
  const [billsAdj, setBillsAdj] = useState(0);

  const simIncome = Math.max(0, baseline + incomeAdj);
  const simBills = Math.max(0, bills + billsAdj);
  const simBuffer = simIncome * bufferPct;
  const simSafe = Math.max(0, simIncome - simBills - simBuffer);
  const currentSafe = Math.max(0, baseline - bills - (baseline * bufferPct));
  const delta = simSafe - currentSafe;

  return (
    <div className="bg-paper-raised border border-border/50 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <SlidersHorizontal className="w-4 h-4 text-gray" />
        <h3 className="font-mono text-xs uppercase tracking-wider text-gray">What If Simulator</h3>
      </div>

      <p className="font-sans text-sm text-gray/80 mb-5 leading-relaxed">
        Drag the sliders to explore how income or expense changes affect your safe-to-spend.
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between mb-1.5">
            <Label className="font-mono text-xs text-gray uppercase">Income Change</Label>
            <span className={`font-mono text-xs ${incomeAdj >= 0 ? 'text-teal' : 'text-coral'}`}>
              {incomeAdj >= 0 ? '+' : ''}{formatAmount(incomeAdj)}
            </span>
          </div>
          <input type="range" min={-baseline} max={baseline} step={50} value={incomeAdj}
            onChange={(e) => setIncomeAdj(Number(e.target.value))}
            className="w-full accent-teal cursor-pointer"
            aria-label="Adjust income" />
          <div className="flex justify-between mt-1">
            <span className="font-mono text-[9px] text-gray/60">-{formatAmount(baseline)}</span>
            <span className="font-mono text-[9px] text-gray/60">+{formatAmount(baseline)}</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1.5">
            <Label className="font-mono text-xs text-gray uppercase">Bills Change</Label>
            <span className={`font-mono text-xs ${billsAdj <= 0 ? 'text-teal' : 'text-coral'}`}>
              {billsAdj >= 0 ? '+' : ''}{formatAmount(billsAdj)}
            </span>
          </div>
          <input type="range" min={-bills} max={bills > 0 ? bills : 1000} step={25} value={billsAdj}
            onChange={(e) => setBillsAdj(Number(e.target.value))}
            className="w-full accent-coral cursor-pointer"
            aria-label="Adjust bills" />
          <div className="flex justify-between mt-1">
            <span className="font-mono text-[9px] text-gray/60">-{formatAmount(bills)}</span>
            <span className="font-mono text-[9px] text-gray/60">+{formatAmount(bills > 0 ? bills : 1000)}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-dashed border-border/50 pt-4 space-y-3">
        <div className="flex justify-between">
          <span className="font-mono text-[10px] text-gray uppercase">Simulated Income</span>
          <span className="font-mono text-sm text-ink">{formatAmount(simIncome)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-mono text-[10px] text-gray uppercase">Simulated Bills</span>
          <span className="font-mono text-sm text-ink">{formatAmount(simBills)}</span>
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-dashed border-border/30">
          <span className="font-mono text-[10px] text-gray uppercase">New Safe to Spend</span>
          <div className="text-right">
            <span className="font-serif text-xl text-ink block">{formatAmount(simSafe)}</span>
            {delta !== 0 && (
              <span className={`font-mono text-[10px] ${delta > 0 ? 'text-teal' : 'text-coral'}`}>
                {delta > 0 ? '+' : ''}{formatAmount(delta)} vs current
              </span>
            )}
          </div>
        </div>
      </div>

      {incomeAdj !== 0 || billsAdj !== 0 ? (
        <button onClick={() => { setIncomeAdj(0); setBillsAdj(0); }} className="mt-4 font-mono text-[10px] uppercase text-gray hover:text-ink transition-colors tracking-wider">
          Reset sliders
        </button>
      ) : null}
    </div>
  );
}

// ── Tab root ──────────────────────────────────────────────────────────────────

export default function GoalsTab() {
  const { data: goals = [], isLoading } = useListSavingsGoals();
  const [addOpen, setAddOpen] = useState(false);
  const { formatAmount } = useCurrency();

  const active = goals.filter(g => !g.completed);
  const done = goals.filter(g => g.completed);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-3xl text-ink">Goals</h2>
          <p className="font-sans text-sm text-gray mt-1">Track savings targets and simulate scenarios.</p>
        </div>
        <button onClick={() => setAddOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gold text-white shadow-sm hover:bg-gold/90 transition-colors"
          aria-label="Add savings goal">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Active Goals */}
      {isLoading ? (
        <div className="text-sm text-gray italic font-sans">Loading...</div>
      ) : active.length === 0 && done.length === 0 ? (
        <div className="bg-paper-raised border border-border/50 rounded-2xl p-8 text-center">
          <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3">
            <Plus className="w-5 h-5 text-gold" />
          </div>
          <p className="font-sans text-ink font-medium mb-1">No goals yet</p>
          <p className="font-mono text-xs text-gray">Set a savings target to start tracking your progress.</p>
        </div>
      ) : (
        <AnimatePresence>
          {active.map(goal => (
            <GoalCard key={goal.id} goal={{ ...goal, currentAmount: Number(goal.currentAmount), targetAmount: Number(goal.targetAmount), deadline: goal.deadline ?? null }} onAddProgress={() => {}} />
          ))}
        </AnimatePresence>
      )}

      {done.length > 0 && (
        <div>
          <p className="font-mono text-[10px] uppercase text-gray tracking-wider mb-3">Completed</p>
          <AnimatePresence>
            {done.map(goal => (
              <GoalCard key={goal.id} goal={{ ...goal, currentAmount: Number(goal.currentAmount), targetAmount: Number(goal.targetAmount), deadline: goal.deadline ?? null }} onAddProgress={() => {}} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* What If Simulator */}
      <WhatIfSimulator />

      <AddGoalSheet open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
