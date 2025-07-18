import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Send, Download, X } from "lucide-react";
import { useTransactions, usePayments } from "@/hooks/useFirestore";
import { formatDistanceToNow, format, isWithinInterval } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { FirebaseVendor, FirebaseCustomer } from "@/services/firebase-realtime";

interface LedgerViewProps {
  entity: FirebaseVendor | FirebaseCustomer;
  entityType: "vendor" | "customer";
  isOpen: boolean;
  onClose: () => void;
}

export default function LedgerView({ entity, entityType, isOpen, onClose }: LedgerViewProps) {
  const { transactions } = useTransactions();
  const { payments } = usePayments();
  const { toast } = useToast();
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Filter transactions for this entity
  const entityTransactions = useMemo(() => {
    const filtered = transactions.filter(t => {
      if (entityType === "vendor") {
        return t.vendorId === entity.id && t.type === "receive";
      } else {
        return t.customerId === entity.id && t.type === "send";
      }
    });

    // Apply date filter if dates are selected
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include full end date
      
      return filtered.filter(t => {
        const transactionDate = new Date(t.date!);
        return isWithinInterval(transactionDate, { start, end });
      });
    }

    return filtered;
  }, [transactions, entity.id, entityType, startDate, endDate]);

  // Filter payments for this entity
  const entityPayments = useMemo(() => {
    const filtered = payments.filter(p => {
      if (entityType === "vendor") {
        return p.vendorId === entity.id;
      } else {
        return p.customerId === entity.id;
      }
    });

    // Apply date filter if dates are selected
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      return filtered.filter(p => {
        const paymentDate = new Date(p.date!);
        return isWithinInterval(paymentDate, { start, end });
      });
    }

    return filtered;
  }, [payments, entity.id, entityType, startDate, endDate]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalTransactions = entityTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalPayments = entityPayments.reduce((sum, p) => sum + p.amount, 0);
    const balance = entityType === "vendor" ? totalTransactions - totalPayments : totalPayments - totalTransactions;
    
    return {
      transactions: totalTransactions,
      payments: totalPayments,
      balance,
    };
  }, [entityTransactions, entityPayments, entityType]);

  // Generate ledger text for WhatsApp
  const generateLedgerText = () => {
    const dateRange = startDate && endDate 
      ? `${format(new Date(startDate), "dd/MM/yyyy")} to ${format(new Date(endDate), "dd/MM/yyyy")}`
      : "All Time";
    
    const entityName = entity.name;
    const entityContact = entity.contact;
    
    let text = `*${entityType.toUpperCase()} LEDGER*\n`;
    text += `Name: ${entityName}\n`;
    text += `Contact: ${entityContact}\n`;
    text += `Period: ${dateRange}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    // Add transactions
    if (entityTransactions.length > 0) {
      text += `*${entityType === "vendor" ? "MILK RECEIVED" : "MILK DELIVERED"}:*\n`;
      entityTransactions.forEach(t => {
        const date = format(new Date(t.date!), "dd/MM/yyyy");
        text += `${date} - ${t.quantity}L ${t.milkType} - ₹${t.totalAmount}\n`;
      });
      text += `Subtotal: ₹${totals.transactions}\n\n`;
    }
    
    // Add payments
    if (entityPayments.length > 0) {
      text += `*PAYMENTS:*\n`;
      entityPayments.forEach(p => {
        const date = format(new Date(p.date!), "dd/MM/yyyy");
        text += `${date} - ₹${p.amount}${p.notes ? ` (${p.notes})` : ""}\n`;
      });
      text += `Subtotal: ₹${totals.payments}\n\n`;
    }
    
    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `*BALANCE: ₹${Math.abs(totals.balance)}*\n`;
    text += totals.balance > 0 
      ? `Status: ${entityType === "vendor" ? "Amount Due" : "Credit Balance"}\n`
      : totals.balance < 0 
      ? `Status: ${entityType === "vendor" ? "Advance Payment" : "Amount Due"}\n`
      : `Status: Settled\n`;
    
    return text;
  };

  const sendViaWhatsApp = async () => {
    try {
      setIsSending(true);
      const message = generateLedgerText();
      const phoneNumber = entity.contact.replace(/[^0-9]/g, ""); // Remove non-numeric characters
      
      // Format phone number for WhatsApp (add country code if not present)
      const formattedNumber = phoneNumber.startsWith("91") ? phoneNumber : `91${phoneNumber}`;
      
      const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
      
      // Open WhatsApp in new tab
      window.open(whatsappUrl, "_blank");
      
      toast({
        title: "Success",
        description: "WhatsApp opened with ledger message",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open WhatsApp",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const downloadLedger = () => {
    const text = generateLedgerText();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `${entity.name}_ledger_${format(new Date(), "yyyy-MM-dd")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Success",
      description: "Ledger downloaded successfully",
    });
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{entity.name} - Ledger</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Date Range Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  {(startDate || endDate) && (
                    <Button variant="outline" onClick={clearDateFilter}>
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-muted-foreground">
                    {entityType === "vendor" ? "Milk Purchased" : "Milk Sold"}
                  </div>
                  <div className="text-2xl font-bold text-blue-600">₹{totals.transactions}</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Payments</div>
                  <div className="text-2xl font-bold text-green-600">₹{totals.payments}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Balance</div>
                  <div className={`text-2xl font-bold ${totals.balance > 0 ? "text-red-600" : totals.balance < 0 ? "text-green-600" : "text-gray-600"}`}>
                    ₹{Math.abs(totals.balance)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {totals.balance > 0 
                      ? (entityType === "vendor" ? "Amount Due" : "Credit") 
                      : totals.balance < 0 
                      ? (entityType === "vendor" ? "Advance" : "Amount Due")
                      : "Settled"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={sendViaWhatsApp} disabled={isSending} className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              {isSending ? "Opening WhatsApp..." : "Send via WhatsApp"}
            </Button>
            <Button variant="outline" onClick={downloadLedger} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Ledger
            </Button>
          </div>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                {entityType === "vendor" ? "Milk Purchases" : "Milk Sales"} 
                ({entityTransactions.length} records)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {entityTransactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No transactions found for the selected period
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entityTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div>
                              <div>{format(new Date(transaction.date!), "dd/MM/yyyy")}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(transaction.date!), { addSuffix: true })}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize">
                              {transaction.milkType}
                            </Badge>
                          </TableCell>
                          <TableCell>{transaction.quantity}L</TableCell>
                          <TableCell>₹{transaction.rate}/L</TableCell>
                          <TableCell className="font-medium">₹{transaction.totalAmount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Payments ({entityPayments.length} records)</CardTitle>
            </CardHeader>
            <CardContent>
              {entityPayments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No payments found for the selected period
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entityPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div>
                              <div>{format(new Date(payment.date!), "dd/MM/yyyy")}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(payment.date!), { addSuffix: true })}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">₹{payment.amount}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {payment.method}
                            </Badge>
                          </TableCell>
                          <TableCell>{payment.notes || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}