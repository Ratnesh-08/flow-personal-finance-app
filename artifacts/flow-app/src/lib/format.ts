export function formatCurrency(amount: number): string {
  // no decimal for whole numbers, $ prefix, commas for thousands
  const floored = Math.floor(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(floored);
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  // dateString from API is typically YYYY-MM-DD. 
  // Parse by splitting so it uses local timezone equivalent of that calendar date, avoiding -1 day offset bugs.
  const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}
