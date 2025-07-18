import type { FirebaseMilkTransaction, FirebasePayment } from '@/services/firebase-realtime';

export function calculateVendorBalance(
  vendorId: string,
  transactions: FirebaseMilkTransaction[],
  payments: FirebasePayment[]
): number {
  // Calculate total milk amount from transactions
  const totalMilkAmount = transactions
    .filter(t => t.vendorId === vendorId && t.type === 'receive')
    .reduce((sum, t) => sum + (t.totalAmount || 0), 0);

  // Calculate total payments made to vendor
  const totalPayments = payments
    .filter(p => p.vendorId === vendorId && p.type === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  // Balance = Total milk amount - Total payments
  return totalMilkAmount - totalPayments;
}

export function calculateCustomerBalance(
  customerId: string,
  transactions: FirebaseMilkTransaction[],
  payments: FirebasePayment[]
): number {
  // Calculate total milk amount from transactions
  const totalMilkAmount = transactions
    .filter(t => t.customerId === customerId && t.type === 'send')
    .reduce((sum, t) => sum + (t.totalAmount || 0), 0);

  // Calculate total payments received from customer
  const totalPayments = payments
    .filter(p => p.customerId === customerId && p.type === 'received')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  // Balance = Total milk amount - Total payments
  return totalMilkAmount - totalPayments;
}