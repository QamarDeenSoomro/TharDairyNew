import { useMemo } from "react";
import { useVendors, useCustomers, useTransactions, usePayments } from "@/hooks/useFirestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

interface PendingEntry {
  id: string;
  name: string;
  contact: string;
  type: "vendor" | "customer";
  pendingAmount: number;
  lastTransactionDate?: string;
}

export default function PendingPayments() {
  const { vendors, loading: vendorsLoading } = useVendors();
  const { customers, loading: customersLoading } = useCustomers();
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { payments, loading: paymentsLoading } = usePayments();

  const pendingEntries = useMemo(() => {
    if (vendorsLoading || customersLoading || transactionsLoading || paymentsLoading) {
      return [];
    }

    const entries: PendingEntry[] = [];

    // Calculate vendor balances (amount due to vendors)
    vendors.forEach(vendor => {
      const vendorTransactions = transactions.filter(t => t.vendorId === vendor.id && t.type === 'receive');
      const vendorPayments = payments.filter(p => p.vendorId === vendor.id);
      
      const totalTransactions = vendorTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
      const totalPayments = vendorPayments.reduce((sum, p) => sum + p.amount, 0);
      const balance = totalTransactions - totalPayments;
      
      if (balance > 0) {
        const lastTransaction = vendorTransactions.sort((a, b) => 
          new Date(b.date!).getTime() - new Date(a.date!).getTime()
        )[0];
        
        entries.push({
          id: vendor.id,
          name: vendor.name,
          contact: vendor.contact,
          type: "vendor",
          pendingAmount: balance,
          lastTransactionDate: lastTransaction?.date,
        });
      }
    });

    // Calculate customer balances (amount due from customers)
    customers.forEach(customer => {
      const customerTransactions = transactions.filter(t => t.customerId === customer.id && t.type === 'send');
      const customerPayments = payments.filter(p => p.customerId === customer.id);
      
      const totalTransactions = customerTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
      const totalPayments = customerPayments.reduce((sum, p) => sum + p.amount, 0);
      const balance = totalTransactions - totalPayments;
      
      if (balance > 0) {
        const lastTransaction = customerTransactions.sort((a, b) => 
          new Date(b.date!).getTime() - new Date(a.date!).getTime()
        )[0];
        
        entries.push({
          id: customer.id,
          name: customer.name,
          contact: customer.contact,
          type: "customer",
          pendingAmount: balance,
          lastTransactionDate: lastTransaction?.date,
        });
      }
    });

    return entries.sort((a, b) => b.pendingAmount - a.pendingAmount);
  }, [vendors, customers, transactions, payments, vendorsLoading, customersLoading, transactionsLoading, paymentsLoading]);

  const totals = useMemo(() => {
    const vendorTotal = pendingEntries
      .filter(entry => entry.type === "vendor")
      .reduce((sum, entry) => sum + entry.pendingAmount, 0);
    
    const customerTotal = pendingEntries
      .filter(entry => entry.type === "customer")
      .reduce((sum, entry) => sum + entry.pendingAmount, 0);
    
    return { vendorTotal, customerTotal };
  }, [pendingEntries]);

  if (vendorsLoading || customersLoading || transactionsLoading || paymentsLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Pending Payments</h2>
        <p className="text-muted-foreground">Track receivables and payables</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Amount Due to Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(totals.vendorTotal)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {pendingEntries.filter(e => e.type === "vendor").length} vendors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Amount Due from Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totals.customerTotal)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {pendingEntries.filter(e => e.type === "customer").length} customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Position</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              totals.customerTotal - totals.vendorTotal >= 0 ? 'text-green-600' : 'text-destructive'
            }`}>
              {formatCurrency(totals.customerTotal - totals.vendorTotal)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totals.customerTotal - totals.vendorTotal >= 0 ? 'Positive cash flow' : 'Negative cash flow'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingEntries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-2">No pending payments</p>
              <p className="text-sm text-muted-foreground">All accounts are settled</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Last Transaction</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.name}</TableCell>
                        <TableCell>{entry.contact}</TableCell>
                        <TableCell>
                          <Badge variant={entry.type === "vendor" ? "destructive" : "default"} className="capitalize">
                            {entry.type === "vendor" ? "Payable" : "Receivable"}
                          </Badge>
                        </TableCell>
                        <TableCell className={`font-bold ${
                          entry.type === "vendor" ? "text-destructive" : "text-green-600"
                        }`}>
                          {formatCurrency(entry.pendingAmount)}
                        </TableCell>
                        <TableCell>
                          {entry.lastTransactionDate 
                            ? format(new Date(entry.lastTransactionDate), "dd/MM/yyyy")
                            : "-"
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {pendingEntries.map((entry) => (
                  <Card key={entry.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-medium">{entry.name}</div>
                        <div className="text-sm text-muted-foreground">{entry.contact}</div>
                      </div>
                      <Badge variant={entry.type === "vendor" ? "destructive" : "default"} className="capitalize">
                        {entry.type === "vendor" ? "Payable" : "Receivable"}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className={`font-bold text-lg ${
                          entry.type === "vendor" ? "text-destructive" : "text-green-600"
                        }`}>
                          {formatCurrency(entry.pendingAmount)}
                        </span>
                      </div>
                      {entry.lastTransactionDate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Transaction:</span>
                          <span>{format(new Date(entry.lastTransactionDate), "dd/MM/yyyy")}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}