import { vendors, customers, milkTransactions, payments, type Vendor, type Customer, type MilkTransaction, type Payment, type InsertVendor, type InsertCustomer, type InsertMilkTransaction, type InsertPayment } from "@shared/schema";

export interface IStorage {
  // Vendors
  getVendors(): Promise<Vendor[]>;
  getVendor(id: number): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor>;
  deleteVendor(id: number): Promise<void>;
  
  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: number): Promise<void>;
  
  // Milk Transactions
  getMilkTransactions(): Promise<MilkTransaction[]>;
  getMilkTransaction(id: number): Promise<MilkTransaction | undefined>;
  createMilkTransaction(transaction: InsertMilkTransaction): Promise<MilkTransaction>;
  getMilkTransactionsByVendor(vendorId: number): Promise<MilkTransaction[]>;
  getMilkTransactionsByCustomer(customerId: number): Promise<MilkTransaction[]>;
  getMilkTransactionsByDateRange(startDate: Date, endDate: Date): Promise<MilkTransaction[]>;
  
  // Payments
  getPayments(): Promise<Payment[]>;
  getPayment(id: number): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsByVendor(vendorId: number): Promise<Payment[]>;
  getPaymentsByCustomer(customerId: number): Promise<Payment[]>;
  getPaymentsByDateRange(startDate: Date, endDate: Date): Promise<Payment[]>;
}

export class MemStorage implements IStorage {
  private vendors: Map<number, Vendor> = new Map();
  private customers: Map<number, Customer> = new Map();
  private milkTransactions: Map<number, MilkTransaction> = new Map();
  private payments: Map<number, Payment> = new Map();
  private currentVendorId = 1;
  private currentCustomerId = 1;
  private currentTransactionId = 1;
  private currentPaymentId = 1;

  // Vendors
  async getVendors(): Promise<Vendor[]> {
    return Array.from(this.vendors.values());
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    return this.vendors.get(id);
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const id = this.currentVendorId++;
    const newVendor: Vendor = {
      ...vendor,
      id,
      location: vendor.location || null,
      createdAt: new Date(),
    };
    this.vendors.set(id, newVendor);
    return newVendor;
  }

  async updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor> {
    const existing = this.vendors.get(id);
    if (!existing) throw new Error("Vendor not found");
    
    const updated: Vendor = { ...existing, ...vendor };
    this.vendors.set(id, updated);
    return updated;
  }

  async deleteVendor(id: number): Promise<void> {
    this.vendors.delete(id);
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const id = this.currentCustomerId++;
    const newCustomer: Customer = {
      ...customer,
      id,
      location: customer.location || null,
      createdAt: new Date(),
    };
    this.customers.set(id, newCustomer);
    return newCustomer;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer> {
    const existing = this.customers.get(id);
    if (!existing) throw new Error("Customer not found");
    
    const updated: Customer = { ...existing, ...customer };
    this.customers.set(id, updated);
    return updated;
  }

  async deleteCustomer(id: number): Promise<void> {
    this.customers.delete(id);
  }

  // Milk Transactions
  async getMilkTransactions(): Promise<MilkTransaction[]> {
    return Array.from(this.milkTransactions.values());
  }

  async getMilkTransaction(id: number): Promise<MilkTransaction | undefined> {
    return this.milkTransactions.get(id);
  }

  async createMilkTransaction(transaction: InsertMilkTransaction): Promise<MilkTransaction> {
    const id = this.currentTransactionId++;
    const newTransaction: MilkTransaction = {
      ...transaction,
      id,
      vendorId: typeof transaction.vendorId === 'string' ? parseInt(transaction.vendorId) : (transaction.vendorId || null),
      customerId: typeof transaction.customerId === 'string' ? parseInt(transaction.customerId) : (transaction.customerId || null),
      fat: transaction.fat || null,
      snf: transaction.snf || null,
      date: transaction.date || new Date(),
      createdAt: new Date(),
    };
    this.milkTransactions.set(id, newTransaction);
    return newTransaction;
  }

  async getMilkTransactionsByVendor(vendorId: number): Promise<MilkTransaction[]> {
    return Array.from(this.milkTransactions.values()).filter(t => t.vendorId === vendorId);
  }

  async getMilkTransactionsByCustomer(customerId: number): Promise<MilkTransaction[]> {
    return Array.from(this.milkTransactions.values()).filter(t => t.customerId === customerId);
  }

  async getMilkTransactionsByDateRange(startDate: Date, endDate: Date): Promise<MilkTransaction[]> {
    return Array.from(this.milkTransactions.values()).filter(t => {
      const date = new Date(t.date!);
      return date >= startDate && date <= endDate;
    });
  }

  // Payments
  async getPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values());
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const id = this.currentPaymentId++;
    const newPayment: Payment = {
      ...payment,
      id,
      vendorId: payment.vendorId || null,
      customerId: payment.customerId || null,
      reference: payment.reference || null,
      date: payment.date || new Date(),
      createdAt: new Date(),
    };
    this.payments.set(id, newPayment);
    return newPayment;
  }

  async getPaymentsByVendor(vendorId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(p => p.vendorId === vendorId || p.vendorId === vendorId.toString());
  }

  async getPaymentsByCustomer(customerId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(p => p.customerId === customerId || p.customerId === customerId.toString());
  }

  async getPaymentsByDateRange(startDate: Date, endDate: Date): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(p => {
      const date = new Date(p.date!);
      return date >= startDate && date <= endDate;
    });
  }
}

export const storage = new MemStorage();
