import { useState } from 'react';
import { formatCurrency as format } from '../lib/format';

export type Currency = 'USD' | 'INR' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'SGD' | 'JPY';

export const CURRENCIES: Record<Currency, string> = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  SGD: 'S$',
  JPY: '¥',
};

export function useCurrency() {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    return (localStorage.getItem('flow-currency') as Currency) || 'USD';
  });

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem('flow-currency', curr);
  };

  const formatAmount = (amount: number) => {
    return format(amount, currency);
  };

  return { currency, setCurrency, formatAmount, symbol: CURRENCIES[currency] };
}
