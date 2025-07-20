import { ref, set, get, update } from 'firebase/database';
import { db } from '@/lib/firebase';

export interface HardCopyStatus {
  savedOnHard?: boolean;
  savedOnHardDate?: string;
  savedOnHardBy?: string;
}

export interface PartyTrackingSummary {
  partyId: string;
  partyName: string;
  partyType: 'vendor' | 'customer';
  totalTransactions: number;
  savedTransactions: number;
  unsavedTransactions: number;
  totalPayments: number;
  savedPayments: number;
  unsavedPayments: number;
  lastSavedDate?: string;
}

class HardCopyTrackingService {
  // Mark a milk transaction as saved on hard
  async markTransactionAsSaved(transactionId: string, savedBy?: string): Promise<void> {
    const transactionRef = ref(db, `milk_transactions/${transactionId}`);
    const updates: HardCopyStatus = {
      savedOnHard: true,
      savedOnHardDate: new Date().toISOString(),
      savedOnHardBy: savedBy || 'System'
    };
    await update(transactionRef, updates);
  }

  // Mark a payment as saved on hard
  async markPaymentAsSaved(paymentId: string, savedBy?: string): Promise<void> {
    const paymentRef = ref(db, `payments/${paymentId}`);
    const updates: HardCopyStatus = {
      savedOnHard: true,
      savedOnHardDate: new Date().toISOString(),
      savedOnHardBy: savedBy || 'System'
    };
    await update(paymentRef, updates);
  }

  // Mark multiple transactions as saved
  async markMultipleTransactionsAsSaved(transactionIds: string[], savedBy?: string): Promise<void> {
    const promises = transactionIds.map(id => this.markTransactionAsSaved(id, savedBy));
    await Promise.all(promises);
  }

  // Mark multiple payments as saved
  async markMultiplePaymentsAsSaved(paymentIds: string[], savedBy?: string): Promise<void> {
    const promises = paymentIds.map(id => this.markPaymentAsSaved(id, savedBy));
    await Promise.all(promises);
  }

  // Get party-wise tracking summary
  async getPartyTrackingSummary(
    transactions: any[],
    payments: any[],
    vendors: any[],
    customers: any[]
  ): Promise<PartyTrackingSummary[]> {
    const summaryMap = new Map<string, PartyTrackingSummary>();

    // Process vendors
    vendors.forEach(vendor => {
      const vendorTransactions = transactions.filter(t => t.vendorId === vendor.id);
      const vendorPayments = payments.filter(p => p.vendorId === vendor.id);
      
      const savedTransactions = vendorTransactions.filter(t => t.savedOnHard === true);
      const savedPayments = vendorPayments.filter(p => p.savedOnHard === true);
      
      // Find last saved date
      const allSavedDates = [
        ...savedTransactions.map(t => t.savedOnHardDate),
        ...savedPayments.map(p => p.savedOnHardDate)
      ].filter(Boolean).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      summaryMap.set(vendor.id, {
        partyId: vendor.id,
        partyName: vendor.name,
        partyType: 'vendor',
        totalTransactions: vendorTransactions.length,
        savedTransactions: savedTransactions.length,
        unsavedTransactions: vendorTransactions.length - savedTransactions.length,
        totalPayments: vendorPayments.length,
        savedPayments: savedPayments.length,
        unsavedPayments: vendorPayments.length - savedPayments.length,
        lastSavedDate: allSavedDates[0]
      });
    });

    // Process customers
    customers.forEach(customer => {
      const customerTransactions = transactions.filter(t => t.customerId === customer.id);
      const customerPayments = payments.filter(p => p.customerId === customer.id);
      
      const savedTransactions = customerTransactions.filter(t => t.savedOnHard === true);
      const savedPayments = customerPayments.filter(p => p.savedOnHard === true);
      
      // Find last saved date
      const allSavedDates = [
        ...savedTransactions.map(t => t.savedOnHardDate),
        ...savedPayments.map(p => p.savedOnHardDate)
      ].filter(Boolean).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      summaryMap.set(customer.id, {
        partyId: customer.id,
        partyName: customer.name,
        partyType: 'customer',
        totalTransactions: customerTransactions.length,
        savedTransactions: savedTransactions.length,
        unsavedTransactions: customerTransactions.length - savedTransactions.length,
        totalPayments: customerPayments.length,
        savedPayments: savedPayments.length,
        unsavedPayments: customerPayments.length - savedPayments.length,
        lastSavedDate: allSavedDates[0]
      });
    });

    return Array.from(summaryMap.values());
  }

  // Get unsaved entries for a specific party
  async getUnsavedEntriesForParty(
    partyId: string,
    partyType: 'vendor' | 'customer',
    transactions: any[],
    payments: any[]
  ) {
    const partyKey = partyType === 'vendor' ? 'vendorId' : 'customerId';
    
    const unsavedTransactions = transactions.filter(
      t => t[partyKey] === partyId && !t.savedOnHard
    );
    
    const unsavedPayments = payments.filter(
      p => p[partyKey] === partyId && !p.savedOnHard
    );

    return {
      transactions: unsavedTransactions,
      payments: unsavedPayments
    };
  }

  // Generate a printable report of unsaved entries
  generateUnsavedEntriesReport(partyName: string, unsavedEntries: any) {
    const { transactions, payments } = unsavedEntries;
    
    let report = `UNSAVED ENTRIES REPORT\n`;
    report += `Party: ${partyName}\n`;
    report += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    if (transactions.length > 0) {
      report += `MILK TRANSACTIONS (${transactions.length} entries):\n`;
      report += `Date\t\tType\tQuantity\tRate\tAmount\n`;
      report += `${'='.repeat(60)}\n`;
      
      transactions.forEach((t: any) => {
        const date = new Date(t.date).toLocaleDateString();
        report += `${date}\t${t.type}\t${t.quantity}L\t${t.rate}\t${t.totalAmount}\n`;
      });
      report += '\n';
    }
    
    if (payments.length > 0) {
      report += `PAYMENTS (${payments.length} entries):\n`;
      report += `Date\t\tType\tAmount\tMethod\n`;
      report += `${'='.repeat(60)}\n`;
      
      payments.forEach((p: any) => {
        const date = new Date(p.date).toLocaleDateString();
        report += `${date}\t${p.type}\t${p.amount}\t${p.method}\n`;
      });
    }
    
    return report;
  }
}

export const hardCopyTrackingService = new HardCopyTrackingService();