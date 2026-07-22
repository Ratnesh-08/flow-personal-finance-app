export const INCOME_CATEGORIES = [
  { value: 'freelance', label: 'Freelance', color: '#2F6E63' }, // teal
  { value: 'salary', label: 'Salary', color: '#2F6E63' },
  { value: 'investment', label: 'Investment', color: '#C9A227' }, // gold
  { value: 'other', label: 'Other', color: '#8B9098' }, // gray
];

export const BILL_CATEGORIES = [
  { value: 'housing', label: 'Housing', color: '#C1584A' }, // coral
  { value: 'food', label: 'Food', color: '#C9A227' }, // gold
  { value: 'transport', label: 'Transport', color: '#2F6E63' }, // teal
  { value: 'shopping', label: 'Shopping', color: '#8B9098' }, // gray
  { value: 'entertainment', label: 'Entertainment', color: '#7C5CBF' }, // purple (using custom hex inline)
  { value: 'healthcare', label: 'Healthcare', color: '#C1584A' },
  { value: 'education', label: 'Education', color: '#C9A227' },
  { value: 'travel', label: 'Travel', color: '#2F6E63' },
  { value: 'investments', label: 'Investments', color: '#C9A227' },
  { value: 'miscellaneous', label: 'Misc', color: '#8B9098' },
];

export function getCategoryColor(type: 'income' | 'bill', value: string) {
  const cats = type === 'income' ? INCOME_CATEGORIES : BILL_CATEGORIES;
  return cats.find((c) => c.value === value)?.color || '#8B9098';
}
