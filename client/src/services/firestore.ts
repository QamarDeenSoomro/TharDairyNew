import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
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
    const snapshot = await getDocs(collection(db, COLLECTIONS.VENDORS));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as FirebaseVendor[];
  },

  // Get vendor by ID
  async getById(id: string): Promise<FirebaseVendor | null> {
    const docRef = doc(db, COLLECTIONS.VENDORS, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
      } as FirebaseVendor;
    }
    return null;
  },

  // Create vendor
  async create(vendor: InsertVendor): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.VENDORS), {
      ...vendor,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  // Update vendor
  async update(id: string, updates: Partial<InsertVendor>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.VENDORS, id);
    await updateDoc(docRef, updates);
  },

  // Delete vendor
  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.VENDORS, id);
    await deleteDoc(docRef);
  },

  // Real-time subscription
  subscribe(callback: (vendors: FirebaseVendor[]) => void) {
    const q = query(collection(db, COLLECTIONS.VENDORS), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const vendors = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as FirebaseVendor[];
      callback(vendors);
    });
  },
};

// Customer operations
export const customerService = {
  // Get all customers
  async getAll(): Promise<FirebaseCustomer[]> {
    const snapshot = await getDocs(collection(db, COLLECTIONS.CUSTOMERS));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as FirebaseCustomer[];
  },

  // Get customer by ID
  async getById(id: string): Promise<FirebaseCustomer | null> {
    const docRef = doc(db, COLLECTIONS.CUSTOMERS, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      } as FirebaseCustomer;
    }
    return null;
  },

  // Create customer
  async create(customer: InsertCustomer): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.CUSTOMERS), {
      ...customer,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  // Update customer
  async update(id: string, updates: Partial<InsertCustomer>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.CUSTOMERS, id);
    await updateDoc(docRef, updates);
  },

  // Delete customer
  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.CUSTOMERS, id);
    await deleteDoc(docRef);
  },

  // Real-time subscription
  subscribe(callback: (customers: FirebaseCustomer[]) => void) {
    const q = query(collection(db, COLLECTIONS.CUSTOMERS), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const customers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as FirebaseCustomer[];
      callback(customers);
    });
  },
};

// Milk transaction operations
export const transactionService = {
  // Get all transactions
  async getAll(): Promise<FirebaseMilkTransaction[]> {
    const snapshot = await getDocs(
      query(collection(db, COLLECTIONS.MILK_TRANSACTIONS), orderBy('date', 'desc'))
    );
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as FirebaseMilkTransaction[];
  },

  // Get transactions by vendor
  async getByVendor(vendorId: string): Promise<FirebaseMilkTransaction[]> {
    const q = query(
      collection(db, COLLECTIONS.MILK_TRANSACTIONS),
      where('vendorId', '==', vendorId),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as FirebaseMilkTransaction[];
  },

  // Get transactions by customer
  async getByCustomer(customerId: string): Promise<FirebaseMilkTransaction[]> {
    const q = query(
      collection(db, COLLECTIONS.MILK_TRANSACTIONS),
      where('customerId', '==', customerId),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as FirebaseMilkTransaction[];
  },

  // Get transactions by date range
  async getByDateRange(startDate: Date, endDate: Date): Promise<FirebaseMilkTransaction[]> {
    const q = query(
      collection(db, COLLECTIONS.MILK_TRANSACTIONS),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as FirebaseMilkTransaction[];
  },

  // Create transaction
  async create(transaction: InsertMilkTransaction): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.MILK_TRANSACTIONS), {
      ...transaction,
      date: transaction.date ? Timestamp.fromDate(transaction.date) : serverTimestamp(),
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  // Real-time subscription
  subscribe(callback: (transactions: FirebaseMilkTransaction[]) => void) {
    const q = query(
      collection(db, COLLECTIONS.MILK_TRANSACTIONS),
      orderBy('date', 'desc'),
      limit(100)
    );
    
    return onSnapshot(q, (snapshot) => {
      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as FirebaseMilkTransaction[];
      callback(transactions);
    });
  },
};

// Payment operations
export const paymentService = {
  // Get all payments
  async getAll(): Promise<FirebasePayment[]> {
    const snapshot = await getDocs(
      query(collection(db, COLLECTIONS.PAYMENTS), orderBy('date', 'desc'))
    );
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as FirebasePayment[];
  },

  // Get payments by vendor
  async getByVendor(vendorId: string): Promise<FirebasePayment[]> {
    const q = query(
      collection(db, COLLECTIONS.PAYMENTS),
      where('vendorId', '==', vendorId),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as FirebasePayment[];
  },

  // Get payments by customer
  async getByCustomer(customerId: string): Promise<FirebasePayment[]> {
    const q = query(
      collection(db, COLLECTIONS.PAYMENTS),
      where('customerId', '==', customerId),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as FirebasePayment[];
  },

  // Get payments by date range
  async getByDateRange(startDate: Date, endDate: Date): Promise<FirebasePayment[]> {
    const q = query(
      collection(db, COLLECTIONS.PAYMENTS),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as FirebasePayment[];
  },

  // Create payment
  async create(payment: InsertPayment): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.PAYMENTS), {
      ...payment,
      date: payment.date ? Timestamp.fromDate(payment.date) : serverTimestamp(),
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  // Real-time subscription
  subscribe(callback: (payments: FirebasePayment[]) => void) {
    const q = query(
      collection(db, COLLECTIONS.PAYMENTS),
      orderBy('date', 'desc'),
      limit(100)
    );
    
    return onSnapshot(q, (snapshot) => {
      const payments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as FirebasePayment[];
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