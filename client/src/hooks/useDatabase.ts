import { useState, useEffect, useCallback } from 'react';
import { 
  vendorService, 
  customerService, 
  transactionService, 
  paymentService, 
  dashboardService 
} from '@/services/database';
import type { 
  InsertVendor, 
  InsertCustomer, 
  InsertMilkTransaction, 
  InsertPayment 
} from '@shared/schema';

// Firebase-compatible types with string IDs
type FirebaseVendor = {
  id: string;
  name: string;
  contact: string;
  location: string | null;
  cowRate: number;
  buffaloRate: number;
  createdAt: Date | null;
};

type FirebaseCustomer = {
  id: string;
  name: string;
  contact: string;
  location: string | null;
  cowRate: number;
  buffaloRate: number;
  createdAt: Date | null;
};

type FirebaseMilkTransaction = {
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
  date: Date | null;
  createdAt: Date | null;
};

type FirebasePayment = {
  id: string;
  type: string;
  vendorId: string | null;
  customerId: string | null;
  amount: number;
  method: string;
  reference: string | null;
  date: Date | null;
  createdAt: Date | null;
};

// Vendors hook
export const useVendors = () => {
  const [vendors, setVendors] = useState<FirebaseVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = vendorService.subscribe((vendorList) => {
      setVendors(vendorList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createVendor = useCallback(async (vendor: InsertVendor) => {
    try {
      setError(null);
      await vendorService.create(vendor);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create vendor');
      throw err;
    }
  }, []);

  const updateVendor = useCallback(async (id: string, updates: Partial<InsertVendor>) => {
    try {
      setError(null);
      await vendorService.update(id, updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vendor');
      throw err;
    }
  }, []);

  const deleteVendor = useCallback(async (id: string) => {
    try {
      setError(null);
      await vendorService.delete(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete vendor');
      throw err;
    }
  }, []);

  return { vendors, loading, error, createVendor, updateVendor, deleteVendor };
};

// Customers hook
export const useCustomers = () => {
  const [customers, setCustomers] = useState<FirebaseCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = customerService.subscribe((customerList) => {
      setCustomers(customerList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createCustomer = useCallback(async (customer: InsertCustomer) => {
    try {
      setError(null);
      await customerService.create(customer);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create customer');
      throw err;
    }
  }, []);

  const updateCustomer = useCallback(async (id: string, updates: Partial<InsertCustomer>) => {
    try {
      setError(null);
      await customerService.update(id, updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update customer');
      throw err;
    }
  }, []);

  const deleteCustomer = useCallback(async (id: string) => {
    try {
      setError(null);
      await customerService.delete(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete customer');
      throw err;
    }
  }, []);

  return { customers, loading, error, createCustomer, updateCustomer, deleteCustomer };
};

// Transactions hook
export const useTransactions = () => {
  const [transactions, setTransactions] = useState<FirebaseMilkTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = transactionService.subscribe((transactionList) => {
      setTransactions(transactionList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createTransaction = useCallback(async (transaction: InsertMilkTransaction) => {
    try {
      setError(null);
      await transactionService.create(transaction);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
      throw err;
    }
  }, []);

  const getTransactionsByVendor = useCallback(async (vendorId: string) => {
    try {
      setError(null);
      return await transactionService.getByVendor(vendorId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get transactions');
      throw err;
    }
  }, []);

  const getTransactionsByCustomer = useCallback(async (customerId: string) => {
    try {
      setError(null);
      return await transactionService.getByCustomer(customerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get transactions');
      throw err;
    }
  }, []);

  const getTransactionsByDateRange = useCallback(async (startDate: Date, endDate: Date) => {
    try {
      setError(null);
      return await transactionService.getByDateRange(startDate, endDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get transactions');
      throw err;
    }
  }, []);

  return { 
    transactions, 
    loading, 
    error, 
    createTransaction, 
    getTransactionsByVendor, 
    getTransactionsByCustomer, 
    getTransactionsByDateRange 
  };
};

// Payments hook
export const usePayments = () => {
  const [payments, setPayments] = useState<FirebasePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = paymentService.subscribe((paymentList) => {
      setPayments(paymentList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createPayment = useCallback(async (payment: InsertPayment) => {
    try {
      setError(null);
      await paymentService.create(payment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment');
      throw err;
    }
  }, []);

  const getPaymentsByVendor = useCallback(async (vendorId: string) => {
    try {
      setError(null);
      return await paymentService.getByVendor(vendorId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get payments');
      throw err;
    }
  }, []);

  const getPaymentsByCustomer = useCallback(async (customerId: string) => {
    try {
      setError(null);
      return await paymentService.getByCustomer(customerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get payments');
      throw err;
    }
  }, []);

  const getPaymentsByDateRange = useCallback(async (startDate: Date, endDate: Date) => {
    try {
      setError(null);
      return await paymentService.getByDateRange(startDate, endDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get payments');
      throw err;
    }
  }, []);

  return { 
    payments, 
    loading, 
    error, 
    createPayment, 
    getPaymentsByVendor, 
    getPaymentsByCustomer, 
    getPaymentsByDateRange 
  };
};

// Dashboard hook
export const useDashboard = () => {
  const [stats, setStats] = useState({
    todayReceived: 0,
    todaySent: 0,
    todayProfit: 0,
    pendingPayments: 0,
    totalReceived: 0,
    totalPaid: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardStats = await dashboardService.getStats();
      setStats(dashboardStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { stats, loading, error, refreshStats: fetchStats };
};
