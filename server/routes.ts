import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVendorSchema, insertCustomerSchema, insertMilkTransactionSchema, insertPaymentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Vendor routes
  app.get("/api/vendors", async (req, res) => {
    try {
      const vendors = await storage.getVendors();
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  app.get("/api/vendors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vendor = await storage.getVendor(id);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      res.json(vendor);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendor" });
    }
  });

  app.post("/api/vendors", async (req, res) => {
    try {
      const vendor = insertVendorSchema.parse(req.body);
      const newVendor = await storage.createVendor(vendor);
      res.status(201).json(newVendor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid vendor data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create vendor" });
    }
  });

  app.put("/api/vendors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vendor = insertVendorSchema.partial().parse(req.body);
      const updatedVendor = await storage.updateVendor(id, vendor);
      res.json(updatedVendor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid vendor data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update vendor" });
    }
  });

  app.delete("/api/vendors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteVendor(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete vendor" });
    }
  });

  // Customer routes
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customer = insertCustomerSchema.parse(req.body);
      const newCustomer = await storage.createCustomer(customer);
      res.status(201).json(newCustomer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = insertCustomerSchema.partial().parse(req.body);
      const updatedCustomer = await storage.updateCustomer(id, customer);
      res.json(updatedCustomer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCustomer(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Milk Transaction routes
  app.get("/api/milk-transactions", async (req, res) => {
    try {
      const { startDate, endDate, vendorId, customerId } = req.query;
      
      let transactions;
      if (startDate && endDate) {
        transactions = await storage.getMilkTransactionsByDateRange(new Date(startDate as string), new Date(endDate as string));
      } else if (vendorId) {
        transactions = await storage.getMilkTransactionsByVendor(parseInt(vendorId as string));
      } else if (customerId) {
        transactions = await storage.getMilkTransactionsByCustomer(parseInt(customerId as string));
      } else {
        transactions = await storage.getMilkTransactions();
      }
      
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch milk transactions" });
    }
  });

  app.post("/api/milk-transactions", async (req, res) => {
    try {
      const transaction = insertMilkTransactionSchema.parse(req.body);
      const newTransaction = await storage.createMilkTransaction(transaction);
      res.status(201).json(newTransaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create milk transaction" });
    }
  });

  // Payment routes
  app.get("/api/payments", async (req, res) => {
    try {
      const { startDate, endDate, vendorId, customerId } = req.query;
      
      let payments;
      if (startDate && endDate) {
        payments = await storage.getPaymentsByDateRange(new Date(startDate as string), new Date(endDate as string));
      } else if (vendorId) {
        payments = await storage.getPaymentsByVendor(parseInt(vendorId as string));
      } else if (customerId) {
        payments = await storage.getPaymentsByCustomer(parseInt(customerId as string));
      } else {
        payments = await storage.getPayments();
      }
      
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const payment = insertPaymentSchema.parse(req.body);
      const newPayment = await storage.createPayment(payment);
      res.status(201).json(newPayment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid payment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayTransactions = await storage.getMilkTransactionsByDateRange(today, tomorrow);
      const allTransactions = await storage.getMilkTransactions();
      const allPayments = await storage.getPayments();

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

      res.json({
        todayReceived,
        todaySent,
        todayProfit,
        pendingPayments,
        totalReceived,
        totalPaid,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
