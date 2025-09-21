// File: src/utils/format.ts
export const formatCurrency = (value: number, currency: 'USD' | 'EUR' = 'USD'): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: value > 100 ? 0 : 2,
  }).format(value);

export const formatPercent = (value: number): string =>
  `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

export const formatCompactNumber = (value: number): string =>
  new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

export const formatDateTime = (timestamp: number): string =>
  new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  }).format(new Date(timestamp));
