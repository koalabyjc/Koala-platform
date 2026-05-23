/* ============================================
   KOALA — Formatters
   Currency, number, date formatting utilities
   ============================================ */

/**
 * Format number as USD currency
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format number with comma separators
 */
export function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Format compact number (e.g., 1.2K, 3.5M)
 */
export function formatCompact(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
  return num.toString();
}

/**
 * Format percentage
 */
export function formatPercent(value) {
  return `${Math.abs(value)}%`;
}

/**
 * Format relative time (e.g., "Hoy", "2 días", "3 días")
 */
export function formatRelativeTime(dateInput) {
  const date = new Date(dateInput);
  
  if (isNaN(date.getTime())) {
    const daysAgo = Number(dateInput);
    if (daysAgo === 0) return 'Hoy';
    if (daysAgo === 1) return '1 día';
    return `${daysAgo} días`;
  }
  
  const today = new Date();
  const diffTime = Math.abs(today - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
  
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return '1 día';
  return `${diffDays} días`;
}
