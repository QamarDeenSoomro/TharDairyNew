import {
  ref,
  push,
  set,
  remove,
  get,
  query,
  orderByChild,
  equalTo,
  onValue,
  serverTimestamp,
} from 'firebase/database';
import { db } from '@/lib/firebase';
import type {
  Vendor,
  Customer,
  MilkTransaction,
  Payment,
  InsertVendor,
  InsertCustomer,
  InsertMilkTransaction,
  InsertPayment
} from '@shared/schema';

// Firebase-compatible types with string IDs
type FirebaseVendor = Omit<Vendor, 'id'> & { id: string };
type FirebaseCustomer = Omit<Customer, 'id'> & { id: string };
type FirebaseMilkTransaction = Omit<MilkTransaction, 'id' | 'vendorId' | 'customerId'> & {
  id: string;
  vendorId: string | null;
  customerId: string | null;
};
type FirebasePayment = Omit<Payment, 'id' | 'vendorId' | 'customerId'> & {
  id: string;
  vendorId: string | null;
  customerId: string | null;
};

// Collections
export const COLLECTIONS = {
  VENDORS: 'vendors',
  CUSTOMERS: 'customers',
  MILK_TRANSACTIONS: 'milk_transactions',
  PAYMENTS: 'payments',
};

// Vendor operations
export const vendorService = {
  // Get all vendors
  async getAll(): Promise<FirebaseVendor[]> {
    const snapshot = await get(ref(db, COLLECTIONS.VENDORS));
    const data = snapshot.val();
    if (!data) return [];
    return Object.entries(data).map(([id, vendor]) => ({
      id,
      ...(vendor as any),
      createdAt: new Date((vendor as any).createdAt),
    }));
  },

  // Get vendor by ID
  async getById(id: string): Promise<FirebaseVendor | null> {
    const snapshot = await get(ref(db, `${COLLECTIONS.VENDORS}/${id}`));
    const data = snapshot.val();
    if (!data) return null;
    return {
      id,
      ...data,
      createdAt: new Date(data.createdAt),
    } as FirebaseVendor;
  },

  // Create vendor
  async create(vendor: InsertVendor): Promise<string> {
    const newRef = push(ref(db, COLLECTIONS.VENDORS));
    await set(newRef, {
      ...vendor,
      createdAt: serverTimestamp(),
    });
    return newRef.key!;
  },

  // Update vendor
  async update(id: string, updates: Partial<InsertVendor>): Promise<void> {
    await set(ref(db, `${COLLECTIONS.VENDORS}/${id}`), updates);
  },

  // Delete vendor
  async delete(id: string): Promise<void> {
    await remove(ref(db, `${COLLECTIONS.VENDORS}/${id}`));
  },

  // Real-time subscription
  subscribe(callback: (vendors: FirebaseVendor[]) => void) {
    const q = query(ref(db, COLLECTIONS.VENDORS), orderByChild('createdAt'));

    return onValue(q, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        callback([]);
        return;
      }
      const vendors = Object.entries(data).map(([id, vendor]) => ({
        id,
        ...(vendor as any),
        createdAt: new Date((vendor as any).createdAt),
      })).reverse();
      callback(vendors);
    });
  },
};

// Customer operations
export const customerService = {
  // Get all customers
  async getAll(): Promise<FirebaseCustomer[]> {
    const snapshot = await get(ref(db, COLLECTIONS.CUSTOMERS));
    const data = snapshot.val();
    if (!data) return [];
    return Object.entries(data).map(([id, customer]) => ({
      id,
      ...(customer as any),
      createdAt: new Date((customer as any).createdAt),
    }));
  },

  // Get customer by ID
  async getById(id: string): Promise<FirebaseCustomer | null> {
    const snapshot = await get(ref(db, `${COLLECTIONS.CUSTOMERS}/${id}`));
    const data = snapshot.val();
    if (!data) return null;
    return {
      id,
      ...data,
      createdAt: new Date(data.createdAt),
    } as FirebaseCustomer;
  },

  // Create customer
  async create(customer: InsertCustomer): Promise<string> {
    const newRef = push(ref(db, COLLECTIONS.CUSTOMERS));
    await set(newRef, {
      ...customer,
      createdAt: serverTimestamp(),
    });
    return newRef.key!;
  },

  // Update customer
  async update(id: string, updates: Partial<InsertCustomer>): Promise<void> {
    await set(ref(db, `${COLLECTIONS.CUSTOMERS}/${id}`), updates);
  },

  // Delete customer
  async delete(id: string): Promise<void> {
    await remove(ref(db, `${COLLECTIONS.CUSTOMERS}/${id}`));
  },

  // Real-time subscription
  subscribe(callback: (customers: FirebaseCustomer[]) => void) {
    const q = query(ref(db, COLLECTIONS.CUSTOMERS), orderByChild('createdAt'));

    return onValue(q, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        callback([]);
        return;
      }
      const customers = Object.entries(data).map(([id, customer]) => ({
        id,
        ...(customer as any),
        createdAt: new Date((customer as any).createdAt),
      })).reverse();
      callback(customers);
    });
  },
};

// Milk transaction operations
export const transactionService = {
  // Get all transactions
  async getAll(): Promise<FirebaseMilkTransaction[]> {
    const snapshot = await get(query(ref(db, COLLECTIONS.MILK_TRANSACTIONS), orderByChild('date')));
    const data = snapshot.val();
    if (!data) return [];
    return Object.entries(data).map(([id, transaction]) => ({
      id,
      ...(transaction as any),
      date: new Date((transaction as any).date),
      createdAt: new Date((transaction as any).createdAt),
    })).reverse();
  },

  // Get transactions by vendor
  async getByVendor(vendorId: string): Promise<FirebaseMilkTransaction[]> {
    const q = query(ref(db, COLLECTIONS.MILK_TRANSACTIONS), orderByChild('vendorId'), equalTo(vendorId));
    const snapshot = await get(q);
    const data = snapshot.val();
    if (!data) return [];
    return Object.entries(data).map(([id, transaction]) => ({
      id,
      ...(transaction as any),
      date: new Date((transaction as any).date),
      createdAt: new Date((transaction as any).createdAt),
    })).reverse();
  },

  // Get transactions by customer
  async getByCustomer(customerId: string): Promise<FirebaseMilkTransaction[]> {
    const q = query(ref(db, COLLECTIONS.MILK_TRANSACTIONS), orderByChild('customerId'), equalTo(customerId));
    const snapshot = await get(q);
    const data = snapshot.val();
    if (!data) return [];
    return Object.entries(data).map(([id, transaction]) => ({
      id,
      ...(transaction as any),
      date: new Date((transaction as any).date),
      createdAt: new Date((transaction as any).createdAt),
    })).reverse();
  },

  // Get transactions by date range
  async getByDateRange(startDate: Date, endDate: Date): Promise<FirebaseMilkTransaction[]> {
    const allTransactions = await this.getAll();
    return allTransactions.filter(t => {
      const transactionDate = new Date(t.date!);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  },

  // Create transaction
  async create(transaction: InsertMilkTransaction): Promise<string> {
    const newRef = push(ref(db, COLLECTIONS.MILK_TRANSACTIONS));
    await set(newRef, {
      ...transaction,
      date: transaction.date ? transaction.date.toISOString() : serverTimestamp(),
      createdAt: serverTimestamp(),
    });
    return newRef.key!;
  },

  // Real-time subscription
  subscribe(callback: (transactions: FirebaseMilkTransaction[]) => void) {
    const q = query(ref(db, COLLECTIONS.MILK_TRANSACTIONS), orderByChild('date'));

    return onValue(q, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        callback([]);
        return;
      }
      const transactions = Object.entries(data).map(([id, transaction]) => ({
        id,
        ...(transaction as any),
        date: new Date((transaction as any).date),
        createdAt: new Date((transaction as any).createdAt),
      })).reverse().slice(0, 100);
      callback(transactions);
    });
  },
};

// Payment operations
export const paymentService = {
  // Get all payments
  async getAll(): Promise<FirebasePayment[]> {
    const snapshot = await get(query(ref(db, COLLECTIONS.PAYMENTS), orderByChild('date')));
    const data = snapshot.val();
    if (!data) return [];
    return Object.entries(data).map(([id, payment]) => ({
      id,
      ...(payment as any),
      date: new Date((payment as any).date),
      createdAt: new Date((payment as any).createdAt),
    })).reverse();
  },

  // Get payments by vendor
  async getByVendor(vendorId: string): Promise<FirebasePayment[]> {
    const q = query(ref(db, COLLECTIONS.PAYMENTS), orderByChild('vendorId'), equalTo(vendorId));
    const snapshot = await get(q);
    const data = snapshot.val();
    if (!data) return [];
    return Object.entries(data).map(([id, payment]) => ({
      id,
      ...(payment as any),
      date: new Date((payment as any).date),
      createdAt: new Date((payment as any).createdAt),
    })).reverse();
  },

  // Get payments by customer
  async getByCustomer(customerId: string): Promise<FirebasePayment[]> {
    const q = query(ref(db, COLLECTIONS.PAYMENTS), orderByChild('customerId'), equalTo(customerId));
    const snapshot = await get(q);
    const data = snapshot.val();
    if (!data) return [];
    return Object.entries(data).map(([id, payment]) => ({
      id,
      ...(payment as any),
      date: new Date((payment as any).date),
      createdAt: new Date((payment as any).createdAt),
    })).reverse();
  },

  // Get payments by date range
  async getByDateRange(startDate: Date, endDate: Date): Promise<FirebasePayment[]> {
    const allPayments = await this.getAll();
    return allPayments.filter(p => {
      const paymentDate = new Date(p.date!);
      return paymentDate >= startDate && paymentDate <= endDate;
    });
  },

  // Create payment
  async create(payment: InsertPayment): Promise<string> {
    const newRef = push(ref(db, COLLECTIONS.PAYMENTS));
    await set(newRef, {
      ...payment,
      date: payment.date ? payment.date.toISOString() : serverTimestamp(),
      createdAt: serverTimestamp(),
    });
    return newRef.key!;
  },

  // Real-time subscription
  subscribe(callback: (payments: FirebasePayment[]) => void) {
    const q = query(ref(db, COLLECTIONS.PAYMENTS), orderByChild('date'));

    return onValue(q, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        callback([]);
        return;
      }
      const payments = Object.entries(data).map(([id, payment]) => ({
        id,
        ...(payment as any),
        date: new Date((payment as any).date),
        createdAt: new Date((payment as any).createdAt),
      })).reverse().slice(0, 100);
      callback(payments);
    });
  },
};

// Dashboard stats
export const dashboardService = {
  async getStats(): Promise<{
    todayReceived: number;
    todaySent: number;
    todayProfit: number;
    pendingPayments: number;
    totalReceived: number;
    totalPaid: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's transactions
    const todayTransactions = await transactionService.getByDateRange(today, tomorrow);

    // Get all transactions and payments for calculations
    const allTransactions = await transactionService.getAll();
    const allPayments = await paymentService.getAll();

    const todayReceived = todayTransactions
      .filter(t => t.type === 'receive')
      .reduce((sum, t) => sum + t.quantity, 0);

    const todaySent = todayTransactions
      .filter(t => t.type === 'send')
      .reduce((sum, t) => sum + t.quantity, 0);

    const todayReceivedAmount = todayTransactions
      .filter(t => t.type === 'receive')
      .reduce((sum, t) => sum + t.totalAmount, 0);

    const todaySentAmount = todayTransactions
      .filter(t => t.type === 'send')
      .reduce((sum, t) => sum + t.totalAmount, 0);

    const todayProfit = todaySentAmount - todayReceivedAmount;

    const totalPaid = allPayments
      .filter(p => p.type === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalReceived = allPayments
      .filter(p => p.type === 'received')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalTransactionsPaid = allTransactions
      .filter(t => t.type === 'receive')
      .reduce((sum, t) => sum + t.totalAmount, 0);

    const totalTransactionsReceived = allTransactions
      .filter(t => t.type === 'send')
      .reduce((sum, t) => sum + t.totalAmount, 0);

    const pendingPayments = (totalTransactionsPaid - totalPaid) + (totalTransactionsReceived - totalReceived);

    return {
      todayReceived,
      todaySent,
      todayProfit,
      pendingPayments,
      totalReceived,
      totalPaid,
    };
  },
};