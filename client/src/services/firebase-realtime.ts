// Firebase Realtime Database Services
import { ref, push, set, get, remove, onValue, off, query, orderByChild, equalTo, limitToLast } from 'firebase/database';
import { db } from '@/lib/firebase';
import { InsertVendor, InsertCustomer, InsertMilkTransaction, InsertPayment } from '@shared/schema';

// Database paths
const PATHS = {
  VENDORS: 'vendors',
  CUSTOMERS: 'customers',
  MILK_TRANSACTIONS: 'milk_transactions',
  PAYMENTS: 'payments'
};

// Firebase-compatible types with string IDs
export type FirebaseVendor = {
  id: string;
  name: string;
  contact: string;
  location: string | null;
  cowRate: number;
  buffaloRate: number;
  createdAt: string;
};

export type FirebaseCustomer = {
  id: string;
  name: string;
  contact: string;
  location: string | null;
  cowRate: number;
  buffaloRate: number;
  createdAt: string;
};

export type FirebaseMilkTransaction = {
  id: string;
  type: string;
  vendorId: string | null;
  customerId: string | null;
  milkType: string;
  quantity: number;
  fat: number | null;
  snf: number | null;
  rate: number;
  totalAmount: number;
  date: string;
  createdAt: string;
};

export type FirebasePayment = {
  id: string;
  type: string;
  vendorId: string | null;
  customerId: string | null;
  amount: number;
  method: string;
  reference: string | null;
  date: string;
  createdAt: string;
};

// Vendor operations
export const vendorService = {
  // Create vendor
  async create(vendorData: InsertVendor): Promise<string> {
    const vendorsRef = ref(db, PATHS.VENDORS);
    const newVendorRef = push(vendorsRef);
    const data = {
      ...vendorData,
      createdAt: new Date().toISOString(),
    };
    await set(newVendorRef, data);
    return newVendorRef.key!;
  },

  // Get all vendors
  async getAll(): Promise<FirebaseVendor[]> {
    const vendorsRef = ref(db, PATHS.VENDORS);
    const snapshot = await get(vendorsRef);
    if (!snapshot.exists()) return [];
    
    const data = snapshot.val();
    return Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    }));
  },

  // Get vendor by ID
  async getById(id: string): Promise<FirebaseVendor | null> {
    const vendorRef = ref(db, `${PATHS.VENDORS}/${id}`);
    const snapshot = await get(vendorRef);
    
    if (snapshot.exists()) {
      return {
        id,
        ...snapshot.val()
      };
    }
    return null;
  },

  // Update vendor
  async update(id: string, vendorData: Partial<InsertVendor>): Promise<void> {
    const vendorRef = ref(db, `${PATHS.VENDORS}/${id}`);
    await set(vendorRef, vendorData);
  },

  // Delete vendor
  async delete(id: string): Promise<void> {
    const vendorRef = ref(db, `${PATHS.VENDORS}/${id}`);
    await remove(vendorRef);
  },

  // Real-time subscription
  subscribe(callback: (vendors: FirebaseVendor[]) => void): () => void {
    const vendorsRef = ref(db, PATHS.VENDORS);
    
    const unsubscribe = onValue(vendorsRef, (snapshot) => {
      const vendors: FirebaseVendor[] = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach(key => {
          vendors.push({
            id: key,
            ...data[key]
          });
        });
      }
      callback(vendors);
    });

    return () => off(vendorsRef, 'value', unsubscribe);
  }
};

// Customer operations
export const customerService = {
  // Create customer
  async create(customerData: InsertCustomer): Promise<string> {
    const customersRef = ref(db, PATHS.CUSTOMERS);
    const newCustomerRef = push(customersRef);
    const data = {
      ...customerData,
      createdAt: new Date().toISOString(),
    };
    await set(newCustomerRef, data);
    return newCustomerRef.key!;
  },

  // Get all customers
  async getAll(): Promise<FirebaseCustomer[]> {
    const customersRef = ref(db, PATHS.CUSTOMERS);
    const snapshot = await get(customersRef);
    if (!snapshot.exists()) return [];
    
    const data = snapshot.val();
    return Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    }));
  },

  // Get customer by ID
  async getById(id: string): Promise<FirebaseCustomer | null> {
    const customerRef = ref(db, `${PATHS.CUSTOMERS}/${id}`);
    const snapshot = await get(customerRef);
    
    if (snapshot.exists()) {
      return {
        id,
        ...snapshot.val()
      };
    }
    return null;
  },

  // Update customer
  async update(id: string, customerData: Partial<InsertCustomer>): Promise<void> {
    const customerRef = ref(db, `${PATHS.CUSTOMERS}/${id}`);
    await set(customerRef, customerData);
  },

  // Delete customer
  async delete(id: string): Promise<void> {
    const customerRef = ref(db, `${PATHS.CUSTOMERS}/${id}`);
    await remove(customerRef);
  },

  // Real-time subscription
  subscribe(callback: (customers: FirebaseCustomer[]) => void): () => void {
    const customersRef = ref(db, PATHS.CUSTOMERS);
    
    const unsubscribe = onValue(customersRef, (snapshot) => {
      const customers: FirebaseCustomer[] = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach(key => {
          customers.push({
            id: key,
            ...data[key]
          });
        });
      }
      callback(customers);
    });

    return () => off(customersRef, 'value', unsubscribe);
  }
};

// Transaction operations
export const transactionService = {
  // Create transaction
  async create(transactionData: InsertMilkTransaction): Promise<string> {
    const transactionsRef = ref(db, PATHS.MILK_TRANSACTIONS);
    const newTransactionRef = push(transactionsRef);
    const data = {
      type: transactionData.type,
      vendorId: transactionData.vendorId || null,
      customerId: transactionData.customerId || null,
      milkType: transactionData.milkType,
      quantity: transactionData.quantity,
      rate: transactionData.rate,
      totalAmount: transactionData.totalAmount,
      fat: null, // Set to null since we removed the field
      snf: null, // Set to null since we removed the field
      date: transactionData.date ? new Date(transactionData.date).toISOString() : new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    console.log('Firebase transactionService.create - Saving data:', data);
    await set(newTransactionRef, data);
    return newTransactionRef.key!;
  },

  // Get all transactions
  async getAll(): Promise<FirebaseMilkTransaction[]> {
    const transactionsRef = ref(db, PATHS.MILK_TRANSACTIONS);
    const snapshot = await get(transactionsRef);
    if (!snapshot.exists()) return [];
    
    const data = snapshot.val();
    return Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  // Get transactions by vendor
  async getByVendor(vendorId: string): Promise<FirebaseMilkTransaction[]> {
    const transactions = await this.getAll();
    return transactions.filter(t => t.vendorId === vendorId);
  },

  // Get transactions by customer
  async getByCustomer(customerId: string): Promise<FirebaseMilkTransaction[]> {
    const transactions = await this.getAll();
    return transactions.filter(t => t.customerId === customerId);
  },

  // Get transactions by date range
  async getByDateRange(startDate: Date, endDate: Date): Promise<FirebaseMilkTransaction[]> {
    const transactions = await this.getAll();
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  },

  // Update transaction
  async update(id: string, transactionData: Partial<InsertMilkTransaction>): Promise<void> {
    const transactionRef = ref(db, `${PATHS.MILK_TRANSACTIONS}/${id}`);
    const updateData = {
      ...transactionData,
      date: transactionData.date ? new Date(transactionData.date).toISOString() : undefined,
    };
    await set(transactionRef, updateData);
  },

  // Delete transaction
  async delete(id: string): Promise<void> {
    const transactionRef = ref(db, `${PATHS.MILK_TRANSACTIONS}/${id}`);
    await remove(transactionRef);
  },

  // Real-time subscription
  subscribe(callback: (transactions: FirebaseMilkTransaction[]) => void): () => void {
    const transactionsRef = ref(db, PATHS.MILK_TRANSACTIONS);
    
    const unsubscribe = onValue(transactionsRef, (snapshot) => {
      const transactions: FirebaseMilkTransaction[] = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach(key => {
          transactions.push({
            id: key,
            ...data[key]
          });
        });
      }
      // Sort by date descending
      transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      callback(transactions);
    });

    return () => off(transactionsRef, 'value', unsubscribe);
  }
};

// Payment operations
export const paymentService = {
  // Create payment
  async create(paymentData: InsertPayment): Promise<string> {
    const paymentsRef = ref(db, PATHS.PAYMENTS);
    const newPaymentRef = push(paymentsRef);
    const data = {
      ...paymentData,
      date: paymentData.date ? new Date(paymentData.date).toISOString() : new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    await set(newPaymentRef, data);
    return newPaymentRef.key!;
  },

  // Get all payments
  async getAll(): Promise<FirebasePayment[]> {
    const paymentsRef = ref(db, PATHS.PAYMENTS);
    const snapshot = await get(paymentsRef);
    if (!snapshot.exists()) return [];
    
    const data = snapshot.val();
    return Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  // Get payments by vendor
  async getByVendor(vendorId: string): Promise<FirebasePayment[]> {
    const payments = await this.getAll();
    return payments.filter(p => p.vendorId === vendorId);
  },

  // Get payments by customer
  async getByCustomer(customerId: string): Promise<FirebasePayment[]> {
    const payments = await this.getAll();
    return payments.filter(p => p.customerId === customerId);
  },

  // Get payments by date range
  async getByDateRange(startDate: Date, endDate: Date): Promise<FirebasePayment[]> {
    const payments = await this.getAll();
    return payments.filter(p => {
      const paymentDate = new Date(p.date);
      return paymentDate >= startDate && paymentDate <= endDate;
    });
  },

  // Update payment
  async update(id: string, paymentData: Partial<InsertPayment>): Promise<void> {
    const paymentRef = ref(db, `${PATHS.PAYMENTS}/${id}`);
    const updateData = {
      ...paymentData,
      date: paymentData.date ? new Date(paymentData.date).toISOString() : undefined,
    };
    await set(paymentRef, updateData);
  },

  // Delete payment
  async delete(id: string): Promise<void> {
    const paymentRef = ref(db, `${PATHS.PAYMENTS}/${id}`);
    await remove(paymentRef);
  },

  // Real-time subscription
  subscribe(callback: (payments: FirebasePayment[]) => void): () => void {
    const paymentsRef = ref(db, PATHS.PAYMENTS);
    
    const unsubscribe = onValue(paymentsRef, (snapshot) => {
      const payments: FirebasePayment[] = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach(key => {
          payments.push({
            id: key,
            ...data[key]
          });
        });
      }
      // Sort by date descending
      payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      callback(payments);
    });

    return () => off(paymentsRef, 'value', unsubscribe);
  }
};

// Dashboard service
export const dashboardService = {
  async getStats() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const transactions = await transactionService.getByDateRange(startOfDay, endOfDay);
    const payments = await paymentService.getByDateRange(startOfDay, endOfDay);

    const todayReceived = transactions
      .filter(t => t.type === 'receive')
      .reduce((sum, t) => sum + t.quantity, 0);

    const todaySent = transactions
      .filter(t => t.type === 'send')
      .reduce((sum, t) => sum + t.quantity, 0);

    const todayRevenue = transactions
      .filter(t => t.type === 'send')
      .reduce((sum, t) => sum + t.totalAmount, 0);

    const todayExpenses = transactions
      .filter(t => t.type === 'receive')
      .reduce((sum, t) => sum + t.totalAmount, 0);

    const todayProfit = todayRevenue - todayExpenses;

    const allPayments = await paymentService.getAll();
    const allTransactions = await transactionService.getAll();

    // Calculate pending payments (simplified)
    const totalDue = allTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
    const pendingPayments = Math.max(0, totalDue - totalPaid);

    return {
      todayReceived,
      todaySent,
      todayProfit,
      pendingPayments,
    };
  }
};