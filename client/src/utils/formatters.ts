// Utility functions for formatting data

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // If number starts with 0, replace with +92
  if (cleaned.startsWith('0')) {
    return '+92' + cleaned.substring(1);
  }
  
  // If number starts with 92, add +
  if (cleaned.startsWith('92')) {
    return '+' + cleaned;
  }
  
  // If number doesn't start with country code, add +92
  if (!cleaned.startsWith('92')) {
    return '+92' + cleaned;
  }
  
  return '+' + cleaned;
}

export function formatQuantity(quantity: number, unit: string = 'liters'): string {
  return `${quantity.toLocaleString()} ${unit}`;
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}